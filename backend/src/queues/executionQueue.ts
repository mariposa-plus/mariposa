import { Queue } from 'bullmq';
import { defaultQueueOptions } from './config';

export interface ExecutionJobData {
  executionId: string;
  pipelineId: string;
  userId: string;
  triggerId?: string;
  triggerType?: string;
  triggerData?: any;
  currentNodeId?: string;
  edgeCondition?: {
    type: 'immediate' | 'delay' | 'event' | 'approval';
    config?: any;
  };
}

export const executionQueue = new Queue<ExecutionJobData>('pipeline-execution', defaultQueueOptions);

/**
 * Add a pipeline execution job to the queue
 */
export const queuePipelineExecution = async (data: ExecutionJobData): Promise<string> => {
  const job = await executionQueue.add('execute-pipeline', data, {
    jobId: data.executionId,
  });

  console.log(`✅ Queued pipeline execution: ${data.executionId}`);
  return job.id || data.executionId;
};

/**
 * Add a delayed node execution job
 */
export const queueDelayedNodeExecution = async (
  data: ExecutionJobData,
  delayMs: number
): Promise<string> => {
  const job = await executionQueue.add('execute-delayed-node', data, {
    delay: delayMs,
    jobId: `${data.executionId}-${data.currentNodeId}-${Date.now()}`,
  });

  console.log(`⏰ Queued delayed execution (${delayMs}ms): ${data.executionId} -> ${data.currentNodeId}`);
  return job.id || '';
};

/**
 * Add a node execution awaiting approval
 */
export const queueApprovalPendingExecution = async (
  data: ExecutionJobData,
  approvalConfig: any
): Promise<string> => {
  const job = await executionQueue.add('execute-approval-pending', data, {
    jobId: `approval-${data.executionId}-${data.currentNodeId}`,
    // Don't process until approved
    delay: 365 * 24 * 60 * 60 * 1000, // 1 year - effectively paused
  });

  console.log(`🔒 Queued approval-pending execution: ${data.executionId} -> ${data.currentNodeId}`);
  return job.id || '';
};

/**
 * Resume an approval-pending job
 */
export const resumeApprovedExecution = async (jobId: string): Promise<void> => {
  const job = await executionQueue.getJob(jobId);
  if (job) {
    await job.changeDelay(0); // Remove delay, execute immediately
    console.log(`✅ Resumed approved execution: ${jobId}`);
  }
};

/**
 * Cancel a pending job
 */
export const cancelPendingExecution = async (jobId: string): Promise<void> => {
  const job = await executionQueue.getJob(jobId);
  if (job) {
    await job.remove();
    console.log(`❌ Cancelled pending execution: ${jobId}`);
  }
};

export default executionQueue;
