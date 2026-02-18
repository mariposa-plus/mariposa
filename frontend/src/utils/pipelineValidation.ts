import { Node, Edge } from 'reactflow';
import { NodeType } from '@/types';
import { getComponentById } from '@/registry';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  id: string;
  type: 'trigger' | 'connection' | 'config';
  message: string;
  nodeId?: string;
}

export interface ValidationWarning {
  id: string;
  type: 'trigger' | 'disconnected' | 'config';
  message: string;
  nodeId?: string;
}

/**
 * Check if a node is a trigger node using the component registry
 */
export function isTriggerNode(nodeType: NodeType): boolean {
  const component = getComponentById(nodeType);
  return component?.isTrigger === true;
}

/**
 * Validate a pipeline for errors and warnings
 */
export function validatePipeline(nodes: Node[], edges: Edge[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (nodes.length === 0) {
    return {
      isValid: false,
      errors: [
        {
          id: 'no-nodes',
          type: 'connection',
          message: 'Pipeline must have at least one node',
        },
      ],
      warnings: [],
    };
  }

  // Find all trigger nodes
  const triggerNodes = nodes.filter((node) => isTriggerNode(node.type as NodeType));

  // Warning: No trigger nodes found
  if (triggerNodes.length === 0) {
    warnings.push({
      id: 'no-triggers',
      type: 'trigger',
      message: 'Pipeline has no trigger nodes. Add a trigger to enable automatic execution.',
    });
  }

  // Check each node
  nodes.forEach((node) => {
    const nodeType = node.type as NodeType;
    const isTrigger = isTriggerNode(nodeType);

    // Error: Trigger nodes should not have incoming edges
    if (isTrigger) {
      const incomingEdges = edges.filter((edge) => edge.target === node.id);
      if (incomingEdges.length > 0) {
        errors.push({
          id: `trigger-has-input-${node.id}`,
          type: 'trigger',
          message: `Trigger node "${node.data.label}" cannot have incoming connections. Triggers are pipeline entry points.`,
          nodeId: node.id,
        });
      }
    }

    // Warning: Non-trigger nodes with no incoming edges (disconnected)
    if (!isTrigger) {
      const incomingEdges = edges.filter((edge) => edge.target === node.id);
      const outgoingEdges = edges.filter((edge) => edge.source === node.id);

      // Node is disconnected if it has no incoming AND no outgoing edges
      if (incomingEdges.length === 0 && outgoingEdges.length === 0) {
        warnings.push({
          id: `disconnected-${node.id}`,
          type: 'disconnected',
          message: `Node "${node.data.label}" is not connected to the pipeline`,
          nodeId: node.id,
        });
      }

      // Warning: Node has outgoing but no incoming (orphaned start)
      if (incomingEdges.length === 0 && outgoingEdges.length > 0) {
        warnings.push({
          id: `no-input-${node.id}`,
          type: 'disconnected',
          message: `Node "${node.data.label}" has no input connection. Consider adding a trigger or connecting it to another node.`,
          nodeId: node.id,
        });
      }
    }
  });

  // Check for orphaned edges (edges pointing to non-existent nodes)
  const nodeIds = new Set(nodes.map((n) => n.id));
  edges.forEach((edge) => {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      errors.push({
        id: `orphaned-edge-${edge.id}`,
        type: 'connection',
        message: 'Invalid connection detected. Please remove and reconnect.',
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get a summary message for validation results
 */
export function getValidationSummary(result: ValidationResult): string {
  if (result.isValid && result.warnings.length === 0) {
    return 'Pipeline is valid';
  }

  if (!result.isValid) {
    return `${result.errors.length} error${result.errors.length !== 1 ? 's' : ''} found`;
  }

  return `${result.warnings.length} warning${result.warnings.length !== 1 ? 's' : ''}`;
}

/**
 * Filter nodes to get only trigger nodes
 */
export function getTriggerNodes(nodes: Node[]): Node[] {
  return nodes.filter((node) => isTriggerNode(node.type as NodeType));
}

/**
 * Check if a pipeline can be executed (has at least one trigger)
 */
export function canExecutePipeline(nodes: Node[]): boolean {
  return getTriggerNodes(nodes).length > 0;
}
