import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  createProject,
  listProjects,
  getProject,
  deleteProject,
  initProject,
  updateProjectConfig,
  updateSecrets,
  generateWorkflow,
  getWorkflowCode,
  saveContract,
  getContract,
  compileContract,
  deployContract,
  simulateWorkflow,
  getSimulationLogs,
  simulateByPipeline,
} from '../controllers/creController';

const router = Router();

// All CRE routes require authentication
router.use(protect);

// Projects
router.post('/projects', createProject);
router.get('/projects', listProjects);
router.get('/projects/:id', getProject);
router.delete('/projects/:id', deleteProject);
router.post('/projects/:id/init', initProject);
router.put('/projects/:id/config', updateProjectConfig);
router.put('/projects/:id/secrets', updateSecrets);
router.post('/projects/:id/simulate', simulateWorkflow);
router.get('/projects/:id/logs', getSimulationLogs);

// Workflows
router.post('/workflows/generate', generateWorkflow);
router.get('/workflows/:id/code', getWorkflowCode);

// Pipeline-based simulation (auto-resolves CRE project)
router.post('/pipelines/:pipelineId/simulate', simulateByPipeline);

// Contracts
router.post('/contracts', saveContract);
router.get('/contracts/:id', getContract);
router.post('/contracts/:id/compile', compileContract);
router.post('/contracts/:id/deploy', deployContract);

export default router;
