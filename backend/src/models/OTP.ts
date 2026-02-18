import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const otpSchema = new Schema<IOTP>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// TTL index - MongoDB will automatically delete documents after expiration
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOTP>('OTP', otpSchema);
