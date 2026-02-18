import express from 'express';
import {
  getPipelines,
  createPipeline,
  getPipeline,
  updatePipeline,
  deletePipeline,
  duplicatePipeline,
} from '../controllers/pipelineController';
import {
  activatePipeline,
  deactivatePipeline,
  getPipelineStatus,
} from '../controllers/pipelineLifecycleController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All pipeline routes require authentication
router.use(protect);

router.get('/', getPipelines);
router.post('/', createPipeline);
router.get('/:id', getPipeline);
router.put('/:id', updatePipeline);
router.delete('/:id', deletePipeline);
router.post('/:id/duplicate', duplicatePipeline);

// Pipeline lifecycle management
router.post('/:pipelineId/activate', activatePipeline);
router.post('/:pipelineId/deactivate', deactivatePipeline);
router.get('/:pipelineId/status', getPipelineStatus);

export default router;
