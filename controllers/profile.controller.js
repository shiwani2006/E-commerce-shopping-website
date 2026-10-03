const User = require("../models/User.model");

// GET /api/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        state: user.state,
      },
      address: user.address,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /api/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, city, state } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, city, state },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        state: user.state,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /api/profile/address
exports.updateAddress = async (req, res) => {
  try {
    const { address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { address },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "Address updated successfully",
      address: user.address,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};