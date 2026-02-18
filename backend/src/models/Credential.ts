import mongoose, { Document, Schema } from 'mongoose';

export type CredentialType = 'claude' | 'openai' | 'together' | 'groq' | 'smtp' | 'evm-wallet' | 'rpc-provider';

export interface ICredential extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: CredentialType;
  encryptedData: string; // AES-256 encrypted credential data
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const credentialSchema = new Schema<ICredential>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['claude', 'openai', 'together', 'groq', 'smtp', 'evm-wallet', 'rpc-provider'],
      required: true,
    },
    encryptedData: {
      type: String,
      required: true,
    },
    lastUsedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICredential>('Credential', credentialSchema);
