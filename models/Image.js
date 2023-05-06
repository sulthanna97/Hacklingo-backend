const mongoose = require("../config/connectToMongoDB.js");
const { Schema } = mongoose;

const imageSchema = new Schema(
  
  { timestamps: true }
);

const image = mongoose.model("image", imageSchema);

module.exports = image;