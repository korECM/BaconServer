import mongoose, { Schema } from 'mongoose';
import { UserInterface } from './User';
import { ShopInterface } from './Shop';

export interface ScoreInterface {
  user: UserInterface | string;
  shop: ShopInterface | string;
  score: number;
  registerDate: Date;
  _id: any;
}

export interface ScoreSchemaInterface extends ScoreInterface, mongoose.Document {}

export let ScoreSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
  score: { type: Number, required: true },
  registerDate: {
    type: Date,
    default: Date.now,
  },
});

const Score = mongoose.model<ScoreSchemaInterface>('Score', ScoreSchema);
export default Score;
