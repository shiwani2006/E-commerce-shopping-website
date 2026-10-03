const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cardName: {
      type: String,
      required: true,
    },
    last4: {
      type: String,
      required: true,
    },
    expiry: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Primary", "Backup", "New"],
      default: "New",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Card", cardSchema);