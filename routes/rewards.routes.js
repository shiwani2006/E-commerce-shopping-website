const express = require("express");
const { getRewards, claimReward } = require("../controllers/rewards.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", protect, getRewards);
router.post("/claim", protect, claimReward);

module.exports = router;