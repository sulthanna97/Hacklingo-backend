import uploadImage from "../helpers/upload-image.js";

async function uploadMiddleware(req, res, next) {
  try {
    if (req.file) {
      const myFile = req.file;
      const imageUrl = await uploadImage(myFile);
      req.imageUrl = imageUrl;
    }
    next();
  } catch (error) {
    next(error);
  }
}

export default uploadMiddleware;