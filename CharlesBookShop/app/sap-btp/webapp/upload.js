require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

// =====================================================
// Cloudinary Configuration
// =====================================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGE_FOLDER = "./images";

// =====================================================
// Upload Images to Cloudinary
// =====================================================
const uploadImages = async () => {
  try {
    const files = fs.readdirSync(IMAGE_FOLDER);
    
    for (const file of files) {
      const filePath = path.join(IMAGE_FOLDER, file);
      const publicId = path.parse(file).name;
      
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "books",
        public_id: publicId,
      });
      
      console.log(`✅ Uploaded: ${file} -> ${result.secure_url}`);
    }
  } catch (error) {
    console.error("❌ Error processing images:", error);
  }
};

uploadImages();
