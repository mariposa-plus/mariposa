import mongoose, { Document, Schema } from 'mongoose';

export type ExecutionStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled' | 'waiting_approval';
export type NodeStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped' | 'waiting_approval' | 'delayed';
export type TriggerType = 'manual' | 'scheduler' | 'webhook' | 'cron-trigger' | 'http-trigger' | 'evm-log-trigger';
export type EdgeConditionType = 'immediate' | 'delay' | 'event' | 'approval';

interface EdgeCondition {
  type: EdgeConditionType;
  delayMs?: number;
  eventType?: string;
  eventConfig?: any;
  approvalConfig?: {
    required: boolean;
    approvers?: string[];
    minApprovals?: number;
  };
}

interface NodeResult {
  nodeId: string;
  status: NodeStatus;
  output?: any;
  error?: string;
  startedAt?: Date;
  finishedAt?: Date;
  duration?: number; // milliseconds
  edgeCondition?: EdgeCondition;
  pendingApproval?: boolean;
  approvalJobId?: string;
  delayJobId?: string;
}

export interface IExecution extends Document {
  pipelineId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: ExecutionStatus;
  trigger?: TriggerType;
  triggerData?: any;
  triggerId?: string;
  nodeResults: NodeResult[];
  currentNodeId?: string;
  startedAt?: Date;
  finishedAt?: Date;
  duration?: number; // milliseconds
  executionLogs: string[]; // Timestamped log messages for debugging
  createdAt: Date;
}

const executionSchema = new Schema<IExecution>({
  pipelineId: {
    type: Schema.Types.ObjectId,
    ref: 'Pipeline',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'success', 'failed', 'cancelled', 'waiting_approval'],
    default: 'pending',
  },
  trigger: {
    type: String,
    enum: ['manual', 'scheduler', 'webhook', 'cron-trigger', 'http-trigger', 'evm-log-trigger'],
  },
  triggerData: Schema.Types.Mixed,
  triggerId: String,
  nodeResults: [
    {
      nodeId: String,
      status: {
        type: String,
        enum: ['pending', 'running', 'success', 'failed', 'skipped', 'waiting_approval', 'delayed'],
      },
      output: Schema.Types.Mixed,
      error: String,
      startedAt: Date,
      finishedAt: Date,
      duration: Number,
      edgeCondition: {
        type: {
          type: String,
          enum: ['immediate', 'delay', 'event', 'approval'],
        },
        delayMs: Number,
        eventType: String,
        eventConfig: Schema.Types.Mixed,
        approvalConfig: {
          required: Boolean,
          approvers: [String],
          minApprovals: Number,
        },
      },
      pendingApproval: Boolean,
      approvalJobId: String,
      delayJobId: String,
    },
  ],
  currentNodeId: String,
  startedAt: {
    type: Date,
  },
  finishedAt: {
    type: Date,
  },
  duration: {
    type: Number,
  },
  executionLogs: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IExecution>('Execution', executionSchema);
