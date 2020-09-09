import mongoose, { Schema, models } from 'mongoose';

export interface KeywordInterface {
  costRatio: number;
  atmosphere: number;
  group: number;
  individual: number;
  riceAppointment: number;
  // spicy: number;
  registerDate: Date;
  _id: any;
}

export interface KeywordSchemaInterface extends KeywordInterface, mongoose.Document {}

export let KeywordSchema = new Schema({
  costRatio: { type: Number, required: true },
  atmosphere: { type: Number, required: true },
  group: { type: Number, required: true },
  individual: { type: Number, required: true },
  riceAppointment: { type: Number, required: true },
  // spicy: { type: Number, required: true },
  registerDate: {
    type: Date,
    default: Date.now,
  },
});

const Keyword = mongoose.model<KeywordSchemaInterface>('Keyword', KeywordSchema);
export default Keyword;
