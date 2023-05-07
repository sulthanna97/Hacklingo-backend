import uploadFile from "../helpers/upload-image.js";

async function uploadMiddleware(req, res, next) {
  try {
    if (req.file) {
      const myFile = req.file;
      // Check if the file type is image or audio
      if (!myFile.mimetype.includes('image') && !myFile.mimetype.includes('audio')) {
        throw {name : "InvalidFile"}
      }
      const imageUrl = await uploadFile(myFile);
      req.imageUrl = imageUrl;
    }
    next();
  } catch (error) {
    next(error);
  }
}

export default uploadMiddleware;