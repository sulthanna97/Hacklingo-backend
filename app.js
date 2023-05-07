import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import errorHandler from "./middlewares/errorHandler.js";
import UserController from "./controllers/userController.js";
import PostController from "./controllers/postController.js";
import ForumController from "./controllers/forumController.js";
import CommentController from "./controllers/commentController.js";
import uploadMiddleware from "./middlewares/uploadMiddleware.js";
import {
  userAuthorization,
  postAuthorization,
  commentAuthorization,
} from "./middlewares/authorizations.js";
import userAuthentication from "./middlewares/userAuthentication.js";

const app = express();

const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    // no larger than 5mb.
    fileSize: 100 * 1024 * 1024,
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

app.get(
  "/users",
  userAuthentication,
  UserController.findAllUsersByNativeLanguage
);
app.get("/users/:id", userAuthentication, UserController.findUserById);
app.post("/register", uploadMiddleware, UserController.insertNewUser);
app.put(
  "/users/:id",
  userAuthentication,
  userAuthorization,
  uploadMiddleware,
  UserController.updateUserById
);
app.delete(
  "/users/:id",
  userAuthentication,
  userAuthorization,
  UserController.deleteUserById
);
app.get("/posts", userAuthentication, PostController.findPostsBySearch);
app.get("/posts/:id", userAuthentication, PostController.findPostById);
app.post(
  "/posts",
  userAuthentication,
  uploadMiddleware,
  PostController.insertNewPost
);
app.put(
  "/posts/:id",
  userAuthentication,
  postAuthorization,
  uploadMiddleware,
  PostController.updatePostById
);
app.delete(
  "/posts/:id",
  userAuthentication,
  postAuthorization,
  PostController.deletePostById
);
app.get("/forums", userAuthentication, ForumController.findAllForums);
app.get("/forums/:id", userAuthentication, ForumController.findForumById);
app.delete("/forums/:id", userAuthentication, ForumController.deleteForumById);
app.post("/forums", ForumController.insertForums);
app.get("/comments/:id", userAuthentication, CommentController.findCommentById);
app.post("/comments", userAuthentication, CommentController.insertNewComment);
app.put(
  "/comments/:id",
  userAuthentication,
  commentAuthorization,
  CommentController.updateCommentById
);
app.delete(
  "/comments/:id",
  userAuthentication,
  commentAuthorization,
  CommentController.deleteCommentById
);

app.use(errorHandler);

export default app;
