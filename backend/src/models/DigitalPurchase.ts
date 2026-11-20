import mongoose, { Document, Schema } from 'mongoose';

export interface IDigitalPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  accessStatus: 'active' | 'revoked';
  purchasedAt: Date;
}

const digitalPurchaseSchema = new Schema<IDigitalPurchase>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    accessStatus: { type: String, enum: ['active', 'revoked'], default: 'active' },
    purchasedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

digitalPurchaseSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export const DigitalPurchase = mongoose.model<IDigitalPurchase>('DigitalPurchase', digitalPurchaseSchema);
