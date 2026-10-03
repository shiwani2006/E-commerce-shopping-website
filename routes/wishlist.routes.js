const express = require("express");
const router = express.Router();

const {
  addToWishlist,
  getWishlist,
  removeWishlist,
} = require("../controllers/wishlist.controller");

const { protect } = require("../middlewares/auth.middleware"); 

// GET /api/wishlist  -> get logged-in user ka wishlist
router.get("/", protect, getWishlist);

// POST /api/wishlist  -> product add karo
router.post("/", protect, addToWishlist);

// DELETE /api/wishlist/:productId  -> product remove karo
router.delete("/:productId", protect, removeWishlist);

module.exports = router;