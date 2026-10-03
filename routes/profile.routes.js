const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  updateAddress,
} = require("../controllers/profile.controller");

const { protect } = require("../middlewares/auth.middleware"); 

router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);
router.put("/address", protect, updateAddress);

module.exports = router;