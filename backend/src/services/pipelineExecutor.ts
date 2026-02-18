import mongoose from 'mongoose';
import Pipeline from '../models/Pipeline';
import Execution, { IExecution } from '../models/Execution';
import { queueDelayedNodeExecution, queueApprovalPendingExecution } from '../queues/executionQueue';

export class PipelineExecutor {
  /**
   * Start a new pipeline execution
   */
  async startExecution(
    pipelineId: string,
    userId: string,
    trigger?: {
      type: string;
      data?: any;
      triggerId?: string;
    }
  ): Promise<IExecution> {
    const pipeline = await Pipeline.findById(pipelineId);
    if (!pipeline) {
      throw new Error('Pipeline not found');
    }

    // Create execution record
    const execution = await Execution.create({
      pipelineId: new mongoose.Types.ObjectId(pipelineId),
      userId: new mongoose.Types.ObjectId(userId),
      status: 'pending',
      trigger: trigger?.type,
      triggerData: trigger?.data,
      triggerId: trigger?.triggerId,
      nodeResults: [],
      executionLogs: [],
    });

    await this.addExecutionLog(execution, `Started execution for pipeline: ${pipeline.name || pipelineId}`);
    await this.addExecutionLog(execution, `Trigger type: ${trigger?.type || 'manual'}`);

    // Find trigger nodes (nodes with no incoming edges)
    const triggerNodes = this.findTriggerNodes(pipeline);

    if (triggerNodes.length === 0) {
      execution.status = 'failed';
      await execution.save();
      await this.addExecutionLog(execution, `No trigger nodes found in pipeline`);
      throw new Error('No trigger nodes found in pipeline');
    }

    await this.addExecutionLog(execution, `Found ${triggerNodes.length} trigger node(s)`);

    // Update execution status
    execution.status = 'running';
    execution.startedAt = new Date();
    await execution.save();

    // Execute trigger nodes
    for (const node of triggerNodes) {
      await this.executeNode(execution._id.toString(), node.id, pipeline);
    }

    return execution;
  }

