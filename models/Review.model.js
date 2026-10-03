const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    vendor:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating:  { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true, default: "" },

    // 🆕 vendor reply
    vendorReply: { type: String, trim: true, default: "" },
    repliedAt: Date,

    // 🆕 admin moderation
    status: { type: String, enum: ["approved", "hidden"], default: "approved" },
  },
  { timestamps: true }
);

// one review per customer per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);