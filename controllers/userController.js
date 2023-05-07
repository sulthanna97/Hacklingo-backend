import User from "../models/User.js";

class UserController {

  static async findAllUsersByNativeLanguage(req, res, next) {
    try {
      const users = await User.find(
        { nativeLanguage: req.query.nativeLanguage },
        {
          createdAt: 0,
          updatedAt: 0,
          posts: 0,
          comments: 0,
          profileImageUrl: 0,
          __v: 0,
          password: 0,
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
      const newUser = new User({...req.body, profileImageUrl: req.imageUrl});
      await newUser.save();
      res.status(201).json(newUser);
    } catch (err) {
      next(err);
    }
  }

  static async updateUserById(req, res, next) {
    try {
      if (req.params.id.length !== 24) {
        throw { name: "NotFound" };
      }
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {...req.body, userId: req.userId, profileImageUrl : req.imageUrl},
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
          },
        }
      );
      if (!updatedUser) {
        throw { name: "NotFound" };
      }
      res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  }

  static async deleteUserById(req, res, next) {
    try {
      if (req.params.id.length !== 24) {
        throw { name: "NotFound" };
      }
      const deleted = await User.findByIdAndDelete(req.params.id);
      if (!deleted) {
        throw { name: "NotFound" };
      }
      res.status(200).json({
        message: `User with id ${req.params.id} has been deleted`,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default UserController;
