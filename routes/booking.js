import express from "express";
import Booking from "../models/booking.js"; // Assuming default export in model
import Listing from "../models/listing.js"; // Assuming default export in model
import { isloggedIn, isOwner, validatelisting } from "../middleware.js"; // Assuming named export for middleware

const router = express.Router({ mergeParams: true });

// ---------------------------------------------------------
// 1. CREATE BOOKING: POST /listings/:id/bookings
// ---------------------------------------------------------
router.post("/listing/:id/bookings", isloggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    // Extract data from the hidden inputs
    const { booking } = req.body;

    // Check if the user is trying to book their own listing (Optional safeguard)
    if (listing.owner && listing.owner.equals(req.user._id)) {
      req.flash("error", "You cannot book your own listing!");
      return res.redirect(`/listing/${id}`);
    }

    // Check if user already reserved this listing
    const existingBooking = await Booking.findOne({
      user: req.user._id,
      listing: id,
    });

    if (existingBooking) {
      req.flash("error", "You have already reserved this listing!");
      return res.redirect(`/listing/${id}`);
    }

    // Create the new booking
    const newBooking = new Booking(booking);
    newBooking.listing = listing._id;
    newBooking.user = req.user._id;

    await newBooking.save();

    req.flash("success", "Listing Reserved! See you there.");
    res.redirect("/bookings");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong creating your booking.");
    res.redirect(`/listing/${req.params.id}`);
  }
});

// ---------------------------------------------------------
// 2. MY BOOKINGS: GET /bookings
// ---------------------------------------------------------
router.get("/bookings", isloggedIn, async (req, res) => {
  try {
    // Find all bookings for the current user and populate listing details
    const bookings = await Booking.find({ user: req.user._id }).populate(
      "listing"
    );

    res.render("bookings/index.ejs", { bookings });
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not retrieve bookings.");
    res.redirect("/listing");
  }
});

// ---------------------------------------------------------
// 3. CANCEL BOOKING: DELETE /bookings/:id
// ---------------------------------------------------------
router.delete("/bookings/:id", isloggedIn, async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the booking ensuring it belongs to the logged-in user
    const deletedBooking = await Booking.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!deletedBooking) {
      req.flash("error", "Booking not found or permission denied.");
      return res.redirect("/bookings");
    }

    req.flash("success", "Reservation cancelled.");
    res.redirect("/bookings");
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not cancel booking.");
    res.redirect("/bookings");
  }
});

export default router;
