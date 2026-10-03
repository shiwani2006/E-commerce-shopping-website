const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const c = require("../controllers/category.controller");

router.get("/", c.getCategories); // public: customer + vendor dropdowns

router.get("/admin/all", protect, authorize("admin"), c.adminGetCategories);
router.post("/", protect, authorize("admin"), c.createCategory);
router.put("/:id", protect, authorize("admin"), c.updateCategory);
router.delete("/:id", protect, authorize("admin"), c.deleteCategory);

module.exports = router;