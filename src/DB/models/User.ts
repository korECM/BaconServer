import mongoose, { Schema } from 'mongoose';
import { ShopInterface } from './Shop';

export interface UserInterface {
  name: string;
  email: string;
  password: string;
  provider: string;
  snsId: string;
  isAdmin: boolean;
  gender: string;
  likeShop: mongoose.Types.ObjectId[];
  kakaoNameSet: boolean;
  registerDate: Date;
  _id: any;
}

export interface UserSchemaInterface extends UserInterface, mongoose.Document {}

export let UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  provider: { type: String, required: true },
  gender: { type: String, required: true },
  snsId: { type: String, required: true },
  isAdmin: { type: Boolean, required: true },
  likeShop: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  kakaoNameSet: Boolean,
  registerDate: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model<UserSchemaInterface>('User', UserSchema);
export default User;
