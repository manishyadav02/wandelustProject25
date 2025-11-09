import mongoose, { set,Schema } from "mongoose";
import User from "./user.js";
const reviewSchema = new mongoose.Schema({
  comment: String,
  rating: {
    type: Number,
    max: 5,
    min: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: User,
  },
});
const Review = mongoose.model("Review", reviewSchema);
export default Review;
