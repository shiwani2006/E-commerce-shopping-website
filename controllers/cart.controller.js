const Cart = require("../models/Cart.model");

// @desc    Add item to cart (or increase quantity if already exists)
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const qty = quantity && quantity > 0 ? quantity : 1;
    const userId = req.user.id || req.user._id;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity: qty }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += qty;
      } else {
        cart.items.push({ product: productId, quantity: qty });
      }
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );

    res.status(200).json({
      message: "Item added to cart",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get logged-in user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    let cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      // user ka cart abhi tak bana hi nahi — empty cart return karo
      return res.status(200).json({
        message: "Cart is empty",
        cart: { user: userId, items: [] },
      });
    }

    res.status(200).json({
      message: "Cart fetched successfully",
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// @desc    Update quantity of an item in cart
// @route   PUT /api/cart/update
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id || req.user._id;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({
        message: "Product ID and valid quantity are required",
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );

    res.status(200).json({
      message: "Cart updated",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Remove an item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id || req.user._id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );

    res.status(200).json({
      message: "Item removed from cart",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Remove cart item error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { addToCart, getCart, updateCartItem, removeCartItem };