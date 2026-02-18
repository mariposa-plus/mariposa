import { Queue } from 'bullmq';
import { defaultQueueOptions } from './config';

export interface DelayJobData {
  executionId: string;
  nodeId: string;
  delayMs: number;
  scheduledFor: Date;
}

export const delayQueue = new Queue<DelayJobData>('delayed-execution', defaultQueueOptions);

/**
 * Schedule a delayed node execution
 */
export const scheduleDelayedExecution = async (
  executionId: string,
  nodeId: string,
  delayMs: number
): Promise<string> => {
  const scheduledFor = new Date(Date.now() + delayMs);

  const job = await delayQueue.add(
    'delayed-node',
    {
      executionId,
      nodeId,
      delayMs,
      scheduledFor,
    },
    {
      delay: delayMs,
      jobId: `delay-${executionId}-${nodeId}-${Date.now()}`,
    }
  );

  console.log(
    `⏰ Scheduled delayed execution: ${executionId} -> ${nodeId} (delay: ${delayMs}ms, at: ${scheduledFor.toISOString()})`
  );

  return job.id || '';
};

/**
 * Cancel a scheduled delay
 */
export const cancelDelayedExecution = async (jobId: string): Promise<void> => {
  const job = await delayQueue.getJob(jobId);
  if (job) {
    await job.remove();
    console.log(`❌ Cancelled delayed execution: ${jobId}`);
  }
};

/**
 * Get all scheduled delays for an execution
 */
export const getScheduledDelays = async (executionId: string): Promise<any[]> => {
  const jobs = await delayQueue.getJobs(['delayed', 'waiting']);
  return jobs.filter((job) => job.data.executionId === executionId);
};

export default delayQueue;
