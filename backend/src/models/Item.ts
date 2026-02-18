import mongoose, { Document, Schema } from 'mongoose';

export interface IItem extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<IItem>(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IItem>('Item', itemSchema);
