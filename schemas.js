const Joi = require("joi");

// ================= LISTING VALIDATION =================

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),

    description: Joi.string().required(),

    price: Joi.number().required().min(0),

    location: Joi.string().required(),

    country: Joi.string().required(),

    category: Joi.string().valid(
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
    ).optional(),

    // ALLOW COORDINATES
    lat: Joi.number().optional(),

    lng: Joi.number().optional(),
  }).required(),
});

// ================= REVIEW VALIDATION =================

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),

    comment: Joi.string().required(),
  }).required(),
});