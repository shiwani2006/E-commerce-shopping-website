const Commission = require("../models/Commission.model");
const Order = require("../models/Order.model");

const getSettingsDoc = async () =>
  (await Commission.findOne({ key: "default" })) || (await Commission.create({ key: "default" }));

// Reusable: rate (%) for a category. Use this when an order is delivered.
const getRateForCategory = async (category) => {
  const s = await getSettingsDoc();
  const match = s.categoryRates.find((r) => r.category === category);
  return match ? match.rate : s.defaultRate;
};

// GET /api/commission  (admin)
const getCommissionSettings = async (req, res) => {
  try {
    const s = await getSettingsDoc();
    res.json({ success: true, settings: { defaultRate: s.defaultRate, categoryRates: s.categoryRates } });
  } catch (error) {
    console.error("getCommissionSettings error:", error);
    res.status(500).json({ success: false, message: "Failed to load commission settings" });
  }
};

// PUT /api/commission  (admin)  body: { defaultRate, categoryRates: [{category, rate}] }
const updateCommissionSettings = async (req, res) => {
  try {
    const { defaultRate, categoryRates = [] } = req.body;
    const valid = (n) => typeof n === "number" && n >= 0 && n <= 100;

    if (!valid(defaultRate)) {
      return res.status(400).json({ success: false, message: "Default rate must be between 0 and 100" });
    }
    if (!categoryRates.every((r) => r.category && valid(r.rate))) {
      return res.status(400).json({ success: false, message: "Each category rate must be between 0 and 100" });
    }

    const s = await getSettingsDoc();
    s.defaultRate = defaultRate;
    s.categoryRates = categoryRates;
    await s.save();
    res.json({ success: true, settings: { defaultRate: s.defaultRate, categoryRates: s.categoryRates } });
  } catch (error) {
    console.error("updateCommissionSettings error:", error);
    res.status(500).json({ success: false, message: "Failed to save commission settings" });
  }
};

// GET /api/commission/summary  (admin)
// Estimated from DELIVERED orders at the CURRENT rates (works for old orders too)
const getCommissionSummary = async (req, res) => {
  try {
    const s = await getSettingsDoc();

    const rows = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },
      { $unwind: "$items" },
      { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "p" } },
      {
        $group: {
          _id: { $ifNull: [{ $arrayElemAt: ["$p.category", 0] }, "Uncategorized"] },
          sales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
    ]);

    let totalSales = 0;
    let totalCommission = 0;
    const byCategory = rows.map((r) => {
      const rate = s.categoryRates.find((x) => x.category === r._id)?.rate ?? s.defaultRate;
      const commission = Math.round(r.sales * rate) / 100;
      totalSales += r.sales;
      totalCommission += commission;
      return { category: r._id, sales: r.sales, rate, commission };
    });

    res.json({
      success: true,
      summary: {
        totalSales,
        totalCommission: Math.round(totalCommission),
        vendorPayout: Math.round(totalSales - totalCommission),
        byCategory,
      },
    });
  } catch (error) {
    console.error("getCommissionSummary error:", error);
    res.status(500).json({ success: false, message: "Failed to load commission summary" });
  }
};

module.exports = { getCommissionSettings, updateCommissionSettings, getCommissionSummary, getRateForCategory };