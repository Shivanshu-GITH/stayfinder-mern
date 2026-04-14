// cloudinary configuration file

const cloudinary = require("cloudinary").v2;
const CloudinaryStorage = require("multer-storage-cloudinary");

// connect cloudinary using env variables
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// create storage engine for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "stayfinder_images", // folder name in cloudinary
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

module.exports = {
  cloudinary,
  storage,
};

