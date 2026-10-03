const express = require("express");
const router = express.Router();

const analyticsController = require("../controllers/analytics.controller");
const { protect } = require("../middlewares/auth.middleware");
const { vendorOnly } = require("../middlewares/vendorOnly.middleware");

router.use(protect, vendorOnly);

router.get("/summary", analyticsController.getSummary);
router.get("/sales", analyticsController.getSalesTrend);
router.get("/top-products", analyticsController.getTopProducts);
router.get("/order-status", analyticsController.getOrderStatusBreakdown);

module.exports = router;