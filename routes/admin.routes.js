const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const { adminOnly } = require("../middlewares/admin.middleware");
const {
  getDashboard,
  getAllProductsAdmin,
  updateProductStatus,
  deleteProductAdmin,
  getAllOrdersAdmin,
  updateOrderStatus,
  getAllCustomersAdmin,
  toggleCustomerBlock,
  getAllVendorsAdmin,
  updateVendorApproval,
  toggleVendorBlock,
  getAllCouponsAdmin,
  updateCouponStatus,
  getTopVendorsAdmin,
  getTopProductsAdmin,
  getOrderStatusBreakdownAdmin,
  getCustomerGrowthAdmin,
  getAllUsersAdmin,
  toggleUserBlock,
} = require("../controllers/admin.controller");

router.get("/dashboard", protect, adminOnly, getDashboard);

/* Product management */
router.get("/products", protect, adminOnly, getAllProductsAdmin);
router.put("/products/:id/status", protect, adminOnly, updateProductStatus);
router.delete("/products/:id", protect, adminOnly, deleteProductAdmin);

/* Order management */
router.get("/orders", protect, adminOnly, getAllOrdersAdmin);
router.put("/orders/:id/status", protect, adminOnly, updateOrderStatus);

/* Customer management */
router.get("/customers", protect, adminOnly, getAllCustomersAdmin);
router.put("/customers/:id/status", protect, adminOnly, toggleCustomerBlock);

/* Vendor management */
router.get("/vendors", protect, adminOnly, getAllVendorsAdmin);
router.put("/vendors/:id/approval", protect, adminOnly, updateVendorApproval);
router.put("/vendors/:id/status", protect, adminOnly, toggleVendorBlock);

/* Coupon management */
router.get("/coupons", protect, adminOnly, getAllCouponsAdmin);
router.put("/coupons/:id/status", protect, adminOnly, updateCouponStatus);

/* 🆕 Analytics */
router.get("/analytics/top-vendors", protect, adminOnly, getTopVendorsAdmin);
router.get("/analytics/top-products", protect, adminOnly, getTopProductsAdmin);
router.get("/analytics/order-status", protect, adminOnly, getOrderStatusBreakdownAdmin);
router.get("/analytics/customer-growth", protect, adminOnly, getCustomerGrowthAdmin);

/* 🆕 Users (unified directory across all roles) */
router.get("/users", protect, adminOnly, getAllUsersAdmin);
router.put("/users/:id/status", protect, adminOnly, toggleUserBlock);

module.exports = router;