import Forum from "../models/Forum.js";

class ForumController {

  static async insertForums(req, res, next) {
    try {
      await Forum.bulkWrite(
        req.body.map((el) => ({
          insertOne: {
            document: el,
          },
        })),
        { ordered: true }
      );
      res.status(201).json({
        message: "Insert Forums Success!!",
      }) 
    } catch (err) {
      next(err);
    }
  }
}

export default ForumController;
