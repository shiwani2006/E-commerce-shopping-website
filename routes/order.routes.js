const express = require("express");
const router = express.Router();

const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getVendorOrders,
  updateOrderStatusByVendor,
} = require("../controllers/order.controller");
const { protect } = require("../middlewares/auth.middleware");
const { protectVendor } = require("../middlewares/vendor.middleware");

router.post("/place", protect, placeOrder);
router.get("/", protect, getMyOrders);
router.get("/vendor/my-orders", protectVendor, getVendorOrders);
router.put("/vendor/:id/status", protectVendor, updateOrderStatusByVendor);

router.get("/:id", protect, getOrderById);

module.exports = router;