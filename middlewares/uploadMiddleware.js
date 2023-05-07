import uploadImage from "../helpers/upload-image.js";

async function uploadMiddleware(req, res, next) {
  try {
    if (req.file) {
      const myFile = req.file;
      if (!myFile.mimetype.includes('image')) {
        throw {name : "InvalidImage"}
      }
      const imageUrl = await uploadImage(myFile);
      req.imageUrl = imageUrl;
    }
    next();
  } catch (error) {
    next(error);
  }
}

export default uploadMiddleware;