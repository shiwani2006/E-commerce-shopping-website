const bcrypt = require("bcryptjs");
const User = require("../models/User.model");

// PUT /api/security/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to change password", error: err.message });
  }
};

// GET /api/security/settings
exports.getSecuritySettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("twoFactorEnabled email");
    res.json({
      email: user.email,
      twoFactorEnabled: user.twoFactorEnabled || false,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch security settings", error: err.message });
  }
};

// PUT /api/security/toggle-2fa
exports.toggle2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.twoFactorEnabled = !user.twoFactorEnabled;
    await user.save();

    res.json({ twoFactorEnabled: user.twoFactorEnabled });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle 2FA", error: err.message });
  }
};