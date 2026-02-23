const mongoose = require("mongoose");
const Listing = require("../models/listing");
const { data } = require("./data");

const MONGO_URL = "mongodb://127.0.0.1:27017/stayfinder";

async function seedDB() {
  await mongoose.connect(MONGO_URL);
  console.log("DB Connected");

  await Listing.deleteMany({});
  console.log("Old listings deleted");

  await Listing.insertMany(data);
  console.log("Listings inserted");

  mongoose.connection.close();
}

seedDB()
  .then(() => console.log("Seeding complete"))
  .catch(err => console.log(err));