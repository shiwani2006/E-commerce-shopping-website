const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["customer", "vendor", "admin"],
      default: "customer",
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    phone: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    // 🆕 Payments & Wallet fields
    walletBalance: {
      type: Number,
      default: 0,
    },

    upiId: {
      type: String,
      default: "",
    },

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    // 🆕 OTP fields for 2FA login
    otp: {
      type: String,
      default: null,
    },

    otpExpiry: {
      type: Date,
      default: null,
    },

    // 🆕 Rewards
    rewardPoints: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);