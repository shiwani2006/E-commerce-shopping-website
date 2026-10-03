const Wishlist = require("../models/Wishlist.model");

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    const exists = await Wishlist.findOne({
      user: req.user.id,
      product: productId,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    const wishlist = await Wishlist.create({
      user: req.user.id,
      product: productId,
    });

    res.status(201).json({
      success: true,
      wishlist,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({
      user: req.user.id,
    }).populate("product");

    res.json({
      success: true,
      wishlist,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.removeWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({
      user: req.user.id,
      product: req.params.productId,
    });

    res.json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};