const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    // User._id of the vendor (same convention as Order.items.vendor / Product.vendor)
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Withdrawal", withdrawalSchema);