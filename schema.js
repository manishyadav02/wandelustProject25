import Joi from "joi";

const listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    country: Joi.string().required(),
    location: Joi.string().required(),
    image: Joi.object({
      url: Joi.string().allow("", null),
    }).optional(),
    price: Joi.number().required().min(0),
  }).required(),
});

// reviews

const reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required(),
    comment: Joi.string().required(),
  }).required(),
});

export { listingSchema, reviewSchema };

