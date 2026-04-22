const mongoose = require("mongoose");

// Stores hashed admin password so it can be changed at runtime.
const adminSettingsSchema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true },
  value: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("AdminSettings", adminSettingsSchema);
