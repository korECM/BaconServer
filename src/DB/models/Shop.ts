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

export enum Keyword {
  CostRatio = 'costRatio',
  Atmosphere = 'atmosphere',
  Group = 'group',
  Individual = 'individual',
  RiceAppointment = 'riceAppointment',
  // Spicy = 'spicy',
}

export enum FoodCategory {
  Rice = 'rice',
  Bread = 'bread',
  Noodle = 'noodle',
  Meat = 'meat',
  Etc = 'etc',
}

export enum DetailFoodCategory {
  Chicken = 'chicken',
  Meat = 'meat',
  Empty = '',
  Fastfood = 'fastfood',
  Korean = 'korean',
  Pig = 'pig',
  Steamed = 'steamed',
  Stew = 'stew',
  Asian = 'asian',
  Bakery = 'bakery',
  Chinese = 'chinese',
  Japanese = 'japanese',
  Pizza = 'pizza',
  School = 'school',
  Western = 'western',
}

export interface ShopInterface {
  name: string;
  mainImage: string;
  contact: string;
  address: string;
  open: string;
  closed: string;
  location: Location;
  latitude: number;
  longitude: number;
  category: ShopCategory;
  foodCategory: FoodCategory[];
  detailFoodCategory: DetailFoodCategory[];
  price: number;
  keyword: KeywordInterface;
  registerDate: Date;
  _id: any;
}

export interface ShopSchemaInterface extends ShopInterface, mongoose.Document {}

export let ShopSchema = new Schema({
  name: { type: String, required: true },
  mainImage: { type: String },
  contact: { type: String },
  address: { type: String, required: true },
  open: { type: String },
  closed: { type: String },
  location: { type: String, enum: Object.values(Location), required: true },
  latitude: { type: Number, required: false },
  longitude: { type: Number, required: false },
  category: { type: String, enum: Object.values(ShopCategory), required: true },
  foodCategory: { type: [String], enum: Object.values(FoodCategory), required: true },
  detailFoodCategory: { type: [String], enum: Object.values(DetailFoodCategory), required: true },
  price: Number,
  keyword: { type: Schema.Types.ObjectId, ref: 'Keyword' },
  registerDate: {
    type: Date,
    default: Date.now,
  },
});

const Shop = mongoose.model<ShopSchemaInterface>('Shop', ShopSchema);
export default Shop;
