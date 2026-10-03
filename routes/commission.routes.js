const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const c = require("../controllers/commission.controller");

router.get("/", protect, authorize("admin"), c.getCommissionSettings);
router.put("/", protect, authorize("admin"), c.updateCommissionSettings);
router.get("/summary", protect, authorize("admin"), c.getCommissionSummary);

module.exports = router;