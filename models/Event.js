const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title:           { type: String, required: true },
  titleEN:         { type: String, default: "" },
  description:     { type: String, default: "" },
  descriptionEN:   { type: String, default: "" },
  date:            { type: String, default: "" },   // display string, e.g. "15. maj 2026"
  location:        { type: String, default: "" },
  price:           { type: String, default: "" },   // e.g. "450 kr"
  spots:           { type: Number, default: 0 },    // 0 = unlimited
  imageUrl:        { type: String, default: "" },   // uploaded file URL
  category:        { type: String, default: "kursus" }, // kursus | workshop | event
  active:          { type: Boolean, default: true },
  createdAt:       { type: Date, default: Date.now },
});

module.exports = mongoose.model("Event", eventSchema);
