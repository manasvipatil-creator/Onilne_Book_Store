import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  title: string;
  slug: string;
  author: string;
  description: string;
  categoryId: mongoose.Types.ObjectId;
  publisher: string;
  isbn: string;
  language: string;
  pages: number;
  type: 'physical' | 'ebook';
  coverImage: string;
  pricing: {
    price: number;
    originalPrice: number;
    currency: string;
  };
  physical?: {
    stock: number;
    sku: string;
    weight?: number;
  };
  digital?: {
    fileKey: string;
    fileFormat: 'pdf' | 'epub';
    fileSize: number;
    downloadEnabled: boolean;
  };
  isFeatured: boolean;
  isBestSeller: boolean;
  status: 'published' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    publisher: { type: String, default: 'Independent Publishing' },
    isbn: { type: String, default: '' },
    language: { type: String, default: 'English' },
    pages: { type: Number, default: 0 },
    type: { type: String, enum: ['physical', 'ebook'], required: true },
    coverImage: { type: String, required: true },
    pricing: {
      price: { type: Number, required: true, min: 0 },
      originalPrice: { type: Number, required: true, min: 0 },
      currency: { type: String, default: 'INR' },
    },
    physical: {
      stock: { type: Number, default: 0, min: 0 },
      sku: { type: String, default: '' },
      weight: { type: Number, default: 0 },
    },
    digital: {
      fileKey: { type: String, default: '' },
      fileFormat: { type: String, enum: ['pdf', 'epub'], default: 'pdf' },
      fileSize: { type: Number, default: 0 },
      downloadEnabled: { type: Boolean, default: true },
    },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    status: { type: String, enum: ['published', 'draft'], default: 'published' },
  },
  { timestamps: true }
);

bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ categoryId: 1, status: 1 });
bookSchema.index({ type: 1, status: 1 });

export const Book = mongoose.model<IBook>('Book', bookSchema);
