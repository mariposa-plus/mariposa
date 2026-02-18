import mongoose, { Document, Schema } from 'mongoose';

export type TestMode = 'validation' | 'dry-run' | 'test' | 'live';
export type TestStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
export type NodeTestStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

interface NodeTestResult {
  nodeId: string;
  nodeType: string;
  nodeLabel: string;
  status: NodeTestStatus;
  output?: any;
  error?: string;
  transactionId?: string; // On-chain transaction ID
  transactionUrl?: string; // Block explorer URL
  startedAt?: Date;
  finishedAt?: Date;
  duration?: number; // milliseconds
  logs: string[]; // Execution logs for this node
}

interface TestOverrides {
  amounts?: Record<string, number>; // Override amounts per node: { nodeId: amount }
  chainId?: number; // Override chain ID
}

interface ValidationError {
  nodeId?: string;
  type: 'configuration' | 'connection' | 'balance' | 'permission';
  message: string;
  severity: 'error' | 'warning';
}

export interface ITestExecution extends Document {
  pipelineId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  testMode: TestMode;
  status: TestStatus;

  // Results
  nodeResults: NodeTestResult[];
  validationErrors: ValidationError[];

  // Overrides for test mode
  overrides: TestOverrides;

  // Metrics
  progress: number; // 0-100
  currentNodeId?: string;
  totalNodes: number;
  completedNodes: number;
  totalCost?: number; // Total gas spent
  estimatedCost?: number; // For dry-run mode

  // Timing
  startedAt?: Date;
  finishedAt?: Date;
  duration?: number; // milliseconds

  // Logs
  executionLogs: string[]; // Overall execution logs

  createdAt: Date;
  updatedAt: Date;
}

const nodeTestResultSchema = new Schema({
  nodeId: { type: String, required: true },
  nodeType: { type: String, required: true },
  nodeLabel: String,
  status: {
    type: String,
    enum: ['pending', 'running', 'success', 'failed', 'skipped'],
    default: 'pending',
  },
  output: Schema.Types.Mixed,
  error: String,
  transactionId: String,
  transactionUrl: String,
  startedAt: Date,
  finishedAt: Date,
  duration: Number,
  logs: [String],
}, { _id: false });

const validationErrorSchema = new Schema({
  nodeId: String,
  type: {
    type: String,
    enum: ['configuration', 'connection', 'balance', 'permission'],
    required: true,
  },
  message: { type: String, required: true },
  severity: {
    type: String,
    enum: ['error', 'warning'],
    default: 'error',
  },
}, { _id: false });

const testExecutionSchema = new Schema<ITestExecution>(
  {
    pipelineId: {
      type: Schema.Types.ObjectId,
      ref: 'Pipeline',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    testMode: {
      type: String,
      enum: ['validation', 'dry-run', 'test', 'live'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'success', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    nodeResults: [nodeTestResultSchema],
    validationErrors: [validationErrorSchema],
    overrides: {
      amounts: {
        type: Map,
        of: Number,
      },
      chainId: {
        type: Number,
      },
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    currentNodeId: String,
    totalNodes: {
      type: Number,
      default: 0,
    },
    completedNodes: {
      type: Number,
      default: 0,
    },
    totalCost: Number,
    estimatedCost: Number,
    startedAt: Date,
    finishedAt: Date,
    duration: Number,
    executionLogs: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding tests by pipeline
testExecutionSchema.index({ pipelineId: 1, createdAt: -1 });

// Index for finding user's tests
testExecutionSchema.index({ userId: 1, status: 1 });

export default mongoose.model<ITestExecution>('TestExecution', testExecutionSchema);
