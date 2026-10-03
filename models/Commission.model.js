const mongoose = require("mongoose");

// One document only (key: "default") holding all commission settings
const commissionSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    defaultRate: { type: Number, default: 10, min: 0, max: 100 },
    categoryRates: [
      {
        category: { type: String, required: true, trim: true },
        rate: { type: Number, required: true, min: 0, max: 100 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Commission", commissionSchema);