const vendorOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "vendor") {
    return res.status(403).json({ message: "Access denied. Vendor account required." });
  }
  next();
};

module.exports = { vendorOnly };