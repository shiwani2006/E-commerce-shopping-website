const Category = require("../models/Category.model");
const Product = require("../models/Product.model");

// PUBLIC (customer + vendor): active categories, with count of live products
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    const counts = await Product.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const withCounts = categories.map((c) => ({
      ...c,
      productCount: counts.find((x) => x._id === c.name)?.count || 0,
    }));
    res.json({ success: true, categories: withCounts });
  } catch (error) {
    console.error("getCategories error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

// ADMIN: all categories including inactive
const adminGetCategories = async (req, res) => {
  try {
    // 🆕 import categories already used by existing products
    const used = (await Product.distinct("category")).filter(Boolean);
    const existing = await Category.find({ name: { $in: used } }).select("name");
    const known = new Set(existing.map((c) => c.name));
    const missing = used.filter((n) => !known.has(n));
    if (missing.length > 0) {
      await Category.insertMany(missing.map((name) => ({ name })), { ordered: false });
    }

    const categories = await Category.find().sort({ name: 1 }).lean();
    const counts = await Product.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
    res.json({
      success: true,
      categories: categories.map((c) => ({
        ...c,
        productCount: counts.find((x) => x._id === c.name)?.count || 0,
      })),
    });
  } catch (error) {
    console.error("adminGetCategories error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, image, subCategories } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }
    const category = await Category.create({ name, description, image, subCategories });
    res.status(201).json({ success: true, category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }
    console.error("createCategory error:", error);
    res.status(500).json({ success: false, message: "Failed to create category" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    const oldName = category.name;
    const { name, description, image, subCategories, isActive } = req.body;

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (subCategories !== undefined) category.subCategories = subCategories;
    if (isActive !== undefined) category.isActive = isActive;
    await category.save();

    // keep existing products in sync when the name changes
    if (name !== undefined && name.trim() !== oldName) {
      await Product.updateMany({ category: oldName }, { category: category.name });
    }
    res.json({ success: true, category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Category name already exists" });
    }
    console.error("updateCategory error:", error);
    res.status(500).json({ success: false, message: "Failed to update category" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    const inUse = await Product.countDocuments({ category: category.name });
    if (inUse > 0) {
      return res.status(400).json({
        success: false,
        message: `${inUse} product(s) use this category. Deactivate it instead of deleting.`,
      });
    }
    await category.deleteOne();
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("deleteCategory error:", error);
    res.status(500).json({ success: false, message: "Failed to delete category" });
  }
};

module.exports = { getCategories, adminGetCategories, createCategory, updateCategory, deleteCategory };