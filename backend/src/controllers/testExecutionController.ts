import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { testExecutionService } from '../services/testExecution.service';
import { TestMode } from '../models/TestExecution';

/**
 * Start a new test execution
 * @route POST /api/executions/test
 */
export const startTestExecution = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pipelineId, mode, overrides } = req.body;
    const userId = req.user?._id;

    if (!pipelineId) {
      res.status(400).json({
        success: false,
        message: 'Pipeline ID is required',
      });
      return;
    }

    if (!mode || !['validation', 'dry-run', 'test', 'live'].includes(mode)) {
      res.status(400).json({
        success: false,
        message: 'Valid test mode is required (validation, dry-run, test, or live)',
      });
      return;
    }

    const result = await testExecutionService.startTest(
      pipelineId,
      userId!.toString(),
      mode as TestMode,
      overrides
    );

    if (result.status === 'validation-failed' || result.status === 'error') {
      res.status(400).json({
        success: false,
        message: result.status === 'validation-failed' ? 'Pipeline validation failed' : 'Test failed to start',
        errors: result.errors,
        executionId: result.executionId,
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: {
        executionId: result.executionId,
        status: result.status,
      },
      message: mode === 'validation' ? 'Validation complete' : 'Test execution started',
    });
  } catch (error: any) {
    console.error('Error starting test execution:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start test execution',
    });
  }
};

/**
 * Get test execution status
 * @route GET /api/executions/test/:executionId
 */
export const getTestExecutionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { executionId } = req.params;

    const testExecution = await testExecutionService.getTestStatus(executionId);

    if (!testExecution) {
      res.status(404).json({
        success: false,
        message: 'Test execution not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: testExecution,
    });
  } catch (error: any) {
    console.error('Error fetching test execution:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch test execution',
    });
  }
};

/**
 * Cancel test execution
 * @route DELETE /api/executions/test/:executionId
 */
export const cancelTestExecution = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { executionId } = req.params;

    await testExecutionService.cancelTest(executionId);

    res.status(200).json({
      success: true,
      message: 'Test execution cancelled',
    });
  } catch (error: any) {
    console.error('Error cancelling test execution:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel test execution',
    });
  }
};

/**
 * Get test execution history for a pipeline
 * @route GET /api/pipelines/:pipelineId/tests
 */
export const getTestHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pipelineId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const tests = await testExecutionService.getTestHistory(pipelineId, limit);

    // Calculate success rate
    const successCount = tests.filter((t) => t.status === 'success').length;
    const successRate = tests.length > 0 ? (successCount / tests.length) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        tests,
        totalTests: tests.length,
        successRate: Math.round(successRate),
      },
    });
  } catch (error: any) {
    console.error('Error fetching test history:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch test history',
    });
  }
};
