const mongoose = require("mongoose");
const analyticsService = require("../services/analytics.service");

function getVendorId(req) {
  const rawId = req.user?.id || req.user?._id; // 👈 adjust here if your JWT payload uses a different field
  if (!rawId) return null;
  return new mongoose.Types.ObjectId(rawId);
}

exports.getSummary = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!vendorId) return res.status(401).json({ message: "Vendor not authenticated" });

    const summary = await analyticsService.getSummary(vendorId);
    res.status(200).json(summary);
  } catch (err) {
    console.error("analytics.getSummary error:", err);
    res.status(500).json({ message: "Failed to load analytics summary" });
  }
};

exports.getSalesTrend = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!vendorId) return res.status(401).json({ message: "Vendor not authenticated" });

    const range = req.query.range || "6m";
    const trend = await analyticsService.getSalesTrend(vendorId, range);
    res.status(200).json(trend);
  } catch (err) {
    console.error("analytics.getSalesTrend error:", err);
    res.status(500).json({ message: "Failed to load sales trend" });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!vendorId) return res.status(401).json({ message: "Vendor not authenticated" });

    const limit = Number(req.query.limit) || 5;
    const products = await analyticsService.getTopProducts(vendorId, limit);
    res.status(200).json(products);
  } catch (err) {
    console.error("analytics.getTopProducts error:", err);
    res.status(500).json({ message: "Failed to load top products" });
  }
};

exports.getOrderStatusBreakdown = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!vendorId) return res.status(401).json({ message: "Vendor not authenticated" });

    const breakdown = await analyticsService.getOrderStatusBreakdown(vendorId);
    res.status(200).json(breakdown);
  } catch (err) {
    console.error("analytics.getOrderStatusBreakdown error:", err);
    res.status(500).json({ message: "Failed to load order status breakdown" });
  }
};