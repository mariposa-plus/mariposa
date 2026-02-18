import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  startExecution,
  getExecution,
  getExecutionsByPipeline,
  cancelExecution,
  approveNodeExecution,
  rejectNodeExecution,
  getExecutionStats,
} from '../controllers/executionController';

const router = Router();

// All routes require authentication
router.use(protect);

// Start execution
router.post('/start', startExecution);

// Get execution stats for a pipeline
router.get('/stats/:pipelineId', getExecutionStats);

// Get executions by pipeline
router.get('/pipeline/:pipelineId', getExecutionsByPipeline);

// Get single execution
router.get('/:executionId', getExecution);

// Cancel execution
router.delete('/:executionId', cancelExecution);

// Approve node execution
router.post('/:executionId/approve/:nodeId', approveNodeExecution);

// Reject node execution
router.post('/:executionId/reject/:nodeId', rejectNodeExecution);

export default router;
