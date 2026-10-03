const Order = require("../models/Order.model");
const Cart = require("../models/Cart.model");
const Product = require("../models/Product.model");
const User = require("../models/User.model");

const REWARD_POINTS_PER_ORDER = 50;

// 🟢 Vendor sirf ye statuses set kar sakta hai (Placed wapas set nahi kar sakta)
const VENDOR_ALLOWED_STATUSES = ["Confirmed", "Shipped", "Delivered", "Cancelled"];

// @desc    Place a new order (from cart)
// @route   POST /api/orders/place
// @access  Private
const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const {
      shippingAddress,
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId,
    } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        message: "Shipping address and payment method are required",
      });
    }

    // 🟢 Agar Online payment hai, toh razorpay details hona zaroori hai
    if (paymentMethod === "Online" && (!razorpayOrderId || !razorpayPaymentId)) {
      return res.status(400).json({
        message: "Payment verification details are missing",
      });
    }

    // User ka cart fetch karo, product details ke saath
    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 🟢 STEP 1: Pehle check karo har item ka stock available hai
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({
          message: "One of the products in your cart no longer exists",
        });
      }

      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `Only ${item.product.stock} unit(s) of "${item.product.name}" left in stock. Please update your cart.`,
        });
      }
    }

    // Cart items ko Order items ke format mein convert karo (snapshot ke saath)
    // 🆕 vendor bhi snapshot karo taaki baad mein per-vendor stats nikaal sakein
    // NOTE: item.product.vendor yahan User._id hai (Product.model.js -> ref: "User")
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      vendor: item.product.vendor,
      name: item.product.name,
      price: item.product.sellingPrice,
      quantity: item.quantity,
      image: item.product.images?.[0] || "",
    }));

    const itemsTotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const deliveryFee = itemsTotal > 999 ? 0 : 99;
    const totalAmount = itemsTotal + deliveryFee;

    // 🟢 Payment method ke hisaab se paymentStatus set karo
    const orderData = {
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "Online" ? "Paid" : "Pending",
      itemsTotal,
      deliveryFee,
      totalAmount,
      orderStatus: "Placed",
    };

    // 🟢 Online payment hai toh razorpay details bhi add karo
    if (paymentMethod === "Online") {
      orderData.razorpayOrderId = razorpayOrderId;
      orderData.razorpayPaymentId = razorpayPaymentId;
    }

    const order = await Order.create(orderData);

    // 🟢 STEP 2: Order successfully bann gaya, ab stock kam karo har product ka
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // 🆕 STEP 3: Reward points add karo user ko
    await User.findByIdAndUpdate(userId, {
      $inc: { rewardPoints: REWARD_POINTS_PER_ORDER },
    });

    // Order place hone ke baad cart khali kar do
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order placed successfully",
      order,
      pointsEarned: REWARD_POINTS_PER_ORDER,
    });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const orders = await Order.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const order = await Order.findOne({ _id: req.params.id, user: userId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all orders that contain the logged-in vendor's products
//          (only the matching items are returned per order, not other vendors' items)
// @route   GET /api/orders/vendor/my-orders
// @access  Private (vendor) — protectVendor
const getVendorOrders = async (req, res) => {
  try {
    // 🔴 FIX (v2): req.vendor._id Vendor document ka apna _id hai.
    // Lekin Product.vendor aur Order.items.vendor dono User._id store
    // karte hain (ref: "User"), Vendor._id nahi.
    // Vendor schema mein "user" field hi wo User._id hai jo humein chahiye
    // (yehi field vendorLogin mein bhi use hota hai: Vendor.findOne({ user: user._id })).
    const vendorUserId = req.vendor.user;

    // 🐞 TEMP DEBUG — isko baad mein hata dena
    console.log("=== VENDOR ORDERS DEBUG ===");
    console.log("req.vendor (full doc):", req.vendor);
    console.log("vendorUserId being used for match:", vendorUserId);
    const allOrders = await Order.find({});
    console.log("Total orders in DB:", allOrders.length);
    allOrders.forEach((o) => {
      console.log(
        `Order ${o._id} items.vendor values:`,
        o.items.map((i) => i.vendor?.toString())
      );
    });
    console.log("===========================");

    // Sirf wahi orders jinme is vendor ka kam se kam ek item ho
    const orders = await Order.find({ "items.vendor": vendorUserId }).sort({
      createdAt: -1,
    });

    // Har order ko vendor ke perspective se shape karo:
    // sirf uske apne items aur unka sub-total nikalo
    const vendorOrders = orders.map((order) => {
      const myItems = order.items.filter(
        (item) => item.vendor && item.vendor.toString() === vendorUserId.toString()
      );

      const myItemsTotal = myItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return {
        _id: order._id,
        customerName: order.shippingAddress?.fullName || "Customer",
        customerPhone: order.shippingAddress?.phone || "",
        shippingAddress: order.shippingAddress,
        items: myItems,
        myItemsTotal,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      message: "Vendor orders fetched successfully",
      orders: vendorOrders,
    });
  } catch (error) {
    console.error("Get vendor orders error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Update order status (only if the order contains this vendor's items)
//          Restores stock for the vendor's own items when cancelling.
// @route   PUT /api/orders/vendor/:id/status
// @access  Private (vendor) — protectVendor
const updateOrderStatusByVendor = async (req, res) => {
  try {
    // 🔴 FIX (v2): same as getVendorOrders — items.vendor User._id store karta
    // hai, isliye req.vendor.user use karo, req.vendor._id nahi.
    const vendorUserId = req.vendor.user;
    const { id } = req.params;
    const { status } = req.body;

    if (!VENDOR_ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${VENDOR_ALLOWED_STATUSES.join(", ")}`,
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const myItems = order.items.filter(
      (item) => item.vendor && item.vendor.toString() === vendorUserId.toString()
    );

    if (myItems.length === 0) {
      return res.status(403).json({
        success: false,
        message: "This order does not contain any of your products",
      });
    }

    const wasAlreadyCancelled = order.orderStatus === "Cancelled";
    const isCancellingNow = status === "Cancelled";

    // 🟢 Stock restore karo — sirf is vendor ke apne items ka, aur sirf ek baar
    if (!wasAlreadyCancelled && isCancellingNow) {
      for (const item of myItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      orderStatus: order.orderStatus,
    });
  } catch (error) {
    console.error("Update vendor order status error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  getVendorOrders,
  updateOrderStatusByVendor,
};