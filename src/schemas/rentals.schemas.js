import Joi from "joi";

export const schemaRentals = Joi.object({
  customerId: Joi.string().required(),
  gameId: Joi.string().required(),
  daysRented: Joi.number().required(),
});
