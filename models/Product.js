const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true }, // "p1", "p2", etc.
  name:      { type: String, required: true },
  desc:      { type: String, required: true },
  price:     { type: String, required: true },
  priceNum:  { type: Number, required: true },
  category:  { type: String, enum: ["tryk", "original"], required: true },
  size:      { type: String, required: true },
  tag:       { type: String, default: null },
  imageKey:  { type: String, default: null }, // key into productImages registry
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
