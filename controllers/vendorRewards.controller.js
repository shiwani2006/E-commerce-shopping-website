const Reward = require("../models/Reward.model");

// @desc    Vendor: get all rewards created by this vendor
// @route   GET /api/vendor/rewards
// @access  Private (vendor)
const getVendorRewards = async (req, res) => {
  try {
    const vendorId = req.user.id || req.user._id;
    const rewards = await Reward.find({ vendor: vendorId }).sort({ createdAt: -1 });
    res.status(200).json(rewards);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch rewards", error: error.message });
  }
};

// @desc    Vendor: create a new reward
// @route   POST /api/vendor/rewards
// @access  Private (vendor)
const createVendorReward = async (req, res) => {
  try {
    const vendorId = req.user.id || req.user._id;
    const { title, desc, points } = req.body;

    if (!title || !desc || !points) {
      return res.status(400).json({ message: "title, desc and points are required" });
    }

    if (Number(points) <= 0) {
      return res.status(400).json({ message: "Points must be greater than 0" });
    }

    const reward = await Reward.create({
      vendor: vendorId,
      title,
      desc,
      points: Number(points),
    });

    res.status(201).json(reward);
  } catch (error) {
    res.status(500).json({ message: "Failed to create reward", error: error.message });
  }
};

// @desc    Vendor: update a reward
// @route   PUT /api/vendor/rewards/:id
// @access  Private (vendor)
const updateVendorReward = async (req, res) => {
  try {
    const vendorId = req.user.id || req.user._id;
    const { title, desc, points, isActive } = req.body;

    const reward = await Reward.findOne({ _id: req.params.id, vendor: vendorId });

    if (!reward) {
      return res.status(404).json({ message: "Reward not found" });
    }

    if (title !== undefined) reward.title = title;
    if (desc !== undefined) reward.desc = desc;
    if (points !== undefined) reward.points = Number(points);
    if (isActive !== undefined) reward.isActive = isActive;

    await reward.save();

    res.status(200).json(reward);
  } catch (error) {
    res.status(500).json({ message: "Failed to update reward", error: error.message });
  }
};

// @desc    Vendor: delete a reward
// @route   DELETE /api/vendor/rewards/:id
// @access  Private (vendor)
const deleteVendorReward = async (req, res) => {
  try {
    const vendorId = req.user.id || req.user._id;

    const reward = await Reward.findOneAndDelete({ _id: req.params.id, vendor: vendorId });

    if (!reward) {
      return res.status(404).json({ message: "Reward not found" });
    }

    res.status(200).json({ message: "Reward deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete reward", error: error.message });
  }
};

module.exports = {
  getVendorRewards,
  createVendorReward,
  updateVendorReward,
  deleteVendorReward,
};