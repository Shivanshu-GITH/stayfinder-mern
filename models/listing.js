const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema(
  {
    // listing title
    title: {
      type: String,
      required: true,
    },

    // listing description
    description: String,

    // multiple images stored from cloudinary
    images: [
      {
        url: String,
        filename: String,
      },
    ],

    // price
    price: Number,

    // location
    location: String,
    country: String,

    //(FOR MAP)
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },

    // owner
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    // reviews
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  {
    strictPopulate: false,

    // important so virtuals work in EJS
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// generate thumbnails for all images
listingSchema.virtual("imageThumbnails").get(function () {
  if (!this.images) return [];

  return this.images.map((img) =>
    img.url.replace("/upload", "/upload/w_300")
  );
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;