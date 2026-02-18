import mongoose, { Document, Schema } from 'mongoose';

export interface ICREWorkflow extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  pipelineId: mongoose.Types.ObjectId;
  generatedCode?: string;
  generatedAt?: Date;
  workflowPath?: string;
  configPath?: string;
  status: 'pending' | 'generated' | 'valid' | 'invalid';
  validationErrors?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CREWorkflowSchema = new Schema<ICREWorkflow>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'CREProject',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pipelineId: {
      type: Schema.Types.ObjectId,
      ref: 'Pipeline',
      required: true,
    },
    generatedCode: String,
    generatedAt: Date,
    workflowPath: String,
    configPath: String,
    status: {
      type: String,
      enum: ['pending', 'generated', 'valid', 'invalid'],
      default: 'pending',
    },
    validationErrors: [String],
  },
  {
    timestamps: true,
  }
);

CREWorkflowSchema.index({ projectId: 1, pipelineId: 1 }, { unique: true });

export default mongoose.model<ICREWorkflow>('CREWorkflow', CREWorkflowSchema);
