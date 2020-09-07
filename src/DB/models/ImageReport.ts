import mongoose, { Schema } from 'mongoose';

export interface ImageReportSchemaInterface extends mongoose.Document {
  imageId: string;
  userId: Schema.Types.ObjectId;
  registerDate: Date;
}

export let ImageReportSchema = new Schema({
  imageId: { type: Schema.Types.ObjectId, ref: 'Review' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  registerDate: {
    type: Date,
    default: Date.now,
  },
});

const ImageReport = mongoose.model<ImageReportSchemaInterface>('ImageReport', ImageReportSchema);
export default ImageReport;
