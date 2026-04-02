const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: String,
  name:      String,
  price:     String,
  priceNum:  Number,
  qty:       Number,
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: {
    name:    { type: String, required: true },
    email:   { type: String, required: true },
    phone:   { type: String, required: true },
    address: { type: String, required: true },
    city:    { type: String, required: true },
    zip:     { type: String, required: true },
    note:    { type: String, default: "" },
  },
  items:     [orderItemSchema],
  subtotal:  { type: Number, required: true },
  shipping:  { type: Number, required: true },
  total:     { type: Number, required: true },
  status:    { type: String, enum: ["pending", "confirmed", "shipped", "cancelled"], default: "pending" },
  emailSent: { type: Boolean, default: false },
}, { timestamps: true });

orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = "LF-" + String(count + 1).padStart(4, "0");
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
