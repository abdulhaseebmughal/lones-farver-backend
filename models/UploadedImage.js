const mongoose = require("mongoose");

// Tracks uploads stored on ImgBB — metadata only, no image data in DB
const uploadedImageSchema = new mongoose.Schema({
  filename:   { type: String, required: true, unique: true },
  url:        { type: String, required: true },   // CDN URL from ImgBB
  deleteUrl:  { type: String, default: "" },      // ImgBB delete page URL
  imgbbId:    { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("UploadedImage", uploadedImageSchema);
