import mongoose, { Schema } from 'mongoose';

export interface ReviewReportSchemaInterface extends mongoose.Document {
  comment: string;
  reviewId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  registerDate: Date;
}

export let ReviewReportSchema = new Schema({
  reviewId: { type: Schema.Types.ObjectId, ref: 'Review' },
  comment: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  registerDate: {
    type: Date,
    default: Date.now,
  },
});

const ReviewReport = mongoose.model<ReviewReportSchemaInterface>('ReviewReport', ReviewReportSchema);
export default ReviewReport;
