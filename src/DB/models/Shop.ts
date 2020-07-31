import mongoose, { Schema, models } from 'mongoose';
import { KeywordInterface } from './Keyword';

export enum ShopCategory {
  Korean = 'korean',
  Japanese = 'japanese',
  Chinese = 'chinese',
  Western = 'western',
  Fusion = 'fusion',
  School = 'school',
  other = 'other',
}

export enum Location {
  Front = 'front',
  Back = 'back',
}

export interface ShopInterface {
  name: string;
  contact: string;
  address: string;
  image: string[];
  open: string;
  closed: string;
  location: Location;
  category: ShopCategory;
  keyword: KeywordInterface;
  registerDate: Date;
  _id: any;
}

export interface ShopSchemaInterface extends ShopInterface, mongoose.Document {}

export let ShopSchema = new Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  address: { type: String, required: true },
  open: { type: String, required: true },
  closed: { type: String, required: true },
  image: { type: [String], required: true },
  location: { type: String, enum: Object.values(Location), required: true },
  category: { type: String, enum: Object.values(ShopCategory), required: true },
  keyword: { type: Schema.Types.ObjectId, ref: 'Keyword' },
  registerDate: {
    type: Date,
    default: Date.now,
  },
});

const Shop = mongoose.model<ShopSchemaInterface>('Shop', ShopSchema);
export default Shop;
