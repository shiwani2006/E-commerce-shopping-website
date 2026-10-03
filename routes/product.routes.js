const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

const upload = require("../middlewares/upload.middleware");
const { protect } = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

/* Create Product — vendor or admin only */
router.post(
  "/",
  protect,
  authorize("vendor", "admin"),
  upload.array("images", 6),
  createProduct
);

/* Vendor's own products — must come BEFORE "/:id" */
router.get("/my-products", protect, authorize("vendor"), getMyProducts);

/* Public — customer side (only Active products) */
router.get("/", getProducts);

/* Single product */
router.get("/:id", getProductById);

/* Update — vendor (own) or admin */
router.put(
  "/:id",
  protect,
  authorize("vendor", "admin"),
  upload.array("images", 6),
  updateProduct
);

/* Delete — vendor (own) or admin */
router.delete("/:id", protect, authorize("vendor", "admin"), deleteProduct);

module.exports = router;