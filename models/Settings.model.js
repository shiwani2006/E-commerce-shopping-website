const mongoose = require("mongoose");

// One document only (key: "platform")
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "platform", unique: true },
    siteName: { type: String, trim: true, default: "ShopSphere" },
    supportEmail: { type: String, trim: true, default: "" },
    supportPhone: { type: String, trim: true, default: "" },
    allowVendorRegistration: { type: Boolean, default: true },
    allowCustomerRegistration: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);