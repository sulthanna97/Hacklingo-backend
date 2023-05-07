import express from "express";
import UserController from "../controllers/userController.js";
import { userAuthorization } from "../middlewares/authorizations.js";
import uploadMiddleware from "../middlewares/uploadMiddleware.js";
import userAuthentication from "../middlewares/userAuthentication.js";
const userRouter = express.Router();

userRouter.get(
  "/",
  userAuthentication,
  UserController.findAllUsersByNativeLanguage
);
userRouter.get("/:id", userAuthentication, UserController.findUserById);
userRouter.post("/register", uploadMiddleware, UserController.insertNewUser);
userRouter.put(
  "/:id",
  userAuthentication,
  userAuthorization,
  uploadMiddleware,
  UserController.updateUserById
);
userRouter.delete(
  "/:id",
  userAuthentication,
  userAuthorization,
  UserController.deleteUserById
);

export default userRouter;