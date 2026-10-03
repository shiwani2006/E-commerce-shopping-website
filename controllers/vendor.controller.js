const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User.model");
const Vendor = require("../models/Vendor.model");
const Product = require("../models/Product.model");
const Order = require("../models/Order.model");
const Transaction = require("../models/Transaction.model");

/* =========================
   VENDOR LOGIN
   POST /api/vendor/login
   (separate from customer /api/auth/login)
========================= */
exports.vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email, role: "vendor" });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your vendor account is pending admin approval",
      });
    }

    // 🔴 FIX: same isBlocked check missing here too — vendor account
    // blocked via Admin → Users/Vendors could still log in via this route.
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact support.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const vendor = await Vendor.findOne({ user: user._id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found for this account",
      });
    }

    // 🆕 Settings → Danger Zone → Deactivate Account check
    if (vendor.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "This vendor account has been deactivated. Contact support to reactivate.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        vendorId: vendor._id,
        role: "vendor",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      vendor: {
        id: vendor._id,
        name: user.name,
        email: user.email,
        phone: vendor.phone,
        kycVerified: vendor.kycVerified,
      },
    });
  } catch (error) {
    console.error("Vendor login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================================================================
   SHARED HELPERS (used by dashboard + earnings + analytics)
   ========================================================================= */

// Vendor ke saare products ke _id nikalo (Product.vendor == User._id)
async function getVendorProductIds(vendorUserId) {
  const products = await Product.find({ vendor: vendorUserId }).select("_id");
  return products.map((p) => p._id);
}

// Un orders ko nikalo jinme vendor ka kam se kam ek product ho, aur
// har order ke saath sirf uska "apna" revenue (sirf apne items ka sum)
async function getVendorOrdersWithRevenue(productIds) {
  const orders = await Order.find({ "items.product": { $in: productIds } });

  return orders.map((order) => {
    let orderRevenue = 0;
    for (const item of order.items) {
      if (productIds.some((id) => id.equals(item.product))) {
        orderRevenue += item.price * item.quantity;
      }
    }
    return { order, orderRevenue };
  });
}

// Is mahine vs pichle mahine ka revenue split karo (growth % calculate karne ke liye)
function splitRevenueByMonth(ordersWithRevenue) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  let thisMonthRevenue = 0;
  let lastMonthRevenue = 0;

  for (const { order, orderRevenue } of ordersWithRevenue) {
    const created = new Date(order.createdAt);
    if (created >= thisMonthStart) {
      thisMonthRevenue += orderRevenue;
    } else if (created >= lastMonthStart && created < thisMonthStart) {
      lastMonthRevenue += orderRevenue;
    }
  }

  return { thisMonthRevenue, lastMonthRevenue };
}

// Growth % nikalo. Agar is mahine 0 hai aur pichle mahine tha, null return
// karo (misleading "-100%" dikhane se behtar hai frontend "No orders yet" dikhaye)
function computeGrowthPct(thisMonthRevenue, lastMonthRevenue) {
  if (thisMonthRevenue === 0 && lastMonthRevenue > 0) return null;
  if (lastMonthRevenue > 0) {
    return Math.round(
      ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    );
  }
  if (thisMonthRevenue > 0) return 100;
  return 0;
}

/* =========================
   VENDOR DASHBOARD STATS
   GET /api/vendor/dashboard
   (matches the 4 cards in the dashboard UI)
========================= */
exports.getDashboardStats = async (req, res) => {
  try {
    const vendorUserId = req.vendor.user;

    const productIds = await getVendorProductIds(vendorUserId);
    const productsListed = productIds.length;

    const ordersWithRevenue = await getVendorOrdersWithRevenue(productIds);
    const ordersReceived = ordersWithRevenue.length;

    let revenueEarned = 0;
    let pendingDeliveries = 0;
    const uniqueCustomerIds = new Set();

    for (const { order, orderRevenue } of ordersWithRevenue) {
      revenueEarned += orderRevenue;

      if (orderRevenue > 0 && order.user) {
        uniqueCustomerIds.add(order.user.toString());
      }

      if (["Placed", "Processing", "Shipped"].includes(order.orderStatus)) {
        pendingDeliveries += 1;
      }
    }

    const totalCustomers = uniqueCustomerIds.size;

    res.status(200).json({
      success: true,
      stats: {
        productsListed,
        ordersReceived,
        revenueEarned,
        pendingDeliveries,
        totalOrders: ordersReceived,
        totalCustomers,
        revenue: revenueEarned,
      },
    });
  } catch (error) {
    console.error("Vendor dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard stats",
    });
  }
};

