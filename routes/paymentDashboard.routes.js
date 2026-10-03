const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");

const {
  getOverview,
  getCards,
  addCard,
  deleteCard,
  getTransactions,
  addMoney,
  updateUpi,
} = require("../controllers/paymentDashboard.controller");

router.get("/overview", protect, getOverview);
router.get("/cards", protect, getCards);
router.post("/cards", protect, addCard);
router.delete("/cards/:id", protect, deleteCard);
router.get("/transactions", protect, getTransactions);
router.post("/wallet/add-money", protect, addMoney);
router.post("/upi", protect, updateUpi);

module.exports = router;