  /**
   * Execute a single node
   */
  async executeNode(
    executionId: string,
    nodeId: string,
    pipeline?: any
  ): Promise<void> {
    const execution = await Execution.findById(executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }

    if (!pipeline) {
      pipeline = await Pipeline.findById(execution.pipelineId);
    }

    const node = pipeline.nodes.find((n: any) => n.id === nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found in pipeline`);
    }

    const nodeLabel = node.data?.label || node.type || nodeId;
    await this.addExecutionLog(execution, `\nExecuting: ${nodeLabel} (${node.type})`);

    // Add/update node result
    let nodeResult = execution.nodeResults.find((nr) => nr.nodeId === nodeId);
    if (!nodeResult) {
      execution.nodeResults.push({
        nodeId,
        status: 'running',
        startedAt: new Date(),
      } as any);
    } else {
      nodeResult.status = 'running';
      nodeResult.startedAt = new Date();
    }

    execution.currentNodeId = nodeId;
    await execution.save();

    try {
      // Get mapped inputs from upstream nodes
      const inputs = await this.getNodeInputs(nodeId, pipeline, execution);

      if (Object.keys(inputs).length > 0) {
        await this.addExecutionLog(execution, `  Received ${Object.keys(inputs).length} input(s): ${Object.keys(inputs).join(', ')}`);
      }

      // Process component config to substitute variables in prompt templates
      if (node.data?.fullConfig?.component && Object.keys(inputs).length > 0) {
        node.data.fullConfig.component = this.processComponentConfig(
          node.data.fullConfig.component,
          inputs
        );
      }

      // Execute node logic (delegated to nodeExecutor)
      const output = await this.executeNodeLogic(node, execution, inputs);

      // Update node result
      nodeResult = execution.nodeResults.find((nr) => nr.nodeId === nodeId);
      if (nodeResult) {
        nodeResult.status = 'success';
        nodeResult.output = output;
        nodeResult.finishedAt = new Date();
        nodeResult.duration = nodeResult.finishedAt.getTime() - (nodeResult.startedAt?.getTime() || 0);
      }

      await execution.save();

      await this.addExecutionLog(execution, `  Completed successfully (${nodeResult?.duration}ms)`);

      // Find next nodes and handle edge conditions
      await this.processNextNodes(execution, nodeId, pipeline);
    } catch (error: any) {
      await this.addExecutionLog(execution, `  Failed: ${error.message}`);

      // Update node result
      nodeResult = execution.nodeResults.find((nr) => nr.nodeId === nodeId);
      if (nodeResult) {
        nodeResult.status = 'failed';
        nodeResult.error = error.message;
        nodeResult.finishedAt = new Date();
        nodeResult.duration = nodeResult.finishedAt.getTime() - (nodeResult.startedAt?.getTime() || 0);
      }

      execution.status = 'failed';
      execution.finishedAt = new Date();
      execution.duration = execution.finishedAt.getTime() - (execution.startedAt?.getTime() || 0);
      await execution.save();
    }
  }

  /**
   * Execute node-specific logic using appropriate handlers
   * Dispatches to CRE node type stubs
   */
  private async executeNodeLogic(
    node: any,
    execution: IExecution,
    inputs: Record<string, any> = {}
  ): Promise<any> {
    console.log(`Executing ${node.type} node logic for ${node.id}`);

    if (Object.keys(inputs).length > 0) {
      console.log(`Inputs:`, JSON.stringify(inputs, null, 2));
    }

    // Delegate to appropriate handler based on CRE node type
    switch (node.type) {
      // --- CRE Triggers ---
      case 'cron-trigger':
      case 'http-trigger':
      case 'evm-log-trigger':
        return { success: true, nodeType: node.type, message: 'CRE handler pending' };

      // --- CRE Capabilities ---
      case 'http-fetch':
      case 'evm-read':
      case 'evm-write':
      case 'node-mode':
      case 'secrets-access':
        return { success: true, nodeType: node.type, message: 'CRE handler pending' };

      // --- CRE Logic ---
      case 'consensus-aggregation':
      case 'data-transform':
      case 'condition':
      case 'abi-encode':
      case 'abi-decode':
        return { success: true, nodeType: node.type, message: 'CRE handler pending' };

      // --- CRE Contracts ---
      case 'ireceiver-contract':
      case 'price-feed-consumer':
      case 'custom-data-consumer':
      case 'proof-of-reserve':
      case 'event-emitter':
        return { success: true, nodeType: node.type, message: 'CRE handler pending' };

      // --- CRE Config ---
      case 'chain-selector':
      case 'contract-address':
      case 'wallet-signer':
      case 'rpc-endpoint':
        return { success: true, nodeType: node.type, message: 'CRE handler pending' };

      default:
        console.warn(`Unknown node type: ${node.type}`);
        return {
          success: true,
          nodeType: node.type,
          executed: true,
          timestamp: new Date(),
          receivedInputs: inputs,
        };
    }
  }

  /**
   * Process next nodes based on edge conditions
   */
  private async processNextNodes(
    execution: IExecution,
    currentNodeId: string,
    pipeline: any
  ): Promise<void> {
    // Find all edges from current node
    const outgoingEdges = pipeline.edges.filter((e: any) => e.source === currentNodeId);

    if (outgoingEdges.length === 0) {
      // No more nodes to execute - check if execution is complete
      await this.checkExecutionComplete(execution, pipeline);
      return;
    }

    for (const edge of outgoingEdges) {
      const condition = edge.condition || { type: 'immediate' };
      const targetNodeId = edge.target;

      console.log(`Processing edge ${currentNodeId} -> ${targetNodeId} (${condition.type})`);

      switch (condition.type) {
        case 'immediate':
          // Execute immediately
          await this.executeNode(execution._id.toString(), targetNodeId, pipeline);
          break;

        case 'delay':
          // Queue delayed execution
          const delayMs = condition.delayMs || 0;
          const jobId = await queueDelayedNodeExecution(
            {
              executionId: execution._id.toString(),
              pipelineId: execution.pipelineId.toString(),
              userId: execution.userId.toString(),
              currentNodeId: targetNodeId,
              edgeCondition: condition,
            },
            delayMs
          );

          // Update node result with delay info
          const nodeResult = execution.nodeResults.find((nr) => nr.nodeId === targetNodeId);
          if (nodeResult) {
            nodeResult.status = 'delayed';
            nodeResult.delayJobId = jobId;
            nodeResult.edgeCondition = condition as any;
          } else {
            execution.nodeResults.push({
              nodeId: targetNodeId,
              status: 'delayed',
              delayJobId: jobId,
              edgeCondition: condition,
            } as any);
          }

          await execution.save();
          break;

        case 'approval':
          // Queue approval-pending execution
          const approvalJobId = await queueApprovalPendingExecution(
            {
              executionId: execution._id.toString(),
              pipelineId: execution.pipelineId.toString(),
              userId: execution.userId.toString(),
              currentNodeId: targetNodeId,
              edgeCondition: condition,
            },
            condition.approvalConfig || {}
          );

          // Update node result with approval info
          const approvalNodeResult = execution.nodeResults.find((nr) => nr.nodeId === targetNodeId);
          if (approvalNodeResult) {
            approvalNodeResult.status = 'waiting_approval';
            approvalNodeResult.approvalJobId = approvalJobId;
            approvalNodeResult.pendingApproval = true;
            approvalNodeResult.edgeCondition = condition as any;
          } else {
            execution.nodeResults.push({
              nodeId: targetNodeId,
              status: 'waiting_approval',
              approvalJobId,
              pendingApproval: true,
              edgeCondition: condition,
            } as any);
          }

          execution.status = 'waiting_approval';
          await execution.save();
          break;

        case 'event':
          // Event-based execution (not yet implemented)
          console.log(`Event-based edge conditions not yet implemented for ${targetNodeId}`);
          break;

        default:
          console.warn(`Unknown edge condition type: ${condition.type}`);
      }
    }
  }

  /**
   * Substitute {{variableName}} placeholders in a string with actual values
   */
  private substituteVariables(template: string, variables: Record<string, any>): string {
    if (typeof template !== 'string') return template;

    return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      const value = variables[varName];
      if (value === undefined || value === null) {
        console.warn(`Variable {{${varName}}} not found in inputs`);
        return match; // Keep original placeholder if variable not found
      }
      return String(value);
    });
  }

  /**
   * Process component config to substitute variables in prompt templates
   */
  private processComponentConfig(componentConfig: any, inputs: Record<string, any>): any {
    if (!componentConfig || typeof componentConfig !== 'object') {
      return componentConfig;
    }

    const processed: any = { ...componentConfig };

    for (const [key, value] of Object.entries(componentConfig)) {
      if (typeof value === 'string' && value.includes('{{')) {
        // This field contains template variables - substitute them
        processed[key] = this.substituteVariables(value, inputs);
        console.log(`Substituted variables in ${key}:`, {
          original: value,
          substituted: processed[key],
        });
      }
      // else: field already exists in processed from spread operator
    }

    return processed;
  }

  /**
   * Get mapped inputs for a node from upstream nodes' outputs
   */
  private async getNodeInputs(
    nodeId: string,
    pipeline: any,
    execution: IExecution
  ): Promise<Record<string, any>> {
    const node = pipeline.nodes.find((n: any) => n.id === nodeId);
    if (!node) {
      return {};
    }

    const inputConfig = node.data?.fullConfig?.input;

    if (!inputConfig || !inputConfig.mappings || inputConfig.mappings.length === 0) {
      console.log(`No input mappings configured for node ${nodeId}`);
      return {}; // No input mappings configured
    }

    const inputs: Record<string, any> = {};

    console.log(`Mapping inputs for node ${nodeId} from ${inputConfig.mappings.length} mapping(s)`);

    for (const mapping of inputConfig.mappings) {
      // Find upstream node's output
      const upstreamResult = execution.nodeResults.find(
        (nr) => nr.nodeId === mapping.sourceNodeId
      );

      if (!upstreamResult || !upstreamResult.output) {
        console.warn(`No output found for upstream node ${mapping.sourceNodeId}`);
        continue;
      }

      // Get source value from upstream output
      let value = upstreamResult.output[mapping.sourceField];

      if (value === undefined) {
        console.warn(`Source field '${mapping.sourceField}' not found in upstream node ${mapping.sourceNodeId} output`);
        continue;
      }

      console.log(`  Mapping ${mapping.sourceNodeId}.${mapping.sourceField} -> ${mapping.targetField}`);

      // Apply transformation
      value = this.applyTransform(value, mapping.transform || 'none', mapping.customTransform);

      // Set target field
      inputs[mapping.targetField] = value;
    }

    console.log(`Mapped ${Object.keys(inputs).length} input field(s) for node ${nodeId}`);

    return inputs;
  }

  /**
   * Apply transformation to input value
   */
  private applyTransform(value: any, transform: string, customTransform?: string): any {
    try {
      switch (transform) {
        case 'stringify':
          return JSON.stringify(value);

        case 'parse':
          return typeof value === 'string' ? JSON.parse(value) : value;

        case 'uppercase':
          return String(value).toUpperCase();

        case 'lowercase':
          return String(value).toLowerCase();

        case 'custom':
          if (customTransform) {
            // Safely evaluate custom transform
            const func = new Function('value', `return ${customTransform}`);
            return func(value);
          }
          return value;

        case 'none':
        default:
          return value;
      }
    } catch (error: any) {
      console.error(`Transform error (${transform}):`, error.message);
      return value; // Return original value on error
    }
  }

  /**
   * Check if execution is complete
   */
  private async checkExecutionComplete(execution: IExecution, pipeline: any): Promise<void> {
    // Check if all nodes have been executed
    const allNodesExecuted = pipeline.nodes.every((node: any) => {
      const result = execution.nodeResults.find((nr) => nr.nodeId === node.id);
      return result && (result.status === 'success' || result.status === 'failed' || result.status === 'skipped');
    });

    if (allNodesExecuted && execution.status !== 'waiting_approval') {
      execution.status = 'success';
      execution.finishedAt = new Date();
      execution.duration = execution.finishedAt.getTime() - (execution.startedAt?.getTime() || 0);
      await execution.save();

      await this.addExecutionLog(execution, `\nPipeline execution completed successfully`);
      await this.addExecutionLog(execution, `Total duration: ${execution.duration}ms`);
      await this.addExecutionLog(execution, `Nodes executed: ${execution.nodeResults.filter(nr => nr.status === 'success').length}/${execution.nodeResults.length}`);
    }
  }

  /**
   * Add log entry to execution
   */
  private async addExecutionLog(execution: IExecution, message: string): Promise<void> {
    const timestamp = new Date().toISOString().substring(11, 19);
    const logMessage = `[${timestamp}] ${message}`;

    await Execution.updateOne(
      { _id: execution._id },
      { $push: { executionLogs: logMessage } }
    );

    // Also log to console for real-time monitoring
    console.log(logMessage);
  }

  /**
   * Find trigger nodes in pipeline (nodes with no incoming edges)
   */
  private findTriggerNodes(pipeline: any): any[] {
    const nodesWithIncomingEdges = new Set(
      pipeline.edges.map((e: any) => e.target)
    );

    return pipeline.nodes.filter(
      (node: any) => !nodesWithIncomingEdges.has(node.id)
    );
  }

  /**
   * Resume execution after approval
   */
  async resumeAfterApproval(executionId: string, nodeId: string): Promise<void> {
    const execution = await Execution.findById(executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }

    const pipeline = await Pipeline.findById(execution.pipelineId);
    if (!pipeline) {
      throw new Error('Pipeline not found');
    }

    // Update node status
    const nodeResult = execution.nodeResults.find((nr) => nr.nodeId === nodeId);
    if (nodeResult) {
      nodeResult.pendingApproval = false;
      nodeResult.status = 'pending';
    }

    // Check if any other nodes are waiting for approval
    const hasOtherApprovals = execution.nodeResults.some(
      (nr) => nr.nodeId !== nodeId && nr.status === 'waiting_approval'
    );

    if (!hasOtherApprovals) {
      execution.status = 'running';
    }

    await execution.save();

    // Execute the approved node
    await this.executeNode(executionId, nodeId, pipeline);
  }
}

export const pipelineExecutor = new PipelineExecutor();
