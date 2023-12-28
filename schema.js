// This is server side schema validation code
// Form validations for the client side is applied so that no wrong information is sent to the server.
// But users can use postman to send wrong information to the server. So we need to validate the data on the server side as well.
const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing:Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(1),
        image: Joi.string().allow("", null),
        category: Joi.string().required(),

    }).required()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comment:Joi.string().required(),
    }).required()
})