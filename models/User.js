const mongoose = require("../config/connectToMongoDB.js");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    nativeLanguage: {
      type: String,
      required: [true, "Native language is required"],
      enum: {
        values: ["English", "German/Deutsch", "Japanase/日本語", "Indonesian/Bahasa Indonesia", "French/Français", "Spanish/Español", "Dutch/Nederlands", "Others"],
        message: "Native language is not in any of the options"
      }
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["regular", "moderator"],
        message: "Role must be either 'regular' or 'moderator'"
      }
    },
    targetLanguage: [{ type: String }],
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
