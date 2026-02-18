import express from 'express';
import { protect } from '../middleware/auth';
import {
  startTestExecution,
  getTestExecutionStatus,
  cancelTestExecution,
  getTestHistory,
} from '../controllers/testExecutionController';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/executions/test
 * @desc    Start a new test execution
 * @access  Private
 */
router.post('/test', startTestExecution);

/**
 * @route   GET /api/executions/test/:executionId
 * @desc    Get test execution status
 * @access  Private
 */
router.get('/test/:executionId', getTestExecutionStatus);

/**
 * @route   DELETE /api/executions/test/:executionId
 * @desc    Cancel test execution
 * @access  Private
 */
router.delete('/test/:executionId', cancelTestExecution);

/**
 * @route   GET /api/pipelines/:pipelineId/tests
 * @desc    Get test execution history for a pipeline
 * @access  Private
 */
router.get('/pipelines/:pipelineId/tests', getTestHistory);

export default router;
