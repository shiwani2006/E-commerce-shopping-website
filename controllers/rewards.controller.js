const User = require("../models/User.model");
const Reward = require("../models/Reward.model");
const ClaimedReward = require("../models/ClaimedReward.model");

// @desc    Get user's reward points, available rewards, claimed history
// @route   GET /api/rewards
// @access  Private
const getRewards = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // All active rewards created by any vendor
    const allRewards = await Reward.find({ isActive: true }).sort({ createdAt: -1 });

    const claimed = await ClaimedReward.find({ user: userId }).sort({
      createdAt: -1,
    });

    const claimedIds = claimed.map((item) => String(item.rewardId));

    const availableRewards = allRewards
      .filter((reward) => !claimedIds.includes(String(reward._id)))
      .map((reward) => ({
        id: reward._id,
        title: reward.title,
        desc: reward.desc,
        points: reward.points,
      }));

    const claimedRewards = claimed.map((item) => ({
      id: item.rewardId,
      title: item.title,
      desc: item.desc,
      points: item.points,
      claimedAt: new Date(item.createdAt).toLocaleDateString("en-IN"),
    }));

    res.status(200).json({
      totalPoints: user.rewardPoints,
      availableRewards,
      claimedRewards,
    });
  } catch (error) {
    console.error("Get rewards error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Claim a reward
// @route   POST /api/rewards/claim
// @access  Private
const claimReward = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { rewardId } = req.body;

    if (!rewardId) {
      return res.status(400).json({ message: "rewardId is required" });
    }

    const reward = await Reward.findOne({ _id: rewardId, isActive: true });

    if (!reward) {
      return res.status(404).json({ message: "Reward not found" });
    }

    const alreadyClaimed = await ClaimedReward.findOne({
      user: userId,
      rewardId: reward._id,
    });

    if (alreadyClaimed) {
      return res.status(400).json({ message: "Reward already claimed" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.rewardPoints < reward.points) {
      return res.status(400).json({
        message: `Not enough points. You need ${reward.points} points to claim this reward.`,
      });
    }

    user.rewardPoints -= reward.points;
    await user.save();

    const newClaim = await ClaimedReward.create({
      user: userId,
      rewardId: reward._id,
      title: reward.title,
      desc: reward.desc,
      points: reward.points,
    });

    res.status(201).json({
      message: "Reward claimed successfully",
      totalPoints: user.rewardPoints,
      claimedReward: {
        id: newClaim.rewardId,
        title: newClaim.title,
        desc: newClaim.desc,
        points: newClaim.points,
        claimedAt: new Date(newClaim.createdAt).toLocaleDateString("en-IN"),
      },
    });
  } catch (error) {
    console.error("Claim reward error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getRewards, claimReward };