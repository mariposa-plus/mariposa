import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Execution from '../models/Execution';
import { queuePipelineExecution } from '../queues/executionQueue';
import { pipelineExecutor } from '../services/pipelineExecutor';
import { resumeApprovedExecution } from '../queues/executionQueue';

/**
 * Start a new pipeline execution
 * @route POST /api/executions/start
 */
export const startExecution = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pipelineId, triggerType, triggerData } = req.body;
    const userId = req.user?._id;

    if (!pipelineId) {
      res.status(400).json({
        success: false,
        message: 'Pipeline ID is required',
      });
      return;
    }

    // Create execution record
    const execution = await Execution.create({
      pipelineId,
      userId,
      status: 'pending',
      trigger: triggerType || 'manual',
      triggerData: triggerData || {},
    });

    // Queue execution
    await queuePipelineExecution({
      executionId: execution._id.toString(),
      pipelineId,
      userId: userId!.toString(),
      triggerType: triggerType || 'manual',
      triggerData,
    });

    res.status(201).json({
      success: true,
      data: execution,
      message: 'Execution started',
    });
  } catch (error: any) {
    console.error('Error starting execution:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start execution',
    });
  }
};

/**
 * Get execution by ID
 * @route GET /api/executions/:executionId
 */
export const getExecution = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { executionId } = req.params;

    const execution = await Execution.findById(executionId).populate('pipelineId', 'name');

    if (!execution) {
      res.status(404).json({
        success: false,
        message: 'Execution not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: execution,
    });
  } catch (error: any) {
    console.error('Error fetching execution:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch execution',
    });
  }
};

/**
 * Get all executions for a pipeline
 * @route GET /api/executions/pipeline/:pipelineId
 */
export const getExecutionsByPipeline = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pipelineId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const executions = await Execution.find({ pipelineId })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: executions,
      count: executions.length,
    });
  } catch (error: any) {
    console.error('Error fetching executions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch executions',
    });
  }
};

/**
 * Cancel a pending execution
 * @route DELETE /api/executions/:executionId
 */
export const cancelExecution = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { executionId } = req.params;

    const execution = await Execution.findById(executionId);

    if (!execution) {
      res.status(404).json({
        success: false,
        message: 'Execution not found',
      });
      return;
    }

    if (execution.status !== 'pending' && execution.status !== 'waiting_approval') {
      res.status(400).json({
        success: false,
        message: 'Can only cancel pending or waiting executions',
      });
      return;
    }

    execution.status = 'cancelled';
    execution.finishedAt = new Date();
    await execution.save();

    res.status(200).json({
      success: true,
      data: execution,
      message: 'Execution cancelled',
    });
  } catch (error: any) {
    console.error('Error cancelling execution:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel execution',
    });
  }
};

/**
 * Approve a pending node execution
 * @route POST /api/executions/:executionId/approve/:nodeId
 */
export const approveNodeExecution = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { executionId, nodeId } = req.params;
    const { approvalMessage } = req.body;

    const execution = await Execution.findById(executionId);

    if (!execution) {
      res.status(404).json({
        success: false,
        message: 'Execution not found',
      });
      return;
    }

    const nodeResult = execution.nodeResults.find((nr) => nr.nodeId === nodeId);

    if (!nodeResult || !nodeResult.pendingApproval) {
      res.status(400).json({
        success: false,
        message: 'Node is not pending approval',
      });
      return;
    }

    // Resume execution by removing delay from approval job
    if (nodeResult.approvalJobId) {
      await resumeApprovedExecution(nodeResult.approvalJobId);
    }

    // Update execution record
    nodeResult.pendingApproval = false;
    nodeResult.output = {
      ...nodeResult.output,
      approvalMessage,
      approvedAt: new Date(),
      approvedBy: req.user?._id,
    };

    await execution.save();

    res.status(200).json({
      success: true,
      data: execution,
      message: 'Node execution approved',
    });
  } catch (error: any) {
    console.error('Error approving execution:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to approve execution',
    });
  }
};

/**
 * Reject a pending node execution
 * @route POST /api/executions/:executionId/reject/:nodeId
 */
export const rejectNodeExecution = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { executionId, nodeId } = req.params;
    const { rejectionReason } = req.body;

    const execution = await Execution.findById(executionId);

    if (!execution) {
      res.status(404).json({
        success: false,
        message: 'Execution not found',
      });
      return;
    }

    const nodeResult = execution.nodeResults.find((nr) => nr.nodeId === nodeId);

    if (!nodeResult || !nodeResult.pendingApproval) {
      res.status(400).json({
        success: false,
        message: 'Node is not pending approval',
      });
      return;
    }

    // Update node result
    nodeResult.pendingApproval = false;
    nodeResult.status = 'failed';
    nodeResult.error = rejectionReason || 'Execution rejected';

    // Update execution status
    execution.status = 'failed';
    execution.finishedAt = new Date();

    await execution.save();

    res.status(200).json({
      success: true,
      data: execution,
      message: 'Node execution rejected',
    });
  } catch (error: any) {
    console.error('Error rejecting execution:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject execution',
    });
  }
};

/**
 * Get execution statistics for a pipeline
 * @route GET /api/executions/stats/:pipelineId
 */
export const getExecutionStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pipelineId } = req.params;

    const stats = await Execution.aggregate([
      { $match: { pipelineId: pipelineId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
        },
      },
    ]);

    const totalExecutions = await Execution.countDocuments({ pipelineId });
    const lastExecution = await Execution.findOne({ pipelineId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        total: totalExecutions,
        byStatus: stats,
        lastExecution,
      },
    });
  } catch (error: any) {
    console.error('Error fetching execution stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch execution stats',
    });
  }
};
