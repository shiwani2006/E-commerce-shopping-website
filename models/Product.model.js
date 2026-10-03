const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: { type: String, required: true, trim: true },
    brand: String,
    category: { type: String, required: true },
    subCategory: String,
    description: String,
    highlights: String,
    sku: String,
    barcode: String,

    mrp: { type: Number, default: 0 },
    sellingPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },

    stock: { type: Number, required: true },
    lowStockAlert: { type: Number, default: 5 },

    colors: [String],
    sizes: [String],
    images: [String],

    weight: Number,
    length: Number,
    width: Number,
    height: Number,

    metaTitle: String,
    metaDesc: String,
    tags: [String],

    isFeatured: { type: Boolean, default: false },
    isCOD: { type: Boolean, default: true },
    isReturnable: { type: Boolean, default: true },
    returnDays: { type: Number, default: 7 },

    // 🆕 Approval workflow:
    // Pending  -> vendor submitted, waiting for admin
    // Active   -> approved, visible to customers
    // Inactive -> approved before, vendor/admin paused it
    // Rejected -> admin rejected, not visible to customers
    status: {
      type: String,
      enum: ["Pending", "Active", "Inactive", "Rejected"],
      default: "Pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);