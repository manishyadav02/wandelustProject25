import Listing from "../models/listing.js";
import Review from "../models/review.js";

export const createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id).populate("reviews");
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();
  // console.log(`review saved`);
  req.flash("success", "new review created!!");
  res.redirect(`/listing/${listing._id}`);
};

export const destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "review deleted!!");
  res.redirect(`/listing/${id}`);
};
