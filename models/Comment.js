import mongoose from "../config/connectToMongoDB.js";
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    userId: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true,
    },
    postId: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
