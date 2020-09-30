import mongoose, { Schema } from 'mongoose';

export interface MainPostSchemaInterface extends mongoose.Document {
  title: string;
  link: string;
  image: string;
}

export let MainPostSchema = new Schema({
  title: { type: String, required: true },
  link: { type: String, required: false },
  image: { type: String, required: true },
  registerDate: {
    type: Date,
    default: Date.now,
  },
});

const MainPost = mongoose.model<MainPostSchemaInterface>('MainPost', MainPostSchema);
export default MainPost;
