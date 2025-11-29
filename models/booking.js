// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
import mongoose from "mongoose";
import { Schema } from "mongoose";

const bookingSchema = new Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing", // Connects to your existing Listing model
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User", // Connects to the user who booked
    required: true,
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  guests: {
    type: Number,
    required: true,
    min: 1,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking ;