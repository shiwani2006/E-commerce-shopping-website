const bcrypt = require("bcryptjs");
const User = require("../models/User.model");

const FIELDS = "name email phone city state address createdAt";

// GET /api/admin-profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(FIELDS);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, profile: user });
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ success: false, message: "Failed to load profile" });
  }
};

// PUT /api/admin-profile   (email cannot be changed here)
const updateProfile = async (req, res) => {
  try {
    const { name, phone, city, state, address } = req.body;
    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ success: false, message: "Name cannot be empty" });
    }
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone;
    if (city !== undefined) updates.city = city;
    if (state !== undefined) updates.state = state;
    if (address !== undefined) updates.address = address;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select(FIELDS);
    res.json({ success: true, profile: user });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

// PUT /api/admin-profile/password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(400).json({ success: false, message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: "Password changed" });
  } catch (error) {
    console.error("changePassword error:", error);
    res.status(500).json({ success: false, message: "Failed to change password" });
  }
};

module.exports = { getProfile, updateProfile, changePassword };