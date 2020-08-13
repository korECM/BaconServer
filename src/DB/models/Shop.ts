import mongoose, { Schema, models } from 'mongoose';
import { KeywordInterface } from './Keyword';
import { ReviewInterface, ReviewSchemaInterface } from './Review';

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
  HsStation = 'hs_station',
  FrontFar = 'front_far',
}

export interface ShopInterface {
  name: string;
  contact: string;
  address: string;
  image: string[];
  open: string;
  closed: string;
  location: Location;
  latitude: number;
  longitude: number;
  category: ShopCategory;
  price: number;
  keyword: KeywordInterface;
  registerDate: Date;
  _id: any;
}

export interface ShopSchemaInterface extends ShopInterface, mongoose.Document {}

export let ShopSchema = new Schema({
  name: { type: String, required: true },
  contact: { type: String },
  address: { type: String, required: true },
  open: { type: String },
  closed: { type: String },
  image: { type: [String], required: true },
  location: { type: String, enum: Object.values(Location), required: true },
  latitude: Number,
  longitude: Number,
  category: { type: String, enum: Object.values(ShopCategory), required: true },
  price: Number,
  keyword: { type: Schema.Types.ObjectId, ref: 'Keyword' },
  registerDate: {
    type: Date,
    default: Date.now,
  },
});

const Shop = mongoose.model<ShopSchemaInterface>('Shop', ShopSchema);
export default Shop;
