const express = require("express");
const router = express.Router();

const {
  vendorLogin,
  getDashboardStats,
  getMyShop,
  updateMyShop,
  getEarningsSummary,
  getEarningsChart,
  getEarningsTransactions,
  withdrawFunds,
  exportEarningsReport,
  getAnalyticsSummary,
  getProductSalesBreakdown,
  getTopProducts,
  getCustomerStats,
  getOrderStatusBreakdown,
  getGoalProgress,
  getBusinessInsight,
  getAccountProfile,
  updateAccountProfile,
  changePassword,
  deactivateAccount,
  deleteAccount,
} = require("../controllers/vendor.controller");

const { protectVendor } = require("../middlewares/vendor.middleware");

/* Public */
router.post("/login", vendorLogin);

/* Protected (vendor only) */
router.get("/dashboard", protectVendor, getDashboardStats);
router.get("/profile", protectVendor, getMyShop);
router.put("/profile", protectVendor, updateMyShop);

/* Earnings */
router.get("/earnings/summary", protectVendor, getEarningsSummary);
router.get("/earnings/chart", protectVendor, getEarningsChart);
router.get("/earnings/transactions", protectVendor, getEarningsTransactions);
router.post("/earnings/withdraw", protectVendor, withdrawFunds);
router.get("/earnings/export", protectVendor, exportEarningsReport);

/* 🆕 Analytics */
router.get("/analytics/summary", protectVendor, getAnalyticsSummary);
router.get("/analytics/product-sales", protectVendor, getProductSalesBreakdown);
router.get("/analytics/top-products", protectVendor, getTopProducts);
router.get("/analytics/customer-stats", protectVendor, getCustomerStats);
router.get("/analytics/order-status", protectVendor, getOrderStatusBreakdown);
router.get("/analytics/goal", protectVendor, getGoalProgress);
router.get("/analytics/insight", protectVendor, getBusinessInsight);

/* 🆕 Settings */
router.get("/settings/profile", protectVendor, getAccountProfile);
router.put("/settings/profile", protectVendor, updateAccountProfile);
router.put("/settings/password", protectVendor, changePassword);
router.put("/settings/deactivate", protectVendor, deactivateAccount);
router.delete("/settings/account", protectVendor, deleteAccount);

module.exports = router;