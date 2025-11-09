import mongoose, { Schema } from "mongoose";
import Review from "./review.js";
import User from "./user.js";
const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  image: {
    filename: String,
    url: {
      type: String,
      default:
        "https://www.thegrandindianroute.com/wp-content/uploads/2024/02/Untitled-design-2024-07-17T005119.143.jpg",
      set: (v) =>
        v === ""
          ? "https://www.thegrandindianroute.com/wp-content/uploads/2024/02/Untitled-design-2024-07-17T005119.143.jpg"
          : v,
    },
  },
  price: Number,
  location: String,
  country: String,
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      default: [0, 0],
    },
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: User,
  },
});

// Create geospatial index
listingSchema.index({ geometry: "2dsphere" });

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
export default Listing;
