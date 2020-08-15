import mongoose, { Schema } from 'mongoose';

export interface MenuSchemaInterface extends mongoose.Document {
  title: string;
  price: number;
  shopId: Schema.Types.ObjectId;
}

export let MenuSchema = new Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  shopId: { type: Schema.Types.ObjectId, required: true },
  registerDate: {
    type: Date,
    default: Date.now,
  },
});

const Menu = mongoose.model<MenuSchemaInterface>('Menu', MenuSchema);
export default Menu;