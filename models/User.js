import mongoose from "../config/connectToMongoDB.js";
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
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      validate: {
        validator: (str) => {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/.test(str);
        },
        message: "Password has to have at least 1 number and 1 capital letter",
      },
    },
    nativeLanguage: {
      type: String,
      required: [true, "Native language is required"],
      enum: {
        values: [
          "English",
          "German/Deutsch",
          "Japanase/日本語",
          "Indonesian/Bahasa Indonesia",
          "French/Français",
          "Spanish/Español",
          "Dutch/Nederlands",
          "Others",
        ],
        message: "Native language is not in any of the options",
      },
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["regular", "moderator"],
        message: "Role must be either 'regular' or 'moderator'",
      },
    },
    targetLanguage: [
      {
        type: String,
        enum: {
          values: [
            "English",
            "German/Deutsch",
            "Japanase/日本語",
            "Indonesian/Bahasa Indonesia",
            "French/Français",
            "Spanish/Español",
            "Dutch/Nederlands",
            "Others",
          ],
          message: "Target language is not in any of the options",
        }
      },
    ],
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
