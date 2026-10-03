const Product = require("../models/Product.model");
const Category = require("../models/Category.model");

/* =========================
   🆕 CATEGORY VALIDATION
   Categories are owned by admin. Vendors/admin must pick an ACTIVE
   category (and a valid sub-category if the category defines any).
   Returns an error message string, or null if valid.
========================= */
const validateCategory = async (category, subCategory) => {
  const cat = await Category.findOne({ name: category, isActive: true });
  if (!cat) return "Please choose a valid category";

  if (subCategory && cat.subCategories.length > 0 && !cat.subCategories.includes(subCategory)) {
    return "Please choose a valid sub-category";
  }
  return null;
};

const calcDiscount = (mrp, sellingPrice) => {
  const m = Number(mrp);
  const s = Number(sellingPrice);
  if (!m || m <= 0 || Number.isNaN(s)) return 0;
  return Math.max(0, Math.round(((m - s) / m) * 100));
};

/* =========================
   CREATE PRODUCT
   - Vendor: always created as "Pending" (needs admin approval)
   - Admin: can create directly as "Active"
========================= */
exports.createProduct = async (req, res) => {
  try {
    const {
      name, brand, category, subCategory, description, highlights,
      sku, barcode, mrp, sellingPrice, stock, lowStockAlert,
      colors, sizes, weight, length, width, height,
      metaTitle, metaDesc, tags, isFeatured, isCOD, isReturnable,
      returnDays, status,
    } = req.body;

    if (!name || !category || !sellingPrice || !stock) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const vendorId = req.user?.id;
    const role = req.user?.role;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // 🆕 category must exist and be active
    const categoryError = await validateCategory(category, subCategory);
    if (categoryError) {
      return res.status(400).json({ success: false, message: categoryError });
    }

    const imagePaths =
      req.files?.map((file) => `/uploads/products/${file.filename}`) || [];

    const discount = calcDiscount(mrp, sellingPrice);

    // 🔒 Vendor can never self-approve. Only admin-created products
    // can go straight to Active.
    const finalStatus = role === "admin" ? status || "Active" : "Pending";

    const product = await Product.create({
      vendor: vendorId,
      name, brand, category, subCategory, description, highlights,
      sku, barcode, mrp, sellingPrice, stock, lowStockAlert,
      colors: colors ? JSON.parse(colors) : [],
      sizes: sizes ? JSON.parse(sizes) : [],
      tags: tags ? JSON.parse(tags) : [],
      weight, length, width, height, metaTitle, metaDesc,
      isFeatured, isCOD, isReturnable, returnDays,
      status: finalStatus,
      discount,
      images: imagePaths,
    });

    res.status(201).json({
      success: true,
      message:
        role === "admin"
          ? "Product created successfully"
          : "Product submitted for admin approval",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create product" });
  }
};

/* =========================
   GET ALL PRODUCTS
   (public — customer side)
   Only approved + active products are shown.
   🆕 Products in a deactivated category are hidden from customers.
   🆕 Supports ?category=, ?subCategory= and ?search=
========================= */
exports.getProducts = async (req, res) => {
  try {
    const { category, subCategory, search } = req.query;

    const filter = { status: "Active" };

    // 🆕 hide products whose category admin has deactivated
    const inactive = await Category.find({ isActive: false }).select("name");
    if (inactive.length > 0) {
      filter.category = { $nin: inactive.map((c) => c.name) };
    }

    if (category) {
      filter.category = inactive.some((c) => c.name === category)
        ? { $in: [] } // requested category is deactivated → no results
        : category;
    }
    if (subCategory) filter.subCategory = subCategory;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};

/* =========================
   GET MY PRODUCTS
   (vendor-only — sees ALL own products, any status)
========================= */
exports.getMyProducts = async (req, res) => {
  try {
    const vendorId = req.user?.id;

    const products = await Product.find({ vendor: vendorId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch vendor products" });
  }
};

/* =========================
   GET SINGLE PRODUCT
   Public if Active. Owner vendor or admin can view any status.
========================= */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const isOwner = req.user && req.user.id === product.vendor.toString();
    const isAdmin = req.user && req.user.role === "admin";

    if (product.status !== "Active" && !isOwner && !isAdmin) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
};

/* =========================
   UPDATE PRODUCT
   Vendor can only update own product; can't change status/vendor.
   Admin can update anything, including status.
========================= */
exports.updateProduct = async (req, res) => {
  try {
    const existingProduct = await Product.findById(req.params.id);

    if (!existingProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const isOwner = req.user.id === existingProduct.vendor.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to edit this product",
      });
    }

    // 🆕 Validate only when the category/sub-category is actually being CHANGED,
    // so editing an old product whose category was later deactivated still works.
    const categoryChanged =
      req.body.category !== undefined && req.body.category !== existingProduct.category;
    const subCategoryChanged =
      req.body.subCategory !== undefined && req.body.subCategory !== existingProduct.subCategory;

    if (categoryChanged || subCategoryChanged) {
      const categoryError = await validateCategory(
        req.body.category !== undefined ? req.body.category : existingProduct.category,
        req.body.subCategory !== undefined ? req.body.subCategory : existingProduct.subCategory
      );
      if (categoryError) {
        return res.status(400).json({ success: false, message: categoryError });
      }
    }

    let imagePaths = existingProduct.images;
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => `/uploads/products/${file.filename}`);
    }

    const mrp = req.body.mrp || existingProduct.mrp;
    const sellingPrice = req.body.sellingPrice || existingProduct.sellingPrice;
    const discount = calcDiscount(mrp, sellingPrice);

    // Build the update payload
    const updatePayload = {
      ...req.body,
      images: imagePaths,
      discount,
      colors: req.body.colors ? JSON.parse(req.body.colors) : existingProduct.colors,
      sizes: req.body.sizes ? JSON.parse(req.body.sizes) : existingProduct.sizes,
      tags: req.body.tags ? JSON.parse(req.body.tags) : existingProduct.tags,
    };

    // 🔒 Vendors editing their own product can't self-approve/change status.
    if (!isAdmin) {
      delete updatePayload.status;
      delete updatePayload.vendor;
      updatePayload.status =
        existingProduct.status === "Rejected" ? "Pending" : existingProduct.status;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
};

/* =========================
   DELETE PRODUCT
   Vendor can only delete own product. Admin can delete any.
========================= */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const isOwner = req.user.id === product.vendor.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this product",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
};