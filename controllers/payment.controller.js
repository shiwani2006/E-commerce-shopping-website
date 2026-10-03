const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User.model");
const Card = require("../models/Card.model");
const Transaction = require("../models/Transaction.model");

// Lazy-initialized Razorpay instance — created only when first needed,
// so a missing/invalid key won't crash the whole server on startup.
let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error(
        "Razorpay keys missing. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file."
      );
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

// ---------------- Razorpay (existing) ----------------

// Function 1: Order create karna
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
};

// Function 2: Payment verify karna
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      res.status(200).json({ success: true, message: "Payment verified" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
};

// ---------------- Overview ----------------

exports.getOverview = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const cardsCount = await Card.countDocuments({ user: req.user.id });

    // simple security score: base 70, +30 if 2FA enabled
    const security = user.twoFactorEnabled ? 100 : 70;

    res.status(200).json({
      walletBalance: user.walletBalance,
      upiId: user.upiId,
      cardsCount,
      security,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch overview", error: error.message });
  }
};

// ---------------- Cards ----------------

exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cards", error: error.message });
  }
};

exports.addCard = async (req, res) => {
  try {
    const { cardName, cardNumber, expiry } = req.body;

    if (!cardName || !cardNumber || !expiry) {
      return res.status(400).json({ message: "cardName, cardNumber and expiry are required" });
    }

    const last4 = cardNumber.replace(/\s/g, "").slice(-4);

    const card = await Card.create({
      user: req.user.id,
      cardName,
      last4,
      expiry,
      type: "New",
    });

    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: "Failed to add card", error: error.message });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!card) return res.status(404).json({ message: "Card not found" });

    res.status(200).json({ message: "Card deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete card", error: error.message });
  }
};

// ---------------- Transactions ----------------

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(20);

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
  }
};

// ---------------- Wallet: Add Money ----------------
// NOTE: This is a simple direct credit (no live payment gateway UI yet).
// The existing createOrder/verifyPayment functions above are ready to be
// wired into a real Razorpay checkout flow later if needed.

exports.addMoney = async (req, res) => {
  try {
    const { amount } = req.body;
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: "Enter a valid amount" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.walletBalance += numericAmount;
    await user.save();

    await Transaction.create({
      user: req.user.id,
      name: "Wallet Top-up",
      mode: "Wallet",
      amount: numericAmount,
      type: "credit",
    });

    res.status(200).json({ walletBalance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ message: "Failed to add money", error: error.message });
  }
};

// ---------------- UPI ----------------

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

    res.status(200).json({ upiId: user.upiId });
  } catch (error) {
    res.status(500).json({ message: "Failed to link UPI", error: error.message });
  }
};