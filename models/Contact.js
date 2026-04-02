const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  subject: { type: String, default: "" },
  name:    { type: String, required: true },
  email:   { type: String, required: true },
  phone:   { type: String, default: "" },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Contact", contactSchema);
