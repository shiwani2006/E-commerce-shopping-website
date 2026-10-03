const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const c = require("../controllers/adminProfile.controller");

router.use(protect, authorize("admin"));
router.get("/", c.getProfile);
router.put("/", c.updateProfile);
router.put("/password", c.changePassword);

module.exports = router;