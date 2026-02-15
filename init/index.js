const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
    minlength: 5,
    trim: true
  },
  description: {
    type: String,
    required: true,
    minlength: 20,
    trim: true
  },
  image: {
    filename: {
      type: String,
      default: "listingimage"
    },
    url: {
      type: String,
      default: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
    }
  },
  price: {
    type: Number,
    required: true,
    min: 1
  },
  location: {
    type: String,
    required: true,
    match: /^[A-Za-z ,]+$/,
    trim: true
  },
  country: {
    type: String,
    required: true,
    match: /^[A-Za-z ]+$/,
    trim: true
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
