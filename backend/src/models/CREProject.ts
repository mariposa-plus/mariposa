import mongoose, { Document, Schema } from 'mongoose';

export interface ICREProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  workspacePath: string;
  status: 'created' | 'ready' | 'simulating' | 'deploying' | 'error';
  errorMessage?: string;
  lastSimulatedAt?: Date;
  simulationLogs?: string[];
  deploymentStatus: 'none' | 'access-requested' | 'access-granted' | 'deploying' | 'deployed' | 'deploy-failed';
  deploymentLogs?: string[];
  lastDeployedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CREProjectSchema = new Schema<ICREProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    workspacePath: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['created', 'ready', 'simulating', 'deploying', 'error'],
      default: 'created',
    },
    errorMessage: String,
    lastSimulatedAt: Date,
    simulationLogs: [String],
    deploymentStatus: {
      type: String,
      enum: ['none', 'access-requested', 'access-granted', 'deploying', 'deployed', 'deploy-failed'],
      default: 'none',
    },
    deploymentLogs: [String],
    lastDeployedAt: Date,
  },
  {
    timestamps: true,
  }
);

CREProjectSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model<ICREProject>('CREProject', CREProjectSchema);
