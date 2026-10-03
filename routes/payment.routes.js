const express = require("express");
const router = express.Router();

const {
  createOrder,
  verifyPayment,
  getOverview,
  getCards,
  addCard,
  deleteCard,
  getTransactions,
  addMoney,
  updateUpi,
} = require("../controllers/payment.controller");

const { protect } = require("../middlewares/auth.middleware");

// Razorpay (existing)
router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);

// Overview
router.get("/overview", protect, getOverview);

// Cards
router.get("/cards", protect, getCards);
router.post("/cards", protect, addCard);
router.delete("/cards/:id", protect, deleteCard);

// Transactions
router.get("/transactions", protect, getTransactions);

// Wallet
router.post("/wallet/add-money", protect, addMoney);

// UPI
router.post("/upi", protect, updateUpi);

module.exports = router;