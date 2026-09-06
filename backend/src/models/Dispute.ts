import mongoose, { Schema, Document } from 'mongoose';

export type DisputeType = 'payment_delay' | 'non_payment' | 'quality_issue' | 'no_show' | 'other';
export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'rejected';

export interface IDispute extends Document {
  _id: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  raisedBy: mongoose.Types.ObjectId;
  raisedAgainst: mongoose.Types.ObjectId;
  type: DisputeType;
  description: string;
  status: DisputeStatus;
  resolution?: string;
  evidenceUrls: string[];
  statusHistory: {
    status: DisputeStatus;
    updatedAt: Date;
    note?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

const DisputeSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    raisedAgainst: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['payment_delay', 'non_payment', 'quality_issue', 'no_show', 'other'],
      required: true
    },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'rejected'],
      default: 'open'
    },
    resolution: { type: String },
    evidenceUrls: [{ type: String }],
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['open', 'under_review', 'resolved', 'rejected'],
          required: true
        },
        updatedAt: { type: Date, default: Date.now },
        note: { type: String }
      }
    ],
    resolvedAt: { type: Date }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to add initial status to statusHistory if it's a new document
DisputeSchema.pre('save', function () {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.status || 'open',
      updatedAt: new Date()
    });
  }
});

export const Dispute = mongoose.model<IDispute>('Dispute', DisputeSchema);
