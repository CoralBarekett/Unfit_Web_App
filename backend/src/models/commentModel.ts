import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IComment {
  _id?: string;
  content: string;
  owner: string;
  postId: string;
};

const commentsSchema = new Schema<IComment>({
  content: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
    required: true,
  },
});

const commentModel = mongoose.model<IComment>("Comments", commentsSchema);

export default commentModel;