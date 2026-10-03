const express = require("express");
const router = express.Router();

const {
  getVendorRewards,
  createVendorReward,
  updateVendorReward,
  deleteVendorReward,
} = require("../controllers/vendorRewards.controller");

const { protect } = require("../middlewares/auth.middleware");
const { vendorOnly } = require("../middlewares/vendorOnly.middleware");

router.get("/", protect, vendorOnly, getVendorRewards);
router.post("/", protect, vendorOnly, createVendorReward);
router.put("/:id", protect, vendorOnly, updateVendorReward);
router.delete("/:id", protect, vendorOnly, deleteVendorReward);

module.exports = router;