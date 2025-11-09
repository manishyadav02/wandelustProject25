import Listing from "./models/listing.js";
import ExpressError from "./utils/expressError.js";
import { listingSchema, reviewSchema } from "./schema.js";
import Review from "./models/review.js";
const isloggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged in!!");
    return res.redirect("/user/login");
  }
  next();
};
const saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};
//listings
const isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currentUser._id)) {
    req.flash("error", "Unauthorized, you aren't the owner");
    return res.redirect(`/listing/${id}`);
  }
  next();
};
//reviews
const isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author._id.equals(res.locals.currentUser._id)) {
    req.flash("error", "Unauthorized, you aren't the owner");
    return res.redirect(`/listing/${id}`);
  }
  next();
};

//schema validate middleware
const validatelisting = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  // console.log(req.body);

  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

// reviews schema validate middleware
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  // console.log(req.body);

  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

// export default isloggedIn ;
export { isloggedIn, saveRedirectUrl, isOwner, isReviewAuthor, validatelisting, validateReview };
