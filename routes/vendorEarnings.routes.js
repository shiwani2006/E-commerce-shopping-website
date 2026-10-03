const express = require("express");
const router = express.Router();

const { protectVendor } = require("../middlewares/vendor.middleware");

const {
  getSummary,
  getChart,
  getTransactions,
  requestWithdrawal,
  exportReport,
} = require("../controllers/vendorEarnings.controller");

router.use(protectVendor);

router.get("/summary", getSummary);
router.get("/chart", getChart);
router.get("/transactions", getTransactions);
router.get("/export", exportReport);
router.post("/withdraw", requestWithdrawal);

module.exports = router;