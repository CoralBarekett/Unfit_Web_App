import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IPost {
  title: string;
  content: string;
  owner: string;
  image?: string;  // Add image URL field
  likes: string[];  // Array of user IDs who liked the post
  commentCount: number;  // Track comment count
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
  image: {
    type: String,
    required: false,
  },
  likes: {
    type: [String],
    default: [],
  },
  commentCount: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

const postModel = mongoose.model<IPost>("Posts", postSchema);

export default postModel;