const Order = require("../models/Order.model");
const Product = require("../models/Product.model");
const Review = require("../models/Review.model");

const RANGE_TO_DAYS = { "7d": 7, "30d": 30, "6m": 182, "1y": 365 };

function rangeStartDate(range) {
  const days = RANGE_TO_DAYS[range] || RANGE_TO_DAYS["6m"];
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

// ---- Summary cards: total sales, orders, avg order value, conversion-ish ----
async function getSummary(vendorId) {
  const [orderAgg] = await Order.aggregate([
    { $match: { vendor: vendorId, status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$totalAmount" },
        totalOrders: { $sum: 1 },
        avgOrderValue: { $avg: "$totalAmount" },
      },
    },
  ]);

  const productCount = await Product.countDocuments({ vendor: vendorId });

  const [reviewAgg] = await Review.aggregate([
    { $match: { vendor: vendorId } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
  ]);

  return {
    totalSales: orderAgg?.totalSales || 0,
    totalOrders: orderAgg?.totalOrders || 0,
    avgOrderValue: Math.round(orderAgg?.avgOrderValue || 0),
    productCount,
    avgRating: Number((reviewAgg?.avgRating || 0).toFixed(1)),
    totalReviews: reviewAgg?.totalReviews || 0,
  };
}

// ---- Sales trend over time, bucketed by day/month depending on range ----
async function getSalesTrend(vendorId, range) {
  const start = rangeStartDate(range);
  const bucketFormat = range === "7d" || range === "30d" ? "%Y-%m-%d" : "%Y-%m";

  const rows = await Order.aggregate([
    {
      $match: {
        vendor: vendorId,
        createdAt: { $gte: start },
        status: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: bucketFormat, date: "$createdAt" } },
        sales: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return rows.map((r) => ({ label: r._id, sales: r.sales, orders: r.orders }));
}

// ---- Top selling products by revenue ----
async function getTopProducts(vendorId, limit = 5) {
  const rows = await Order.aggregate([
    { $match: { vendor: vendorId, status: { $ne: "cancelled" } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        unitsSold: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        name: "$product.name",
        unitsSold: 1,
        revenue: 1,
      },
    },
  ]);

  return rows;
}

// ---- Order status breakdown (pending/completed/cancelled etc.) ----
async function getOrderStatusBreakdown(vendorId) {
  const rows = await Order.aggregate([
    { $match: { vendor: vendorId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  return rows.map((r) => ({ status: r._id, count: r.count }));
}

module.exports = {
  getSummary,
  getSalesTrend,
  getTopProducts,
  getOrderStatusBreakdown,
};