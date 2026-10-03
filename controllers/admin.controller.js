const User = require("../models/User.model");
const Order = require("../models/Order.model");
const Product = require("../models/Product.model");

// ---- Period config: how far back to look, and how to bucket the sales chart ----
const PERIOD_CONFIG = {
  "1W": { days: 7, bucket: "day" },
  "1M": { days: 30, bucket: "day" },
  "3M": { days: 90, bucket: "week" },
  "1Y": { days: 365, bucket: "month" },
};

// Orders that count as "real" business (exclude Cancelled from revenue/order stats)
const REVENUE_STATUSES = ["Placed", "Confirmed", "Shipped", "Delivered"];
// Orders still "in transit" for the ops-console pending count
const IN_TRANSIT_STATUSES = ["Placed", "Confirmed", "Shipped"];

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const pctGrowth = (current, previous) => {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const formatLabel = (key, bucket) => {
  if (bucket === "day") {
    const d = new Date(key);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  if (bucket === "week") {
    // key looks like "2026-W30"
    return key.split("-")[1];
  }
  // month bucket, key looks like "2026-07"
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", {
    month: "short",
  });
};

exports.getDashboard = async (req, res) => {
  try {
    const period = PERIOD_CONFIG[req.query.period] ? req.query.period : "3M";
    const { days, bucket } = PERIOD_CONFIG[period];

    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - days);

    const prevPeriodStart = new Date(periodStart);
    prevPeriodStart.setDate(prevPeriodStart.getDate() - days);

    const todayStart = startOfDay(now);

    // ---------- Today's sales (ops strip) ----------
    const [todaysSalesAgg] = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart },
          orderStatus: { $in: REVENUE_STATUSES },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    // ---------- Pending orders / vendor approvals (ops strip) ----------
    const [pendingOrders, pendingVendorApprovals] = await Promise.all([
      Order.countDocuments({ orderStatus: { $in: IN_TRANSIT_STATUSES } }),
      User.countDocuments({ role: "vendor", isApproved: false }),
    ]);

    // ---------- Current vs previous period: revenue & orders ----------
    const [[currentAgg], [prevAgg]] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: periodStart, $lte: now },
            orderStatus: { $in: REVENUE_STATUSES },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: prevPeriodStart, $lt: periodStart },
            orderStatus: { $in: REVENUE_STATUSES },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalRevenue = currentAgg?.revenue || 0;
    const totalOrders = currentAgg?.orders || 0;
    const prevRevenue = prevAgg?.revenue || 0;
    const prevOrders = prevAgg?.orders || 0;

    // ---------- Products ----------
    const [totalProducts, currentPeriodProducts, prevPeriodProducts] =
      await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ createdAt: { $gte: periodStart, $lte: now } }),
        Product.countDocuments({
          createdAt: { $gte: prevPeriodStart, $lt: periodStart },
        }),
      ]);

    // ---------- Active users (placed >=1 order in the period) ----------
    const [activeUsersCurrent, activeUsersPrev] = await Promise.all([
      Order.distinct("user", { createdAt: { $gte: periodStart, $lte: now } }),
      Order.distinct("user", {
        createdAt: { $gte: prevPeriodStart, $lt: periodStart },
      }),
    ]);

    const stats = {
      todaysSales: todaysSalesAgg?.total || 0,
      pendingOrders,
      pendingVendorApprovals,
      totalRevenue,
      revenueGrowth: pctGrowth(totalRevenue, prevRevenue),
      totalOrders,
      ordersGrowth: pctGrowth(totalOrders, prevOrders),
      totalProducts,
      productsGrowth: pctGrowth(currentPeriodProducts, prevPeriodProducts),
      activeUsers: activeUsersCurrent.length,
      usersGrowth: pctGrowth(activeUsersCurrent.length, activeUsersPrev.length),
    };

    // ---------- Sales overview, bucketed for the chart ----------
    const dateFormat =
      bucket === "day" ? "%Y-%m-%d" : bucket === "week" ? "%G-W%V" : "%Y-%m";

    const salesRaw = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: periodStart, $lte: now },
          orderStatus: { $in: REVENUE_STATUSES },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const salesOverview = salesRaw.map((r) => ({
      label: formatLabel(r._id, bucket),
      revenue: r.revenue,
      orders: r.orders,
    }));

    // ---------- Category breakdown ----------
    const categoryRaw = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: periodStart, $lte: now },
          orderStatus: { $in: REVENUE_STATUSES },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$productInfo.category", "Uncategorized"] },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 8 },
    ]);

    const categoryBreakdown = categoryRaw.map((c) => ({
      category: c._id,
      revenue: c.revenue,
    }));

    // ---------- Recent orders ----------
    const recentOrdersRaw = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(6)
      .select("shippingAddress totalAmount orderStatus createdAt");

    const recentOrders = recentOrdersRaw.map((o) => ({
      id: o._id,
      customerName: o.shippingAddress?.fullName || "Unknown",
      amount: o.totalAmount,
      status: o.orderStatus,
    }));

    return res.status(200).json({
      success: true,
      stats,
      salesOverview,
      categoryBreakdown,
      recentOrders,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};
/* =========================
   GET ALL PRODUCTS (Admin)
   GET /api/admin/products?status=Pending&vendor=<vendorId>
========================= */
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const { status, vendor } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (vendor) filter.vendor = vendor; // 🆕 specific vendor ke products

    const products = await Product.find(filter)
      .populate("vendor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Admin get products error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};
/* =========================
   UPDATE PRODUCT STATUS (Admin)
   PUT /api/admin/products/:id/status
   body: { status: "Active" | "Rejected" | "Inactive" | "Pending", rejectionReason }
========================= */
exports.updateProductStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const allowed = ["Pending", "Active", "Inactive", "Rejected"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        status,
        rejectionReason: status === "Rejected" ? rejectionReason || "" : "",
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: `Product marked as ${status}`,
      product,
    });
  } catch (error) {
    console.error("Update product status error:", error);
    res.status(500).json({ success: false, message: "Failed to update product status" });
  }
};

