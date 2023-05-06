import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import uploadImage from "./helpers/upload-image.js";
import errorHandler from "./middlewares/errorHandler.js";
import UserController from "./controllers/userController.js";
import PostController from "./controllers/postController.js";
import ForumController from "./controllers/forumController.js";
import CommentController from "./controllers/commentController.js";
const port = 4001;

const app = express();

const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    // no larger than 5mb.
    fileSize: 5 * 1024 * 1024,
  },
});

app.disable("x-powered-by");
app.use(multerMid.single("file"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Uploading images require userId (required), postId, or chatId
app.get("/", (req, res) => {
  res.send({ message: "Hello guys!!!" });
});

app.get("/users", UserController.findAllUsersByNativeLanguage);
app.get("/users/:id", UserController.findUserById);
app.post("/users", UserController.insertNewUser);
app.put("/users/:id", UserController.updateUserById);
app.delete("/users/:id", UserController.deleteUserById);
app.get("/posts", PostController.findPostsBySearch);
app.get("/posts/:id", PostController.findPostById);
app.post("/posts", PostController.insertNewPost);
app.put("/posts/:id", PostController.updatePostById);
app.delete("/posts/:id", PostController.deletePostById);
app.post("/forums", ForumController.insertForums);
app.get("/comments/:id", CommentController.findCommentById);
app.post("/comments", CommentController.insertNewComment);
app.put("/comments/:id", CommentController.updateCommentById);
app.delete("/comments/:id", CommentController.deleteCommentById);

app.post("/uploadImage", async (req, res, next) => {
  try {
    const myFile = req.file;
    const imageUrl = await uploadImage(myFile);
    res.status(200).json({
      message: "Upload was successful",
      data: imageUrl,
    });
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

app.listen(port, () => {
  console.log("app now listening for requests!!!", port);
});
