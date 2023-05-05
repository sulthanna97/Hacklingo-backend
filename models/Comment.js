const mongoose = require("../config/connectToMongoDB.js");
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    userId: {
      type: String,
      required: [true, "User Id is required"]
    },
    content: {
      type: String,
      required: [true, "Content is required"]
    },
    postId: {
      type: String,
      required: [true, "Post Id is required"]
    }
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
