import { Worker, Job } from 'bullmq';
import { redisConnection } from '../queues/config';
import { ExecutionJobData } from '../queues/executionQueue';
import { pipelineExecutor } from '../services/pipelineExecutor';

/**
 * Worker for processing pipeline execution jobs
 */
export const executionWorker = new Worker<ExecutionJobData>(
  'pipeline-execution',
  async (job: Job<ExecutionJobData>) => {
    const { executionId, pipelineId, userId, currentNodeId, triggerType, triggerData, triggerId } = job.data;

    console.log(`🔄 Processing execution job: ${job.name} (ID: ${job.id})`);

    try {
      if (job.name === 'execute-pipeline') {
        // Start new pipeline execution
        await pipelineExecutor.startExecution(pipelineId, userId, {
          type: triggerType || 'manual',
          data: triggerData,
          triggerId,
        });
      } else if (job.name === 'execute-delayed-node') {
        // Execute delayed node
        if (currentNodeId) {
          await pipelineExecutor.executeNode(executionId, currentNodeId);
        }
      } else if (job.name === 'execute-approval-pending') {
        // This job waits in queue until approved
        // Actual execution happens when resumeAfterApproval is called
        if (currentNodeId) {
          await pipelineExecutor.executeNode(executionId, currentNodeId);
        }
      }

      console.log(`✅ Execution job completed: ${job.id}`);
      return { success: true, executionId };
    } catch (error: any) {
      console.error(`❌ Execution job failed: ${job.id}`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 executions concurrently
    limiter: {
      max: 10, // Max 10 jobs
      duration: 1000, // per second
    },
  }
);

// Event handlers
executionWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

executionWorker.on('failed', (job, error) => {
  console.error(`❌ Job ${job?.id} failed:`, error.message);
});

executionWorker.on('error', (error) => {
  console.error('❌ Execution worker error:', error);
});

console.log('⚙️  Execution worker started');

export default executionWorker;
