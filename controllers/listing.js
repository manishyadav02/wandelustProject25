import Listing from "../models/listing.js";
import { cloudinary } from "../utils/cloudinaryStorage.js";
import axios from "axios";
export const index = async (req, res) => {
  const allListing = await Listing.find({});
  res.render("./listings/index.ejs", { allListing });
};

export const newListing = (req, res) => {
  res.render("./listings/new.ejs");
};

export const showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listing");
  }
  res.render("./listings/show.ejs", { listing, id });
};

export const createListing = async (req, res) => {
  const newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id;

  if (req.file) {
    newlisting.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }
  // 🌍 Geocode location using OpenStreetMap (Nominatim)
  const location = req.body.listing.location;
  if (location) {
    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: location,
            format: "json",
            limit: 1,
          },
        }
      );

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        newlisting.geometry = {
          type: "Point",
          coordinates: [parseFloat(lon), parseFloat(lat)],
        };
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    }
  }
  await newlisting.save();
  req.flash("success", "New listing created!");
  res.redirect(`/listing/${newlisting._id}`);
};


export const editListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listing");
  }
  res.render("./listings/edit.ejs", { listing, id });
};

export const updateListing = async (req, res) => {
  const { id } = req.params;

  // ✅ 1️⃣ Update basic fields first
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  // ✅ 2️⃣ Handle new image upload (if any)
  if (req.file) {
    // Delete old image from Cloudinary (optional)
    if (listing.image && listing.image.filename) {
      await cloudinary.uploader.destroy(listing.image.filename);
    }

    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  // ✅ 3️⃣ Re-geocode if location is updated
  const location = req.body.listing.location;
  if (location && location.trim() !== "") {
    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: location,
            format: "json",
            limit: 1,
          },
        }
      );

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        listing.geometry = {
          type: "Point",
          coordinates: [parseFloat(lon), parseFloat(lat)],
        };
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    }
  }

  // ✅ 4️⃣ Save updates
  await listing.save();

  req.flash("success", "Listing edited successfully!");
  res.redirect(`/listing/${listing._id}`);
};



export const destroyListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  await Listing.findByIdAndDelete(id);

  // ✅ Delete image from Cloudinary (if exists)
  if (listing && listing.image && listing.image.filename) {
    try {
      await cloudinary.uploader.destroy(listing.image.filename);
    } catch (err) {
      console.error("Error deleting image from Cloudinary:", err);
    }
  }
  req.flash("success", "Listing deleted!");
  res.redirect("/listing");
};
