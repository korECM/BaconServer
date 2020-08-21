import mongoose, { Schema } from 'mongoose';

export interface ImageSchemaInterface extends mongoose.Document {
  imageLink: string;
  type: ImageType;
  shopId: Schema.Types.ObjectId;
}

export enum ImageType {
  Shop = 'shop',
  Menu = 'menu',
}

export let MenuSchema = new Schema({
  imageLink: { type: String, required: true },
  type: { type: String, enum: Object.values(ImageType), required: true },
  shopId: { type: Schema.Types.ObjectId, required: true },
  registerDate: {
    type: Date,
    default: Date.now,
  },
});

const Image = mongoose.model<ImageSchemaInterface>('Image', MenuSchema);
export default Image;
