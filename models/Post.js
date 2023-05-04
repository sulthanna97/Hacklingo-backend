import mongoose from "../config/connectToMongoDB.js";
const { Schema } = mongoose;

const postSchema = new Schema(
  {
    userId: {
      type: Schema.ObjectId,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true, 
    },
    forumId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment"
      }
    ]
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