/* =========================
   GET VENDOR PROFILE / MY SHOP
   GET /api/vendor/profile
========================= */
exports.getMyShop = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id).populate(
      "user",
      "name email phone city state address"
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found",
      });
    }

    const shopProfile = {
      _id: vendor._id,
      storeName: vendor.storeName || "",
      tagline: vendor.tagline || "",
      description: vendor.description || "",
      category: vendor.category || "Multi-Category",
      established: vendor.established || "",
      location: vendor.location || "",
      phone: vendor.phone || "",
      email: vendor.user?.email || "",
      website: vendor.website || "",
      logoUrl: vendor.logoUrl || "",
      bannerUrl: vendor.bannerUrl || "",
      kycVerified: vendor.kycVerified,
      totalEarnings: vendor.totalEarnings,
      monthlyGoal: vendor.monthlyGoal || 0,
      // 🆕 Settings tab fields — same vendor doc, single source of truth
      notificationPrefs: vendor.notificationPrefs || {
        emailNotif: true,
        pushNotif: false,
        smsNotif: false,
        orderNotif: true,
        reviewNotif: true,
      },
      gstNumber: vendor.gstNumber || "",
      panNumber: vendor.panNumber || "",
      bankAccountNumber: vendor.bankAccountNumber || "",
      ifscCode: vendor.ifscCode || "",
      isStoreVisible: vendor.isStoreVisible !== false,
    };

    res.status(200).json({
      success: true,
      vendor: shopProfile,
    });
  } catch (error) {
    console.error("Get shop error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shop profile",
    });
  }
};

/* =========================
   UPDATE VENDOR PROFILE / MY SHOP
   PUT /api/vendor/profile
========================= */
exports.updateMyShop = async (req, res) => {
  try {
    const {
      storeName,
      tagline,
      description,
      category,
      established,
      location,
      phone,
      website,
      logoUrl,
      bannerUrl,
      address,
      monthlyGoal,
      notificationPrefs,
      gstNumber,
      panNumber,
      bankAccountNumber,
      ifscCode,
      isStoreVisible,
    } = req.body;

    const updateData = {};
    if (storeName !== undefined) updateData.storeName = storeName;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (established !== undefined) updateData.established = established;
    if (location !== undefined) updateData.location = location;
    if (phone !== undefined) updateData.phone = phone;
    if (website !== undefined) updateData.website = website;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;
    if (address !== undefined) updateData.address = address;
    if (monthlyGoal !== undefined) updateData.monthlyGoal = Number(monthlyGoal) || 0;
    // 🆕 Settings tab fields
    if (notificationPrefs !== undefined) updateData.notificationPrefs = notificationPrefs;
    if (gstNumber !== undefined) updateData.gstNumber = gstNumber;
    if (panNumber !== undefined) updateData.panNumber = panNumber;
    if (bankAccountNumber !== undefined) updateData.bankAccountNumber = bankAccountNumber;
    if (ifscCode !== undefined) updateData.ifscCode = ifscCode;
    if (isStoreVisible !== undefined) updateData.isStoreVisible = isStoreVisible;

    const vendor = await Vendor.findByIdAndUpdate(
      req.vendor._id,
      updateData,
      { new: true, runValidators: true }
    ).populate("user", "name email phone city state address");

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found",
      });
    }

    const shopProfile = {
      _id: vendor._id,
      storeName: vendor.storeName || "",
      tagline: vendor.tagline || "",
      description: vendor.description || "",
      category: vendor.category || "Multi-Category",
      established: vendor.established || "",
      location: vendor.location || "",
      phone: vendor.phone || "",
      email: vendor.user?.email || "",
      website: vendor.website || "",
      logoUrl: vendor.logoUrl || "",
      bannerUrl: vendor.bannerUrl || "",
      kycVerified: vendor.kycVerified,
      totalEarnings: vendor.totalEarnings,
      monthlyGoal: vendor.monthlyGoal || 0,
      notificationPrefs: vendor.notificationPrefs || {
        emailNotif: true,
        pushNotif: false,
        smsNotif: false,
        orderNotif: true,
        reviewNotif: true,
      },
      gstNumber: vendor.gstNumber || "",
      panNumber: vendor.panNumber || "",
      bankAccountNumber: vendor.bankAccountNumber || "",
      ifscCode: vendor.ifscCode || "",
      isStoreVisible: vendor.isStoreVisible !== false,
    };

    res.status(200).json({
      success: true,
      message: "Shop profile updated",
      shop: shopProfile,
      vendor: shopProfile,
    });
  } catch (error) {
    console.error("Update shop error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update shop profile",
      error: error.message,
    });
  }
};

