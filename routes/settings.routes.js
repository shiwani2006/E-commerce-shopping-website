const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const c = require("../controllers/settings.controller");

router.get("/public", c.getPublicSettings);
router.get("/", protect, authorize("admin"), c.getSettings);
router.put("/", protect, authorize("admin"), c.updateSettings);

module.exports = router;