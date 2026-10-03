const User = require("../models/User.model");
const Card = require("../models/Card.model");
const Order = require("../models/Order.model");

// GET /api/payments/overview
exports.getOverview = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const cardsCount = await Card.countDocuments({ user: req.user.id });

    res.json({
      walletBalance: user.walletBalance || 0,
      upiId: user.upiId || "",
      cardsCount,
      security: 100,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load payment overview", error: err.message });
  }
};

// GET /api/payments/cards
exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cards", error: err.message });
  }
};

// POST /api/payments/cards
exports.addCard = async (req, res) => {
  try {
    const { cardName, cardNumber, expiry, type } = req.body;

    if (!cardName || !cardNumber || !expiry) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const last4 = cardNumber.slice(-4);

    const card = await Card.create({
      user: req.user.id,
      cardName,
      last4,
      expiry,
      type: type || "New",
    });

    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ message: "Failed to add card", error: err.message });
  }
};

// DELETE /api/payments/cards/:id
exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!card) return res.status(404).json({ message: "Card not found" });

    res.json({ message: "Card deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete card", error: err.message });
  }
};

// GET /api/payments/transactions
// ⚠️ Order model ke actual field names ke hisaab se yahan adjust karna
exports.getTransactions = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    const transactions = orders.map((order) => ({
      id: order._id,
      name: order.items?.[0]?.name || "Order",
      amount: order.totalAmount || 0,
      mode: order.paymentMethod === "COD" ? "Cash on Delivery" : "Paid Online",
      date: order.createdAt,
    }));

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch transactions", error: err.message });
  }
};

// POST /api/payments/wallet/add-money
exports.addMoney = async (req, res) => {
  try {
    const { amount } = req.body;
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: "Enter a valid amount" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.walletBalance = (user.walletBalance || 0) + numericAmount;
    await user.save();

    res.json({ walletBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ message: "Failed to add money", error: err.message });
  }
};

// POST /api/payments/upi
exports.updateUpi = async (req, res) => {
  try {
    const { upiId } = req.body;
    const upiPattern = /^[\w.-]{2,256}@[a-zA-Z]{2,64}$/;

    if (!upiId || !upiPattern.test(upiId)) {
      return res.status(400).json({ message: "Enter a valid UPI ID" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { upiId },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ upiId: user.upiId });
  } catch (err) {
    res.status(500).json({ message: "Failed to link UPI", error: err.message });
  }
};