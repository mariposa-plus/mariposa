import mongoose, { Document, Schema } from 'mongoose';

export interface ICREProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  workspacePath: string;
  status: 'created' | 'ready' | 'simulating' | 'error';
  errorMessage?: string;
  lastSimulatedAt?: Date;
  simulationLogs?: string[];
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
      enum: ['created', 'ready', 'simulating', 'error'],
      default: 'created',
    },
    errorMessage: String,
    lastSimulatedAt: Date,
    simulationLogs: [String],
  },
  {
    timestamps: true,
  }
);

CREProjectSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model<ICREProject>('CREProject', CREProjectSchema);
