const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true, // e.g. "Wallet Top-up", "Order Payment", "Vendor Withdrawal"
    },
    mode: {
      type: String,
      default: "Wallet", // e.g. "Wallet", "UPI", "Card", "Razorpay", "Bank Transfer"
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      default: "credit",
    },
    // 🆕 Used by vendor earnings/withdrawals — existing (older) records
    // without this field will just default to "Completed", so nothing
    // that already uses this model breaks.
    status: {
      type: String,
      enum: ["Completed", "Pending", "Failed"],
      default: "Completed",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);