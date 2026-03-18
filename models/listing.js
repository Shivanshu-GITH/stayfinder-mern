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

    // ================= CATEGORY (BOOKING BASED) =================
    category: {
      type: String,
      enum: [
        "Apartment",
        "House",
        "Villa",
        "Hotel",
        "Hostel",
        "Resort",
        "Cottage",
        "Cabin",
        "Farm Stay",
        "Camping",
        "Luxury",
        "Beachfront",
        "Mountain View",
        "City Stay"
      ],
      default: "Apartment",
    },

    // ================= MAP =================
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// index for search
listingSchema.index({ title: "text", location: "text" });

// thumbnails
listingSchema.virtual("imageThumbnails").get(function () {
  if (!this.images) return [];

  return this.images.map((img) =>
    img.url.replace("/upload", "/upload/w_300")
  );
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
