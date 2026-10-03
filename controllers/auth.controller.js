const User = require("../models/User.model");
const Vendor = require("../models/Vendor.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// REGISTER
const register = async (req, res) => {
  try {
    console.log("🔥 REGISTER API HIT");
    console.log(req.body);

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Only customer or vendor allowed
    const allowedRole = role === "vendor" ? "vendor" : "customer";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: allowedRole,
    });

    // 🆕 Agar vendor hai, toh Vendor profile turant create karo
    // (login isi pe depend karta hai — Vendor.findOne({ user: user._id }))
    let vendorDoc = null;
    if (allowedRole === "vendor") {
      vendorDoc = await Vendor.create({ user: user._id });
    }

    // 🆕 Token payload me vendorId bhi daalo agar vendor hai,
    // taaki register ke turant baad bhi protectVendor kaam kare
    const tokenPayload = { id: user._id, role: user.role };
    if (vendorDoc) {
      tokenPayload.vendorId = vendorDoc._id;
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: generateToken(tokenPayload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    console.log("🔥 LOGIN API HIT");
    console.log(req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Base payload
    const tokenPayload = {
      id: user._id,
      role: user.role,
    };

    // 🆕 If this user is a vendor, attach vendorId so protectVendor
    // middleware (Vendor.findById(decoded.vendorId)) works correctly.
    if (user.role === "vendor") {
      const vendor = await Vendor.findOne({ user: user._id });

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: "Vendor profile not found for this account",
        });
      }

      tokenPayload.vendorId = vendor._id;
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(tokenPayload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
};