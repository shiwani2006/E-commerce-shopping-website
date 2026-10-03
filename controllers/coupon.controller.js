const Coupon = require("../models/Coupon.model");

/* =========================
   CREATE COUPON
   POST /api/coupons
========================= */
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      usageLimit,
      expiryDate,
    } = req.body;

    if (!code || !discountType || !discountValue || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    // 🆕 Vendor coupon hamesha "Pending" banega — admin approval chahiye
    const coupon = await Coupon.create({
      vendor: req.vendor._id,
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      usageLimit,
      expiryDate,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Coupon submitted for admin approval",
      coupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create coupon",
    });
  }
};

/* =========================
   GET VENDOR'S COUPONS
   GET /api/coupons
========================= */
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ vendor: req.vendor._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
    });
  }
};

/* =========================
   UPDATE COUPON
   PUT /api/coupons/:id
   Vendor edit karta hai to status wapas Pending pe chala jaata hai
   (taaki admin dobara review kare) — jaise Product update ka pattern hai.
========================= */
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // 🔒 Vendor status/vendor field ko direct edit nahi kar sakta
    const updatePayload = { ...req.body };
    delete updatePayload.status;
    delete updatePayload.vendor;
    delete updatePayload.usedCount;

    // Agar coupon pehle Rejected tha, edit karne pe wapas Pending ho jaye
    if (coupon.status === "Rejected") {
      updatePayload.status = "Pending";
      updatePayload.rejectionReason = "";
    }

    const updated = await Coupon.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon: updated,
    });
  } catch (error) {
    console.error("Update coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update coupon",
    });
  }
};

/* =========================
   DELETE COUPON
   DELETE /api/coupons/:id
========================= */
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
    });
  }
};

/* =========================
   VALIDATE COUPON (for customer checkout use)
   POST /api/coupons/validate
   body: { code, orderValue }
========================= */
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderValue } = req.body;

    const coupon = await Coupon.findOne({
      code: code?.toUpperCase(),
      isActive: true,
      status: "Approved", // 🆕 sirf admin-approved coupon hi chalega
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    if (coupon.expiryDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
      });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached",
      });
    }

    if (orderValue < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderValue} required`,
      });
    }

    let discount =
      coupon.discountType === "percentage"
        ? (orderValue * coupon.discountValue) / 100
        : coupon.discountValue;

    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }

    // 🟢 increment usage count so usageLimit actually works
    coupon.usedCount += 1;
    await coupon.save();

    res.status(200).json({
      success: true,
      discount: Math.round(discount),
      coupon,
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate coupon",
    });
  }
};

/* =========================
   GET ALL ACTIVE COUPONS (for customer Offers page)
   GET /api/coupons/active
========================= */
exports.getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      status: "Approved", // 🆕 sirf approved coupons dikhenge customer ko
      expiryDate: { $gte: new Date() },
      $expr: { $lt: ["$usedCount", "$usageLimit"] },
    })
      .sort({ createdAt: -1 })
      .select("code discountType discountValue minOrderValue maxDiscount expiryDate");

    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    console.error("Get active coupons error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active coupons",
    });
  }
};