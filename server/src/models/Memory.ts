import mongoose, { Document, Schema } from 'mongoose';

export interface IMemory extends Document {
  title: string;
  caption: string;
  description: string;
  date: Date;
  location: string;
  imageUrl: string;
  thumbnailUrl: string;
  publicId: string;
  isFavorite: boolean;
  tags: string[];
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
}

const MemorySchema = new Schema<IMemory>(
  {
    title: { type: String, required: true, trim: true },
    caption: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    date: { type: Date, default: Date.now },
    location: { type: String, default: '', trim: true },
    imageUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: '' },
    publicId: { type: String, required: true },
    isFavorite: { type: Boolean, default: false },
    tags: [{ type: String }],
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Memory = mongoose.model<IMemory>('Memory', MemorySchema);
