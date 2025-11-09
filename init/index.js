import Data from "./data.js";
import mongoose from "mongoose";
import Listing from "../models/listing.js";

main()
  .then(() => {
    console.log(`connection successful..`);
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust");
}

const initDB = async () => {
  await Listing.deleteMany({});
  const modifiedData = Data.map((obj) => ({
    ...obj,
    owner: "690ad7d09ab616575f4a5206",
  }));
  await Listing.insertMany(modifiedData);
  console.log(`data was initialized successfully`);
};
initDB();
