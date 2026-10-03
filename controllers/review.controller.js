const mongoose = require("mongoose");
const Review = require("../models/Review.model");
const Product = require("../models/Product.model");
const Order = require("../models/Order.model");

// Recalculate product rating from visible reviews only
const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), status: "approved" } },
    { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await Product.findByIdAndUpdate(productId, {
    avgRating: stats[0] ? Math.round(stats[0].avg * 10) / 10 : 0,
    numReviews: stats[0] ? stats[0].count : 0,
  });
};

// POST /api/reviews (customer only)
const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating) {
      return res.status(400).json({ success: false, message: "productId and rating are required" });
    }

    const product = await Product.findById(productId);
    if (!product || product.status !== "Active") {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const purchased = await Order.exists({
      user: req.user.id,
      "items.product": product._id,
      orderStatus: "Delivered",
    });
    if (!purchased) {
      return res.status(403).json({ success: false, message: "You can review only products you have received" });
    }

    const review = await Review.create({
      product: product._id,
      vendor: product.vendor,
      user: req.user.id,
      rating,
      comment,
    });

    await updateProductRating(product._id);
    res.status(201).json({ success: true, review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "You already reviewed this product" });
    }
    console.error("createReview error:", error);
    res.status(500).json({ success: false, message: "Failed to create review" });
  }
};

// GET /api/reviews/:productId (public)
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, status: "approved" })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    console.error("getProductReviews error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};

// GET /api/reviews/my-reviews (vendor)
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ vendor: req.user.id, status: "approved" })
      .populate("user", "name")
      .populate("product", "name images")
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    console.error("getMyReviews error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};

// PUT /api/reviews/:id/reply (vendor, own products only)
const replyToReview = async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply || !reply.trim()) {
      return res.status(400).json({ success: false, message: "Reply cannot be empty" });
    }
    const review = await Review.findOne({ _id: req.params.id, vendor: req.user.id });
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    review.vendorReply = reply.trim();
    review.repliedAt = new Date();
    await review.save();
    res.json({ success: true, review });
  } catch (error) {
    console.error("replyToReview error:", error);
    res.status(500).json({ success: false, message: "Failed to reply" });
  }
};

// GET /api/reviews/admin/all (admin)
const adminGetAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("vendor", "name email")
      .populate("product", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    console.error("adminGetAllReviews error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};

// PUT /api/reviews/admin/:id/status (admin)
const adminSetReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "hidden"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    await updateProductRating(review.product);
    res.json({ success: true, review });
  } catch (error) {
    console.error("adminSetReviewStatus error:", error);
    res.status(500).json({ success: false, message: "Failed to update review" });
  }
};

// ---------- Analytics ----------
const buildReviewStats = async (extraMatch = {}) => {
  const match = { status: "approved", ...extraMatch };

  const [summary, distribution, topVendors, lowProducts, hidden] = await Promise.all([
    Review.aggregate([
      { $match: match },
      { $group: { _id: null, avg: { $avg: "$rating" }, total: { $sum: 1 } } },
    ]),
    Review.aggregate([
      { $match: match },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]),
    Review.aggregate([
      { $match: match },
      { $group: { _id: "$vendor", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
      { $sort: { avg: -1, count: -1 } },
      { $limit: 5 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "u" } },
      { $project: { _id: 0, id: "$_id", name: { $arrayElemAt: ["$u.name", 0] }, avg: { $round: ["$avg", 1] }, count: 1 } },
    ]),
    Product.find({ ...(extraMatch.vendor ? { vendor: extraMatch.vendor } : {}), numReviews: { $gte: 1 } })
      .sort({ avgRating: 1 })
      .limit(5)
      .select("name avgRating numReviews"),
    Review.countDocuments({ ...extraMatch, status: "hidden" }),
  ]);

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: distribution.find((d) => d._id === star)?.count || 0,
  }));

  return {
    avgRating: summary[0] ? Math.round(summary[0].avg * 10) / 10 : 0,
    totalReviews: summary[0]?.total || 0,
    hiddenReviews: hidden,
    distribution: dist,
    topVendors,
    lowestRatedProducts: lowProducts,
  };
};

// GET /api/reviews/admin/analytics (admin)
const adminReviewAnalytics = async (req, res) => {
  try {
    res.json({ success: true, stats: await buildReviewStats() });
  } catch (error) {
    console.error("adminReviewAnalytics error:", error);
    res.status(500).json({ success: false, message: "Failed to load review analytics" });
  }
};

// GET /api/reviews/my-analytics (vendor)
const vendorReviewAnalytics = async (req, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.user.id);
    res.json({ success: true, stats: await buildReviewStats({ vendor: vendorId }) });
  } catch (error) {
    console.error("vendorReviewAnalytics error:", error);
    res.status(500).json({ success: false, message: "Failed to load review analytics" });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getMyReviews,
  replyToReview,
  adminGetAllReviews,
  adminSetReviewStatus,
  adminReviewAnalytics,
  vendorReviewAnalytics,
};