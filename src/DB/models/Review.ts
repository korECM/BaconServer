import mongoose, { Schema, models } from 'mongoose';
import { UserInterface } from './User';
import { ShopInterface } from './Shop';

export interface ReviewInterface {
  user: UserInterface;
  shop: ShopInterface;
  score: number;
  registerDate: Date;
  _id: any;
}

export interface ReviewSchemaInterface extends ReviewInterface, mongoose.Document {}

export let ReviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
  score: { type: Number, required: true },
  registerDate: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model<ReviewSchemaInterface>('Review', ReviewSchema);
export default Review;
