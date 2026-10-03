const jwt = require("jsonwebtoken");
const Vendor = require("../models/Vendor.model");

/**
 * protectVendor
 * Verifies the JWT (same secret as auth.middleware.js) and ensures the
 * logged-in user is an approved vendor. Attaches:
 *   req.user   -> decoded token payload { id, vendorId, role }
 *   req.vendor -> full Vendor document (so controllers can use req.vendor._id)
 */
const protectVendor = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token, authorization denied",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "vendor") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Vendor account required.",
      });
    }

    const vendor = await Vendor.findById(decoded.vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found",
      });
    }

    req.user = decoded;
    req.vendor = vendor;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token not valid",
    });
  }
};

module.exports = { protectVendor };