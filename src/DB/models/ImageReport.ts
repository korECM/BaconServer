import mongoose, { Schema } from 'mongoose';

export interface ImageReportSchemaInterface extends mongoose.Document {
  imageId: string;
  userId: Schema.Types.ObjectId;
  registerDate: Date;
  state: ImageReportState;
}

export enum ImageReportState {
  Issued = 'issued',
  Rejected = 'rejected',
  Done = 'done',
}

export let ImageReportSchema = new Schema({
  imageId: { type: Schema.Types.ObjectId, ref: 'Review' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  state: { type: String, enum: Object.values(ImageReportState), required: true },
  registerDate: {
    type: Date,
    default: Date.now,
  },
});

const ImageReport = mongoose.model<ImageReportSchemaInterface>('ImageReport', ImageReportSchema);
export default ImageReport;
