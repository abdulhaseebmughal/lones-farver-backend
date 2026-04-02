const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name:      { type: String, required: true },
  desc:      { type: String, required: true },
  price:     { type: String, required: true },
  priceNum:  { type: Number, required: true },
  category:  { type: String, enum: ["tryk", "original"], required: true },
  size:      { type: String, required: true },
  tag:       { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
