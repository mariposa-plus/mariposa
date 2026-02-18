import { Worker, Job } from 'bullmq';
import { redisConnection } from '../queues/config';
import { DelayJobData } from '../queues/delayQueue';
import { pipelineExecutor } from '../services/pipelineExecutor';

/**
 * Worker for processing delayed node executions
 */
export const delayWorker = new Worker<DelayJobData>(
  'delayed-execution',
  async (job: Job<DelayJobData>) => {
    const { executionId, nodeId } = job.data;

    console.log(`⏰ Processing delayed execution: ${executionId} -> ${nodeId}`);

    try {
      await pipelineExecutor.executeNode(executionId, nodeId);

      console.log(`✅ Delayed execution completed: ${executionId} -> ${nodeId}`);
      return { success: true, executionId, nodeId };
    } catch (error: any) {
      console.error(`❌ Delayed execution failed: ${executionId} -> ${nodeId}`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 10, // Process up to 10 delayed executions concurrently
  }
);

// Event handlers
delayWorker.on('completed', (job) => {
  console.log(`✅ Delay job ${job.id} completed`);
});

delayWorker.on('failed', (job, error) => {
  console.error(`❌ Delay job ${job?.id} failed:`, error.message);
});

delayWorker.on('error', (error) => {
  console.error('❌ Delay worker error:', error);
});

console.log('⏰ Delay worker started');

export default delayWorker;
