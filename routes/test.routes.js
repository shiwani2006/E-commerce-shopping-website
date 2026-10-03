const express = require("express");
const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

router.get(
  "/admin",
  protect,
  authorize("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Admin",
    });
  }
);

router.get(
  "/vendor",
  protect,
  authorize("vendor"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Vendor",
    });
  }
);

router.get(
  "/customer",
  protect,
  authorize("customer", "vendor", "admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome User",
    });
  }
);

module.exports = router;