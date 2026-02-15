const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().min(5).required(),
    description: Joi.string().min(20).required(),
    price: Joi.number().min(1).required(),
    country: Joi.string().pattern(/^[A-Za-z ]+$/).required(),
    location: Joi.string().min(3).required(),
    image: Joi.object({
      url: Joi.string().uri().required()
    }).required()
  }).required()
});