/* =========================================================================
   EARNINGS — VendorEarnings.jsx ke liye
   ========================================================================= */

/* GET /api/vendor/earnings/summary
   -> { totalRevenue, availableBalance, monthlyGrowthPct, withdrawals } */
exports.getEarningsSummary = async (req, res) => {
  try {
    const vendorUserId = req.vendor.user;

    const productIds = await getVendorProductIds(vendorUserId);
    const ordersWithRevenue = await getVendorOrdersWithRevenue(productIds);

    const totalRevenue = ordersWithRevenue.reduce(
      (sum, o) => sum + o.orderRevenue,
      0
    );

    const withdrawalTxns = await Transaction.find({
      user: vendorUserId,
      type: "debit",
    });
    const withdrawals = withdrawalTxns.reduce((sum, t) => sum + t.amount, 0);

    const availableBalance = Math.max(totalRevenue - withdrawals, 0);

    const { thisMonthRevenue, lastMonthRevenue } =
      splitRevenueByMonth(ordersWithRevenue);
    const monthlyGrowthPct = computeGrowthPct(thisMonthRevenue, lastMonthRevenue);

    res.status(200).json({
      success: true,
      totalRevenue,
      availableBalance,
      monthlyGrowthPct,
      withdrawals,
    });
  } catch (error) {
    console.error("Earnings summary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load earnings summary",
    });
  }
};

/* GET /api/vendor/earnings/chart?range=6m
   -> [{ month: "Jan", earnings: 45000 }, ...]
   (Analytics ka "Revenue Growth" chart bhi isi endpoint ko reuse karta hai) */
exports.getEarningsChart = async (req, res) => {
  try {
    const vendorUserId = req.vendor.user;

    const productIds = await getVendorProductIds(vendorUserId);
    const ordersWithRevenue = await getVendorOrdersWithRevenue(productIds);

    const monthsToShow = 6;
    const now = new Date();
    const buckets = [];

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: d.toLocaleString("en-IN", { month: "short" }),
        earnings: 0,
      });
    }

    for (const { order, orderRevenue } of ordersWithRevenue) {
      const created = new Date(order.createdAt);
      const bucket = buckets.find(
        (b) => b.year === created.getFullYear() && b.month === created.getMonth()
      );
      if (bucket) {
        bucket.earnings += orderRevenue;
      }
    }

    const chartData = buckets.map((b) => ({
      month: b.label,
      earnings: b.earnings,
    }));

    res.status(200).json(chartData);
  } catch (error) {
    console.error("Earnings chart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load earnings chart",
    });
  }
};

/* GET /api/vendor/earnings/transactions?limit=6
   -> [{ id, date, amount, status }] */
