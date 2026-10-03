const mongoose = require("mongoose");
const Order = require("../models/Order.model");
const Withdrawal = require("../models/Withdrawal.model");

/* =========================================================================
   CONFIG (optional .env):
   PLATFORM_COMMISSION_PCT=10
   MIN_WITHDRAWAL=500
   ========================================================================= */
const COMMISSION_PCT = Number(process.env.PLATFORM_COMMISSION_PCT ?? 10);
const MIN_WITHDRAWAL = Number(process.env.MIN_WITHDRAWAL ?? 500);

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/* ------------------------------ helpers ------------------------------ */

const round2 = (n) => Math.round(n * 100) / 100;
const toNet = (gross) => round2(gross * (1 - COMMISSION_PCT / 100));

// req.vendor.user === User._id (matches Order.items.vendor)
const getVendorId = (req) => new mongoose.Types.ObjectId(String(req.vendor.user));

// Sirf us vendor ke items, sirf Delivered orders
const deliveredItemsPipeline = (vendorId, extraMatch = {}) => [
  {
    $match: {
      orderStatus: "Delivered",
      "items.vendor": vendorId,
      ...extraMatch,
    },
  },
  { $unwind: "$items" },
  { $match: { "items.vendor": vendorId } },
];

const lineTotal = { $multiply: ["$items.price", "$items.quantity"] };

// Last `count` months ke slots (IST ke hisaab se)
function buildMonthSlots(count) {
  const ist = new Date(Date.now() + IST_OFFSET_MS);
  const y = ist.getUTCFullYear();
  const m = ist.getUTCMonth();
  const slots = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - i, 1));
    const yy = d.getUTCFullYear();
    const mm = d.getUTCMonth();
    slots.push({
      key: `${yy}-${String(mm + 1).padStart(2, "0")}`,
      label: MONTHS[mm],
      start: new Date(d.getTime() - IST_OFFSET_MS),
    });
  }
  return slots;
}

async function getMonthlyNet(vendorId, count) {
  const slots = buildMonthSlots(count);
  const rows = await Order.aggregate([
    ...deliveredItemsPipeline(vendorId, { updatedAt: { $gte: slots[0].start } }),
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m",
            date: "$updatedAt",
            timezone: "Asia/Kolkata",
          },
        },
        gross: { $sum: lineTotal },
      },
    },
  ]);
  const map = new Map(rows.map((r) => [r._id, r.gross]));
  return slots.map((s) => ({
    month: s.label,
    earnings: toNet(map.get(s.key) || 0),
  }));
}

async function getBalance(vendorId) {
  const [grossRows, withdrawnRows] = await Promise.all([
    Order.aggregate([
      ...deliveredItemsPipeline(vendorId),
      { $group: { _id: null, gross: { $sum: lineTotal } } },
    ]),
    Withdrawal.aggregate([
      { $match: { vendor: vendorId, status: { $in: ["Pending", "Completed"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const totalEarnings = toNet(grossRows[0]?.gross || 0);
  const withdrawn = round2(withdrawnRows[0]?.total || 0);
  const available = Math.max(round2(totalEarnings - withdrawn), 0);
  return { totalEarnings, withdrawn, available };
}

async function fetchTransactions(vendorId, limit) {
  const [credits, debits] = await Promise.all([
    Order.aggregate([
      ...deliveredItemsPipeline(vendorId),
      {
        $group: {
          _id: "$_id",
          date: { $first: "$updatedAt" },
          gross: { $sum: lineTotal },
        },
      },
      { $sort: { date: -1 } },
      { $limit: limit },
    ]),
    Withdrawal.find({ vendor: vendorId }).sort({ createdAt: -1 }).limit(limit).lean(),
  ]);

  const rows = [
    ...credits.map((c) => ({
      id: `ORD-${String(c._id).slice(-6).toUpperCase()}`,
      date: c.date,
      amount: toNet(c.gross),
      status: "Completed",
      type: "credit",
    })),
    ...debits.map((w) => ({
      id: `WDR-${String(w._id).slice(-6).toUpperCase()}`,
      date: w.createdAt,
      amount: w.amount,
      status: w.status,
      type: "debit",
    })),
  ];

  rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  return rows.slice(0, limit);
}

/* ----------------------------- controllers ----------------------------- */

// GET /api/vendor/earnings/summary
exports.getSummary = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    const [balance, monthly] = await Promise.all([
      getBalance(vendorId),
      getMonthlyNet(vendorId, 2),
    ]);

    const prev = monthly[0].earnings;
    const curr = monthly[1].earnings;
    const monthlyGrowthPct = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : null;

    res.json({
      totalRevenue: balance.totalEarnings,
      availableBalance: balance.available,
      monthlyGrowthPct,
      withdrawals: balance.withdrawn,
      thisMonthEarnings: curr,
      commissionPct: COMMISSION_PCT,
      minWithdrawal: MIN_WITHDRAWAL,
    });
  } catch (err) {
    console.error("getSummary error:", err);
    res.status(500).json({ message: "Earnings summary load nahi ho payi" });
  }
};

// GET /api/vendor/earnings/chart?range=6
exports.getChart = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    const months = Math.min(Math.max(parseInt(req.query.range, 10) || 6, 1), 12);
    res.json(await getMonthlyNet(vendorId, months));
  } catch (err) {
    console.error("getChart error:", err);
    res.status(500).json({ message: "Chart data load nahi ho paya" });
  }
};

// GET /api/vendor/earnings/transactions?limit=6
exports.getTransactions = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    res.json(await fetchTransactions(vendorId, limit));
  } catch (err) {
    console.error("getTransactions error:", err);
    res.status(500).json({ message: "Transactions load nahi ho paye" });
  }
};

// POST /api/vendor/earnings/withdraw   body: { amount? }
exports.requestWithdrawal = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    const { available } = await getBalance(vendorId);

    const requested =
      req.body?.amount !== undefined && req.body?.amount !== null
        ? Number(req.body.amount)
        : available;

    if (!Number.isFinite(requested) || requested <= 0) {
      return res.status(400).json({ message: "Valid amount daalo" });
    }
    if (requested < MIN_WITHDRAWAL) {
      return res
        .status(400)
        .json({ message: `Minimum withdrawal ₹${MIN_WITHDRAWAL} hai` });
    }
    if (requested > available) {
      return res
        .status(400)
        .json({ message: `Available balance sirf ₹${available} hai` });
    }

    const withdrawal = await Withdrawal.create({
      vendor: vendorId,
      amount: round2(requested),
      status: "Pending",
    });

    res.status(201).json({
      message: "Withdrawal request submit ho gayi",
      withdrawal,
    });
  } catch (err) {
    console.error("requestWithdrawal error:", err);
    res.status(500).json({ message: "Withdrawal request fail ho gayi" });
  }
};

// GET /api/vendor/earnings/export  -> CSV download
exports.exportReport = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    const rows = await fetchTransactions(vendorId, 1000);

    const header = "Date,Reference,Type,Amount (INR),Status";
    const lines = rows.map((r) =>
      [
        new Date(r.date).toISOString().slice(0, 10),
        r.id,
        r.type === "credit" ? "Order earning" : "Withdrawal",
        r.type === "credit" ? r.amount : -r.amount,
        r.status,
      ].join(",")
    );

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="earnings-report.csv"');
    res.send([header, ...lines].join("\n"));
  } catch (err) {
    console.error("exportReport error:", err);
    res.status(500).json({ message: "Report export nahi ho paya" });
  }
};