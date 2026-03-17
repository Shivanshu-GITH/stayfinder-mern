const Joi = require("joi");

// ================= LISTING VALIDATION =================

// image validation removed because image now comes from multer (req.file)
// not from req.body

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),

    description: Joi.string().required(),

    price: Joi.number().required().min(0),

    location: Joi.string().required(),

    country: Joi.string().required(),
  }).required(),
});

// ================= REVIEW VALIDATION =================

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),

    comment: Joi.string().required(),
  }).required(),
});