exports.getEarningsTransactions = async (req, res) => {
  try {
    const vendorUserId = req.vendor.user;
    const limit = parseInt(req.query.limit, 10) || 10;

    const txns = await Transaction.find({ user: vendorUserId })
      .sort({ date: -1 })
      .limit(limit);

    const formatted = txns.map((t) => ({
      id: t._id,
      date: new Date(t.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      amount: t.amount,
      status: t.status || "Completed",
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Earnings transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load transactions",
    });
  }
};

/* POST /api/vendor/earnings/withdraw
   -> pura available balance ek "debit" Transaction ke roop mein withdraw karta hai */
exports.withdrawFunds = async (req, res) => {
  try {
    const vendorUserId = req.vendor.user;

    const productIds = await getVendorProductIds(vendorUserId);
    const ordersWithRevenue = await getVendorOrdersWithRevenue(productIds);
    const totalRevenue = ordersWithRevenue.reduce(
      (sum, o) => sum + o.orderRevenue,
      0
    );

    const withdrawalTxns = await Transaction.find({
      user: vendorUserId,
      type: "debit",
    });
    const alreadyWithdrawn = withdrawalTxns.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const availableBalance = totalRevenue - alreadyWithdrawn;

    if (availableBalance <= 0) {
      return res.status(400).json({
        success: false,
        message: "No balance available to withdraw",
      });
    }

    const txn = await Transaction.create({
      user: vendorUserId,
      name: "Vendor Withdrawal",
      mode: "Bank Transfer",
      amount: availableBalance,
      type: "debit",
      status: "Completed",
      date: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Withdrawal successful",
      transaction: txn,
    });
  } catch (error) {
    console.error("Withdraw error:", error);
    res.status(500).json({
      success: false,
      message: "Withdrawal failed",
    });
  }
};

/* GET /api/vendor/earnings/export
   -> CSV file download of this vendor's transaction history */
exports.exportEarningsReport = async (req, res) => {
  try {
    const vendorUserId = req.vendor.user;

    const txns = await Transaction.find({ user: vendorUserId }).sort({
      date: -1,
    });

    let csv = "Transaction ID,Date,Type,Amount,Status\n";
    txns.forEach((t) => {
      const dateStr = new Date(t.date).toLocaleDateString("en-IN");
      csv += `${t._id},${dateStr},${t.type},${t.amount},${t.status || "Completed"}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=earnings-report.csv"
    );
    res.status(200).send(csv);
  } catch (error) {
    console.error("Export earnings error:", error);
    res.status(500).json({
      success: false,
      message: "Export failed",
    });
  }
};

/* =========================================================================
   ANALYTICS — VendorAnalytics.jsx ke liye
   ========================================================================= */

/* GET /api/vendor/analytics/summary
   -> { revenue, orders, growthPct, customers } (top 4 stat cards) */
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const vendorUserId = req.vendor.user;

    const productIds = await getVendorProductIds(vendorUserId);
    const ordersWithRevenue = await getVendorOrdersWithRevenue(productIds);

    const revenue = ordersWithRevenue.reduce(
      (sum, o) => sum + o.orderRevenue,
      0
    );
    const orders = ordersWithRevenue.length;

    const uniqueCustomerIds = new Set();
    for (const { order, orderRevenue } of ordersWithRevenue) {
      if (orderRevenue > 0 && order.user) {
        uniqueCustomerIds.add(order.user.toString());
      }
    }
    const customers = uniqueCustomerIds.size;

    const { thisMonthRevenue, lastMonthRevenue } =
      splitRevenueByMonth(ordersWithRevenue);
    const growthPct = computeGrowthPct(thisMonthRevenue, lastMonthRevenue);

    res.status(200).json({
      success: true,
      revenue,
      orders,
      growthPct,
      customers,
    });
  } catch (error) {
    console.error("Analytics summary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load analytics summary",
    });
  }
};

/* GET /api/vendor/analytics/product-sales
   -> [{ name, sales }] — top products by units sold (bar chart) */
exports.getProductSalesBreakdown = async (req, res) => {
  try {
    const vendorUserId = req.vendor.user;
    const productIds = await getVendorProductIds(vendorUserId);
    const orders = await Order.find({ "items.product": { $in: productIds } });

    const salesByProduct = {};

    for (const order of orders) {
      for (const item of order.items) {
        if (productIds.some((id) => id.equals(item.product))) {
          salesByProduct[item.name] =
            (salesByProduct[item.name] || 0) + item.quantity;
        }
      }
    }

    const result = Object.entries(salesByProduct)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 6);

    res.status(200).json(result);
  } catch (error) {
    console.error("Product sales breakdown error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load product sales",
    });
  }
};

/* GET /api/vendor/analytics/top-products
   -> [{ name, revenue, progress }] — top 3 by revenue */
exports.getTopProducts = async (req, res) => {
  try {
    const vendorUserId = req.vendor.user;
    const productIds = await getVendorProductIds(vendorUserId);
    const orders = await Order.find({ "items.product": { $in: productIds } });

    const revenueByProduct = {};

    for (const order of orders) {
      for (const item of order.items) {
        if (productIds.some((id) => id.equals(item.product))) {
          revenueByProduct[item.name] =
            (revenueByProduct[item.name] || 0) + item.price * item.quantity;
        }
      }
    }

    const sorted = Object.entries(revenueByProduct)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    const maxRevenue = sorted[0]?.revenue || 1;
    const result = sorted.map((p) => ({
      name: p.name,
      revenue: p.revenue,
      progress: Math.round((p.revenue / maxRevenue) * 100),
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Top products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load top products",
    });
  }
};

/* GET /api/vendor/analytics/customer-stats
   -> { newCustomers, returningPct, avgOrderValue }
   (Traffic ka "Avg Session Time" track nahi ho sakta — uski jagah
   "Avg Order Value" — ye genuinely calculate ho sakta hai) */
exports.getCustomerStats = async (req, res) => {
  try {
    const vendorUserId = req.vendor.user;
    const productIds = await getVendorProductIds(vendorUserId);
    const ordersWithRevenue = await getVendorOrdersWithRevenue(productIds);

    const myOrders = ordersWithRevenue.filter((o) => o.orderRevenue > 0);

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const orderCountByCustomer = {};
    const firstOrderDateByCustomer = {};

    for (const { order } of myOrders) {
      if (!order.user) continue;
      const uid = order.user.toString();
      const created = new Date(order.createdAt);

      orderCountByCustomer[uid] = (orderCountByCustomer[uid] || 0) + 1;

      if (!firstOrderDateByCustomer[uid] || created < firstOrderDateByCustomer[uid]) {
        firstOrderDateByCustomer[uid] = created;
      }
    }

    let newCustomers = 0;
    for (const firstDate of Object.values(firstOrderDateByCustomer)) {
      if (firstDate >= thisMonthStart) newCustomers += 1;
    }

    const totalCustomers = Object.keys(orderCountByCustomer).length;
    const returningCustomers = Object.values(orderCountByCustomer).filter(
      (c) => c > 1
    ).length;
    const returningPct =
      totalCustomers > 0
        ? Math.round((returningCustomers / totalCustomers) * 100)
        : 0;

    const totalRevenue = myOrders.reduce((sum, o) => sum + o.orderRevenue, 0);
    const avgOrderValue =
      myOrders.length > 0 ? Math.round(totalRevenue / myOrders.length) : 0;

    res.status(200).json({
      success: true,
      newCustomers,
      returningPct,
      avgOrderValue,
    });
  } catch (error) {
    console.error("Customer stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load customer stats",
    });
  }
};

/* GET /api/vendor/analytics/order-status
   -> [{ status, count, percent }]
   (Traffic Sources track nahi ho sakta — uski jagah ye real, useful
   breakdown hai ki vendor ke orders kis stage pe hain) */
exports.getOrderStatusBreakdown = async (req, res) => {
  try {
    const vendorUserId = req.vendor.user;
    const productIds = await getVendorProductIds(vendorUserId);
    const orders = await Order.find({ "items.product": { $in: productIds } });

    const counts = {};
    for (const order of orders) {
      counts[order.orderStatus] = (counts[order.orderStatus] || 0) + 1;
    }

    const total = orders.length || 1;
    const result = Object.entries(counts)
      .map(([status, count]) => ({
        status,
        count,
        percent: Math.round((count / total) * 100),
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

/* GET /api/vendor/analytics/goal
   -> { goalAmount, currentRevenue, percent }
   goalAmount vendor MyShop mein set karta hai (Vendor.monthlyGoal) */
exports.getGoalProgress = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id);
    const vendorUserId = req.vendor.user;

    const productIds = await getVendorProductIds(vendorUserId);
    const ordersWithRevenue = await getVendorOrdersWithRevenue(productIds);
    const { thisMonthRevenue } = splitRevenueByMonth(ordersWithRevenue);

    const goalAmount = vendor?.monthlyGoal || 0;
    const percent =
      goalAmount > 0
        ? Math.min(100, Math.round((thisMonthRevenue / goalAmount) * 100))
        : 0;

    res.status(200).json({
      success: true,
      goalAmount,
      currentRevenue: thisMonthRevenue,
      percent,
    });
  } catch (error) {
    console.error("Goal progress error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load goal progress",
    });
  }
};

/* GET /api/vendor/analytics/insight
   -> { bestProduct, bestProductRevenue, growthPct }
   Real AI nahi hai — vendor ke apne data se seedha nikala gaya,
   honest data-driven summary */
exports.getBusinessInsight = async (req, res) => {
  try {
    const vendorUserId = req.vendor.user;
    const productIds = await getVendorProductIds(vendorUserId);
    const orders = await Order.find({ "items.product": { $in: productIds } });

    const revenueByProduct = {};
    for (const order of orders) {
      for (const item of order.items) {
        if (productIds.some((id) => id.equals(item.product))) {
          revenueByProduct[item.name] =
            (revenueByProduct[item.name] || 0) + item.price * item.quantity;
        }
      }
    }

    const sorted = Object.entries(revenueByProduct).sort(
      (a, b) => b[1] - a[1]
    );
    const bestProduct = sorted[0]?.[0] || null;
    const bestProductRevenue = sorted[0]?.[1] || 0;

    const ordersWithRevenue = await getVendorOrdersWithRevenue(productIds);
    const { thisMonthRevenue, lastMonthRevenue } =
      splitRevenueByMonth(ordersWithRevenue);
    const growthPct = computeGrowthPct(thisMonthRevenue, lastMonthRevenue);

    res.status(200).json({
      success: true,
      bestProduct,
      bestProductRevenue,
      growthPct,
    });
  } catch (error) {
    console.error("Business insight error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load business insight",
    });
  }
};

/* =========================================================================
   SETTINGS — VendorSettings.jsx ke liye (Profile / Security / Danger Zone)
   ========================================================================= */

/* GET /api/vendor/settings/profile
   -> { name, email, phone }
   name/email User model se, phone Vendor model se (jaisa MyShop mein bhi hai) */
exports.getAccountProfile = async (req, res) => {
  try {
    const user = await User.findById(req.vendor.user).select("name email");

    res.status(200).json({
      success: true,
      name: user?.name || "",
      email: user?.email || "",
      phone: req.vendor.phone || "",
    });
  } catch (error) {
    console.error("Get account profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load profile",
    });
  }
};

/* PUT /api/vendor/settings/profile -> { name, phone }
   Email jaan-boojh kar editable nahi hai yahan — login email change karne
   ke liye alag verification flow chahiye hota hai, jo abhi implement nahi hai */
exports.updateAccountProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (name !== undefined) {
      await User.findByIdAndUpdate(req.vendor.user, { name });
    }
    if (phone !== undefined) {
      await Vendor.findByIdAndUpdate(req.vendor._id, { phone });
    }

    const user = await User.findById(req.vendor.user).select("name email");
    const vendor = await Vendor.findById(req.vendor._id).select("phone");

    res.status(200).json({
      success: true,
      message: "Profile updated",
      name: user?.name || "",
      email: user?.email || "",
      phone: vendor?.phone || "",
    });
  } catch (error) {
    console.error("Update account profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

/* PUT /api/vendor/settings/password -> { currentPassword, newPassword } */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both current and new password are required",
      });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    const user = await User.findById(req.vendor.user);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update password",
    });
  }
};

/* PUT /api/vendor/settings/deactivate
   -> vendor.isActive = false (vendorLogin isse check karke login block karta hai) */
exports.deactivateAccount = async (req, res) => {
  try {
    await Vendor.findByIdAndUpdate(req.vendor._id, { isActive: false });
    res.status(200).json({
      success: true,
      message: "Account deactivated",
    });
  } catch (error) {
    console.error("Deactivate account error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deactivate account",
    });
  }
};

/* DELETE /api/vendor/settings/account
   -> is vendor ke saare Products, Vendor doc, aur User doc permanently delete
   karta hai. Irreversible — frontend confirmation dialog ke baad hi call hota hai */
exports.deleteAccount = async (req, res) => {
  try {
    const vendorUserId = req.vendor.user;

    await Product.deleteMany({ vendor: vendorUserId });
    await Vendor.findByIdAndDelete(req.vendor._id);
    await User.findByIdAndDelete(vendorUserId);

    res.status(200).json({
      success: true,
      message: "Account permanently deleted",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete account",
    });
  }
};