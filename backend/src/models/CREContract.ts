import mongoose, { Document, Schema } from 'mongoose';

export interface ICREContract extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  nodeId: string;
  contractName: string;
  soliditySource: string;
  abi?: any[];
  bytecode?: string;
  deployedAddress?: string;
  network?: string;
  deployedTxHash?: string;
  compilationErrors?: string[];
  status: 'draft' | 'compiling' | 'compiled' | 'deploying' | 'deployed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const CREContractSchema = new Schema<ICREContract>(
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
    nodeId: {
      type: String,
      required: true,
    },
    contractName: {
      type: String,
      required: true,
      trim: true,
    },
    soliditySource: {
      type: String,
      required: true,
    },
    abi: Schema.Types.Mixed,
    bytecode: String,
    deployedAddress: String,
    network: String,
    deployedTxHash: String,
    compilationErrors: [String],
    status: {
      type: String,
      enum: ['draft', 'compiling', 'compiled', 'deploying', 'deployed', 'failed'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

CREContractSchema.index({ projectId: 1, nodeId: 1 }, { unique: true });

export default mongoose.model<ICREContract>('CREContract', CREContractSchema);
