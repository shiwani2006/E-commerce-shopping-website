const express = require("express");
const router = express.Router();

const {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getActiveCoupons,
} = require("../controllers/coupon.controller");

const { protectVendor } = require("../middlewares/vendor.middleware");
const { protect } = require("../middlewares/auth.middleware");

/* Vendor routes (need vendor login) */
router.post("/", protectVendor, createCoupon);
router.get("/", protectVendor, getCoupons);
router.put("/:id", protectVendor, updateCoupon);
router.delete("/:id", protectVendor, deleteCoupon);

/* Customer routes (need user login) */
router.get("/active", protect, getActiveCoupons);
router.post("/validate", protect, validateCoupon);

module.exports = router;