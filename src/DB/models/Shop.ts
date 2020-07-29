import mongoose, { Schema, models } from 'mongoose';
import { KeywordInterface } from './Keyword';

export interface ShopInterface {
  name: string;
  contact: string;
  address: string;
  image: string[];
  category: string[];
  keyword: KeywordInterface;
  registerDate: Date;
  _id: any;
}

export interface ShopSchemaInterface extends ShopInterface, mongoose.Document {}

export let ShopSchema = new Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  address: { type: String, required: true },
  image: { type: [String], required: true },
  category: { type: [String], required: true },
  keyword: { type: Schema.Types.ObjectId, ref: 'Keyword' },
  registerDate: {
    type: Date,
    default: Date.now,
  },
});

const Shop = mongoose.model<ShopSchemaInterface>('Shop', ShopSchema);
export default Shop;
