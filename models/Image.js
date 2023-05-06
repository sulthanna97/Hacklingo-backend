const mongoose = require("../config/connectToMongoDB.js");
const { Schema } = mongoose;

const imageSchema = new Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
    },
    postId: {
      type: String,
    },
    chatId: {
      type: String,
    },
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;