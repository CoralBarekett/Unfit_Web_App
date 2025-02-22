import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IPost {
  title: string;
  content: string;
  owner: string;
}

const postSchema = new Schema<IPost>({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
});

const postModel = mongoose.model<IPost>("Posts", postSchema);

export default postModel;