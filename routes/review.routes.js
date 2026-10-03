const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const c = require("../controllers/review.controller");

router.post("/", protect, authorize("customer"), c.createReview);

router.get("/my-reviews", protect, authorize("vendor"), c.getMyReviews);
router.put("/:id/reply", protect, authorize("vendor"), c.replyToReview);

router.get("/admin/all", protect, authorize("admin"), c.adminGetAllReviews);
router.put("/admin/:id/status", protect, authorize("admin"), c.adminSetReviewStatus);
router.get("/my-analytics", protect, authorize("vendor"), c.vendorReviewAnalytics);
router.get("/admin/analytics", protect, authorize("admin"), c.adminReviewAnalytics);

router.get("/:productId", c.getProductReviews); 

module.exports = router;