/* =========================
   DELETE PRODUCT (Admin)
   DELETE /api/admin/products/:id
========================= */
exports.deleteProductAdmin = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Admin delete product error:", error);
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
};
/* =========================
   GET ALL ORDERS (Admin)
   GET /api/admin/orders?status=Placed&payment=Paid&search=john&user=<userId>
========================= */
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const { status, payment, search, user } = req.query;

    const filter = {};
    if (status) filter.orderStatus = status;
    if (payment) filter.paymentStatus = payment;
    if (user) filter.user = user; // 🆕 specific customer ke orders
    if (search) {
      filter["shippingAddress.fullName"] = { $regex: search, $options: "i" };
    }

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Admin get orders error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

/* =========================
   UPDATE ORDER STATUS (Admin)
   PUT /api/admin/orders/:id/status
   body: { status: "Placed" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled" }
   Note: agar order Cancelled kiya jaata hai (aur pehle Cancelled nahi tha),
   toh stock automatically restore ho jaata hai.
========================= */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const wasAlreadyCancelled = order.orderStatus === "Cancelled";

    // 🆕 Agar naya status Cancelled hai aur pehle nahi tha, toh stock wapas add karo
    if (status === "Cancelled" && !wasAlreadyCancelled) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order marked as ${status}`,
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ success: false, message: "Failed to update order status" });
  }
};
/* =========================
   GET ALL CUSTOMERS (Admin)
========================= */
exports.getAllCustomersAdmin = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = { role: "customer" };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const customers = await User.find(filter)
      .select("name email phone city state isBlocked createdAt")
      .sort({ createdAt: -1 });

    const customerIds = customers.map((c) => c._id);

    // Har customer ke orders ka count aur total spend nikaalo
    const orderStats = await Order.aggregate([
      { $match: { user: { $in: customerIds } } },
      {
        $group: {
          _id: "$user",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
        },
      },
    ]);

    const statsMap = {};
    orderStats.forEach((s) => {
      statsMap[s._id.toString()] = {
        totalOrders: s.totalOrders,
        totalSpent: s.totalSpent,
      };
    });

    const result = customers.map((c) => ({
      _id: c._id,
      name: c.name,
      email: c.email,
      phone: c.phone || "",
      city: c.city || "",
      state: c.state || "",
      isBlocked: c.isBlocked || false,
      joinedAt: c.createdAt,
      totalOrders: statsMap[c._id.toString()]?.totalOrders || 0,
      totalSpent: statsMap[c._id.toString()]?.totalSpent || 0,
    }));

    res.status(200).json({
      success: true,
      count: result.length,
      customers: result,
    });
  } catch (error) {
    console.error("Admin get customers error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch customers" });
  }
};

/* =========================
   BLOCK / UNBLOCK CUSTOMER (Admin)
   PUT /api/admin/customers/:id/status
   body: { isBlocked: true | false }
========================= */
exports.toggleCustomerBlock = async (req, res) => {
  try {
    const { isBlocked } = req.body;

    const customer = await User.findOneAndUpdate(
      { _id: req.params.id, role: "customer" },
      { isBlocked: Boolean(isBlocked) },
      { new: true }
    ).select("name email isBlocked");

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({
      success: true,
      message: `Customer ${isBlocked ? "blocked" : "unblocked"} successfully`,
      customer,
    });
  } catch (error) {
    console.error("Toggle customer block error:", error);
    res.status(500).json({ success: false, message: "Failed to update customer status" });
  }
};
/* =========================
   GET ALL VENDORS (Admin)
   GET /api/admin/vendors?search=ritu&status=pending
   status: "pending" | "approved" | "" (all)
========================= */
exports.getAllVendorsAdmin = async (req, res) => {
  try {
    const { search, status } = req.query;

    const filter = { role: "vendor" };
    if (status === "pending") filter.isApproved = false;
    if (status === "approved") filter.isApproved = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const vendors = await User.find(filter)
      .select("name email phone city state isApproved isBlocked createdAt")
      .sort({ createdAt: -1 });

    const vendorIds = vendors.map((v) => v._id);

    // Har vendor ke products count
    const productStats = await Product.aggregate([
      { $match: { vendor: { $in: vendorIds } } },
      { $group: { _id: "$vendor", totalProducts: { $sum: 1 } } },
    ]);
    const productMap = {};
    productStats.forEach((p) => {
      productMap[p._id.toString()] = p.totalProducts;
    });

    // Har vendor ke orders count + revenue (jinme unka kam se kam ek item ho)
    const orderStats = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.vendor": { $in: vendorIds } } },
      {
        $group: {
          _id: "$items.vendor",
          totalOrders: { $addToSet: "$_id" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
    ]);
    const orderMap = {};
    orderStats.forEach((o) => {
      orderMap[o._id.toString()] = {
        totalOrders: o.totalOrders.length,
        revenue: o.revenue,
      };
    });

    const result = vendors.map((v) => ({
      _id: v._id,
      name: v.name,
      email: v.email,
      phone: v.phone || "",
      city: v.city || "",
      state: v.state || "",
      isApproved: v.isApproved,
      isBlocked: v.isBlocked || false,
      joinedAt: v.createdAt,
      totalProducts: productMap[v._id.toString()] || 0,
      totalOrders: orderMap[v._id.toString()]?.totalOrders || 0,
      revenue: orderMap[v._id.toString()]?.revenue || 0,
    }));

    res.status(200).json({
      success: true,
      count: result.length,
      vendors: result,
    });
  } catch (error) {
    console.error("Admin get vendors error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch vendors" });
  }
};

/* =========================
   APPROVE / REJECT VENDOR (Admin)
   PUT /api/admin/vendors/:id/approval
   body: { isApproved: true | false }
========================= */
exports.updateVendorApproval = async (req, res) => {
  try {
    const { isApproved } = req.body;

    const vendor = await User.findOneAndUpdate(
      { _id: req.params.id, role: "vendor" },
      { isApproved: Boolean(isApproved) },
      { new: true }
    ).select("name email isApproved");

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    res.status(200).json({
      success: true,
      message: `Vendor ${isApproved ? "approved" : "rejected"} successfully`,
      vendor,
    });
  } catch (error) {
    console.error("Update vendor approval error:", error);
    res.status(500).json({ success: false, message: "Failed to update vendor approval" });
  }
};

/* =========================
   BLOCK / UNBLOCK VENDOR (Admin)
   PUT /api/admin/vendors/:id/status
   body: { isBlocked: true | false }
========================= */
exports.toggleVendorBlock = async (req, res) => {
  try {
    const { isBlocked } = req.body;

    const vendor = await User.findOneAndUpdate(
      { _id: req.params.id, role: "vendor" },
      { isBlocked: Boolean(isBlocked) },
      { new: true }
    ).select("name email isBlocked");

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    res.status(200).json({
      success: true,
      message: `Vendor ${isBlocked ? "blocked" : "unblocked"} successfully`,
      vendor,
    });
  } catch (error) {
    console.error("Toggle vendor block error:", error);
    res.status(500).json({ success: false, message: "Failed to update vendor status" });
  }
};
const Coupon = require("../models/Coupon.model"); // 🆕 top pe is import ko add karo agar nahi hai

/* =========================
   GET ALL COUPONS (Admin)
   GET /api/admin/coupons?status=Pending
========================= */
exports.getAllCouponsAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const coupons = await Coupon.find(filter)
      .populate({
        path: "vendor",
        populate: { path: "user", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    console.error("Admin get coupons error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch coupons" });
  }
};

/* =========================
   UPDATE COUPON STATUS (Admin)
   PUT /api/admin/coupons/:id/status
   body: { status: "Approved" | "Rejected" | "Pending", rejectionReason }
========================= */
exports.updateCouponStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const allowed = ["Pending", "Approved", "Rejected"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      {
        status,
        rejectionReason: status === "Rejected" ? rejectionReason || "" : "",
      },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.status(200).json({
      success: true,
      message: `Coupon marked as ${status}`,
      coupon,
    });
  } catch (error) {
    console.error("Update coupon status error:", error);
    res.status(500).json({ success: false, message: "Failed to update coupon status" });
  }
};

/* =========================================================================
   ANALYTICS (Admin) — AdminAnalytics.jsx ke liye
   getDashboard (upar) already summary stats + revenue chart + category
   breakdown deta hai. Analytics page usi endpoint ko reuse karta hai,
   in 4 naye endpoints ke saath jo dashboard mein nahi hain.
   ========================================================================= */

/* GET /api/admin/analytics/top-vendors?period=3M
   -> [{ id, name, email, totalOrders, revenue }] top 5 by revenue */
exports.getTopVendorsAdmin = async (req, res) => {
  try {
    const period = PERIOD_CONFIG[req.query.period] ? req.query.period : "3M";
    const { days } = PERIOD_CONFIG[period];
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - days);

    const orderStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: periodStart, $lte: now },
          orderStatus: { $in: REVENUE_STATUSES },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.vendor",
          totalOrders: { $addToSet: "$_id" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    const vendorIds = orderStats.map((o) => o._id).filter(Boolean);
    const vendors = await User.find({ _id: { $in: vendorIds } }).select("name email");
    const vendorMap = {};
    vendors.forEach((v) => (vendorMap[v._id.toString()] = v));

    const result = orderStats
      .filter((o) => o._id && vendorMap[o._id.toString()])
      .map((o) => ({
        id: o._id,
        name: vendorMap[o._id.toString()].name,
        email: vendorMap[o._id.toString()].email,
        totalOrders: o.totalOrders.length,
        revenue: o.revenue,
      }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Top vendors error:", error);
    res.status(500).json({ success: false, message: "Failed to load top vendors" });
  }
};

/* GET /api/admin/analytics/top-products?period=3M
   -> [{ name, category, unitsSold, revenue }] top 8 by revenue */
exports.getTopProductsAdmin = async (req, res) => {
  try {
    const period = PERIOD_CONFIG[req.query.period] ? req.query.period : "3M";
    const { days } = PERIOD_CONFIG[period];
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - days);

    const productStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: periodStart, $lte: now },
          orderStatus: { $in: REVENUE_STATUSES },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          unitsSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 8 },
    ]);

    const productIds = productStats.map((p) => p._id).filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } }).select("category");
    const catMap = {};
    products.forEach((p) => (catMap[p._id.toString()] = p.category));

    const result = productStats.map((p) => ({
      name: p.name,
      category: p._id ? catMap[p._id.toString()] || "Uncategorized" : "Uncategorized",
      unitsSold: p.unitsSold,
      revenue: p.revenue,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Top products error:", error);
    res.status(500).json({ success: false, message: "Failed to load top products" });
  }
};

/* GET /api/admin/analytics/order-status
   -> [{ status, count, percent }] — poore platform ke saare orders
   (Cancelled bhi included hai — REVENUE_STATUSES filter nahi lagaya,
   kyunki ye breakdown poori order pipeline dikhane ke liye hai) */
exports.getOrderStatusBreakdownAdmin = async (req, res) => {
  try {
    const statusAgg = await Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]);

    const total = statusAgg.reduce((sum, s) => sum + s.count, 0) || 1;

    const result = statusAgg
      .map((s) => ({
        status: s._id,
        count: s.count,
        percent: Math.round((s.count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    res.status(200).json(result);
  } catch (error) {
    console.error("Order status breakdown error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load order status breakdown",
    });
  }
};

/* GET /api/admin/analytics/customer-growth
   -> [{ month, newCustomers }] pichle 6 mahine, User.createdAt (role=customer) se */
exports.getCustomerGrowthAdmin = async (req, res) => {
  try {
    const now = new Date();
    const monthsToShow = 6;
    const buckets = [];

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: d.toLocaleString("en-US", { month: "short" }),
        newCustomers: 0,
      });
    }

    const rangeStart = new Date(buckets[0].year, buckets[0].month, 1);

    const customers = await User.find({
      role: "customer",
      createdAt: { $gte: rangeStart },
    }).select("createdAt");

    for (const c of customers) {
      const created = new Date(c.createdAt);
      const bucket = buckets.find(
        (b) => b.year === created.getFullYear() && b.month === created.getMonth()
      );
      if (bucket) bucket.newCustomers += 1;
    }

    const result = buckets.map((b) => ({
      month: b.label,
      newCustomers: b.newCustomers,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Customer growth error:", error);
    res.status(500).json({ success: false, message: "Failed to load customer growth" });
  }
};

/* =========================================================================
   USERS (Admin) — Users.jsx ke liye
   Master directory: Customers + Vendors + Admins sab ek jagah — Customers.jsx
   aur Vendors.jsx already role-specific deep actions (approve, order history)
   handle karte hain, ye page sirf ek unified search/overview deta hai, aur
   sirf yahi jagah hai jahan Admin accounts bhi list mein dikhte hain.
   ========================================================================= */

/* GET /api/admin/users?search=&role=customer|vendor|admin */
exports.getAllUsersAdmin = async (req, res) => {
  try {
    const { search, role } = req.query;

    const filter = {};
    if (role && ["customer", "vendor", "admin"].includes(role)) {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("name email role phone city state isApproved isBlocked createdAt")
      .sort({ createdAt: -1 });

    const counts = {
      total: await User.countDocuments({}),
      customers: await User.countDocuments({ role: "customer" }),
      vendors: await User.countDocuments({ role: "vendor" }),
      admins: await User.countDocuments({ role: "admin" }),
    };

    res.status(200).json({
      success: true,
      count: users.length,
      counts,
      users,
    });
  } catch (error) {
    console.error("Admin get users error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

/* PUT /api/admin/users/:id/status
   body: { isBlocked: true | false }
   Admin accounts ko yahan se block nahi kiya ja sakta — safety measure */
exports.toggleUserBlock = async (req, res) => {
  try {
    const { isBlocked } = req.body;

    const target = await User.findById(req.params.id).select("role");
    if (!target) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (target.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts can't be blocked from here",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: Boolean(isBlocked) },
      { new: true }
    ).select("name email role isBlocked");

    res.status(200).json({
      success: true,
      message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
      user,
    });
  } catch (error) {
    console.error("Toggle user block error:", error);
    res.status(500).json({ success: false, message: "Failed to update user status" });
  }
};