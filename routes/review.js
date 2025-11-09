import express from "express";
const router = express.Router({ mergeParams: true });
import wrapAsync from "../utils/wrapAsync.js";

import { isloggedIn, isReviewAuthor, validateReview } from "../middleware.js";
import { createReview, destroyReview } from "../controllers/review.js";

// review route
//POST

router.post("/", validateReview, isloggedIn, wrapAsync(createReview));

// delete review route

router.delete(
  "/:reviewId",
  isloggedIn,
  isReviewAuthor,
  wrapAsync(destroyReview)
);

export default router;
