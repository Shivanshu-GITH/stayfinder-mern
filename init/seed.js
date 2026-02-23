const mongoose = require("mongoose");
const Listing = require("../models/listing");
const User = require("../models/User");
const { data } = require("./data");

const MONGO_URL = "mongodb://127.0.0.1:27017/stayfinder";

async function seedDB() {
  await mongoose.connect(MONGO_URL);
  console.log("DB Connected");

  // -------------------------------
  // 1️⃣ CREATE / FIND ADMIN USER
  // -------------------------------
  let adminUser = await User.findOne({ username: "admin" });

  if (!adminUser) {
    adminUser = new User({
      username: "admin",
      email: "admin@stayfinder.com",
    });

    adminUser = await User.register(adminUser, "admin123");
    console.log("Admin user created");
  } else {
    console.log("Admin user already exists");
  }

  // -------------------------------
  // 2️⃣ DELETE OLD LISTINGS
  // -------------------------------
  await Listing.deleteMany({});
  console.log("Old listings deleted");

  // -------------------------------
  // 3️⃣ ASSIGN OWNER TO EACH LISTING
  // -------------------------------
  const listingsWithOwner = data.map(listing => ({
    ...listing,
    owner: adminUser._id,
  }));

  // -------------------------------
  // 4️⃣ INSERT NEW LISTINGS
  // -------------------------------
  await Listing.insertMany(listingsWithOwner);
  console.log("Listings inserted with admin as owner");

  mongoose.connection.close();
}

seedDB()
  .then(() => console.log("Seeding complete"))
  .catch(err => console.log(err));