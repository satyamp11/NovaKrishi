import mongoose, { Schema, Document } from 'mongoose';

export type ReviewTag = 'on_time_payment' | 'late_payment' | 'no_show' | 'disputed_quality' | 'excellent_communication' | 'poor_communication' | 'good_quality';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  revieweeId: mongoose.Types.ObjectId;
  reviewerRole: 'farmer' | 'consumer' | 'bulk_buyer';
  rating: number; // 1-5
  comment?: string;
  tags: ReviewTag[];
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    revieweeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewerRole: {
      type: String,
      enum: ['farmer', 'consumer', 'bulk_buyer'],
      required: true
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    tags: [{
      type: String,
      enum: ['on_time_payment', 'late_payment', 'no_show', 'disputed_quality', 'excellent_communication', 'poor_communication', 'good_quality']
    }]
  },
  {
    timestamps: true
  }
);

// Ensure one review per order per reviewer
ReviewSchema.index({ orderId: 1, reviewerId: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
