import { checkPassword } from "../helpers/bcrypt.js";
import User from "../models/User.js";

class UserController {

  static async findAllUsersByNativeLanguage(req, res, next) {
    try {
      let nativeLanguages = req.query.targetLanguage;
      const users = await User.find(
        {
          nativeLanguage: {
            $in: nativeLanguages,
          },
        },
        {
          createdAt: 0,
          updatedAt: 0,
          posts: 0,
          comments: 0,
          __v: 0,
          password: 0,
          articles: 0,
        }
      );
      res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  }

  static async findAllUsersBySearch(req, res, next) {
    try {
      const searchRegex = new RegExp(req.query.search, "i");
      const users = await User.find(
        { username: searchRegex },
        {
          createdAt: 0,
          updatedAt: 0,
          posts: 0,
          comments: 0,
          __v: 0,
          password: 0,
          articles: 0,
        }
      );
      res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  }

  static async findUserById(req, res, next) {
    try {
      if (req.params.id.length !== 24) {
        throw { name: "NotFound" };
      }
      const user = await User.findById(req.params.id).populate([
        "posts",
        "comments",
        "articles",
      ]);
      if (!user) {
        throw { name: "NotFound" };
      }
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  static async insertNewUser(req, res, next) {
    try {
      let targetLanguage = req.body.targetLanguage;
      targetLanguage = JSON.parse(targetLanguage);
      const newUser = new User({ ...req.body, targetLanguage, profileImageUrl: req.imageUrl });
      await newUser.save();
      res.status(201).json(newUser);
    } catch (err) {
      next(err);
    }
  }

  static async insertChatImage(req, res, next) {
    try {
      res.status(201).json({chatImageUrl : req.imageUrl});
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw { name: "InvalidLogin" };
      }
      const user = await User.findOne(
        { email },
        { __v: 0, createdAt: 0, updatedAt: 0 }
      );
      if (!user) {
        throw { name: "InvalidLogin" };
      }
      const isValidPassword = checkPassword(password, user.password);
      if (!isValidPassword) {
        throw { name: "InvalidLogin" };
      }
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  static async updateUserById(req, res, next) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { ...req.body, userId: req.userId, profileImageUrl: req.imageUrl },
        {
          returnDocument: "after",
          runValidators: true,
          select: {
            createdAt: 0,
            updatedAt: 0,
            posts: 0,
            comments: 0,
            __v: 0,
            password: 0,
            articles: 0,
          },
        }
      );
      res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  }

  static async deleteUserById(req, res, next) {
    try {
      const deleted = await User.findByIdAndDelete(req.params.id);
      res.status(200).json({
        message: `User with id ${req.params.id} has been deleted`,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default UserController;
