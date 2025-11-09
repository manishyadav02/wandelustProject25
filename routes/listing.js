import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import * as listingController from "../controllers/listing.js";
import { isloggedIn, isOwner, validatelisting } from "../middleware.js";
import upload from "../utils/cloudinaryStorage.js"; // ✅ uses your Cloudinary setup

const router = express.Router();

// new
router.get("/new", isloggedIn, listingController.newListing);

router
  .route("/")
  .get(wrapAsync(listingController.index)) // index page

  // ✅ create listing with Cloudinary image upload
  .post(
    isloggedIn,
    upload.single("listing[image]"), // form input name: listing[image]
    validatelisting,
    wrapAsync(listingController.createListing)
  );

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isloggedIn,
    isOwner,
    upload.single("listing[image]"), // ✅ allow image update
    validatelisting,
    wrapAsync(listingController.updateListing)
  )
  .delete(isloggedIn, isOwner, wrapAsync(listingController.destroyListing));

// edit
router.get(
  "/:id/edit",
  isloggedIn,
  isOwner,
  wrapAsync(listingController.editListing)
);

export default router;


