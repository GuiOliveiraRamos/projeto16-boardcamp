import Joi from "joi";

export const schemaRentals = Joi.object({
  customerId: Joi.number().required(),
  gameId: Joi.number().required(),
  daysRented: Joi.number().required(),
});
