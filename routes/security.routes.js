const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");

const {
  changePassword,
  getSecuritySettings,
  toggle2FA,
} = require("../controllers/security.controller");

router.get("/settings", protect, getSecuritySettings);
router.put("/change-password", protect, changePassword);
router.put("/toggle-2fa", protect, toggle2FA);

module.exports = router;