import mongoose, { Schema } from 'mongoose';

export interface ShopReportSchemaInterface extends mongoose.Document {
  comment: string;
  type: number[];
  shopId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  registerDate: Date;
  state: ShopReportState;
}

export enum ShopReportState {
  Issued = 'issued',
  Confirmed = 'confirmed',
  Rejected = 'rejected',
  Done = 'done',
}

export let ShopReportSchema = new Schema({
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
  type: { type: [Number], required: true },
  state: { type: String, enum: Object.values(ShopReportState), required: true },
  comment: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  registerDate: {
    type: Date,
    default: Date.now,
  },
});

const ShopReport = mongoose.model<ShopReportSchemaInterface>('ShopReport', ShopReportSchema);
export default ShopReport;
