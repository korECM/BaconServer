import mongoose, { Schema } from 'mongoose';

export interface UserInterface {
  name: string;
  email: string;
  password: string;
  provider: string;
  snsId: string;
  registerDate: Date;
  _id: any;
}

export interface UserSchemaInterface extends UserInterface, mongoose.Document {}

export let UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  provider: { type: String, required: true },
  snsId: { type: String, required: true },
  registerDate: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model<UserSchemaInterface>('User', UserSchema);
export default User;
