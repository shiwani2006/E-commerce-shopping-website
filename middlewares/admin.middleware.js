const User = require("../models/User.model");

// Assumes auth.middleware's `protect` already ran and set req.user = decoded JWT payload.
// Re-fetches the user from DB rather than trusting the token's role claim,
// so a role change takes effect immediately without waiting for token expiry.
const adminOnly = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const user = await User.findById(req.user.id).select("role");

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authorization check failed",
    });
  }
};

module.exports = { adminOnly };