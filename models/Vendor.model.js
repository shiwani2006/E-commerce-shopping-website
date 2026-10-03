const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    phone: {
      type: String,
    },

    address: {
      type: String,
    },

    kycVerified: {
      type: Boolean,
      default: false,
    },

    totalEarnings: {
      type: Number,
      default: 0,
    },

    /* 🆕 Shop profile fields — used by the "My Shop" page */
    storeName: {
      type: String,
      trim: true,
      default: "",
    },

    tagline: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      trim: true,
      default: "Multi-Category",
    },

    established: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    logoUrl: {
      type: String,
      default: "",
    },

    bannerUrl: {
      type: String,
      default: "",
    },

    /* 🆕 Analytics ke "Monthly Goal" tracker ke liye — vendor MyShop mein
       apna revenue target set kar sakta hai, Analytics real % dikhata hai */
    monthlyGoal: {
      type: Number,
      default: 0,
    },

    /* 🆕 Settings → Notifications tab ke liye — bhejna abhi implement
       nahi hai, sirf preference save hoti hai */
    notificationPrefs: {
      emailNotif: { type: Boolean, default: true },
      pushNotif: { type: Boolean, default: false },
      smsNotif: { type: Boolean, default: false },
      orderNotif: { type: Boolean, default: true },
      reviewNotif: { type: Boolean, default: true },
    },

    /* 🆕 Settings → Store tab (KYC/payout details) */
    gstNumber: { type: String, trim: true, default: "" },
    panNumber: { type: String, trim: true, default: "" },
    bankAccountNumber: { type: String, trim: true, default: "" },
    ifscCode: { type: String, trim: true, default: "" },
    isStoreVisible: { type: Boolean, default: true },

    /* 🆕 Settings → Danger Zone. isActive=false par login block hota hai */
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Vendor", vendorSchema);