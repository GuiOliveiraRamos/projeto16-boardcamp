import Joi from "joi";

export const schemaGames = Joi.object({
  name: Joi.string().required(),
  pricePerDay: Joi.string().min(1).required(),
  stockTotal: Joi.string().min(1).required(),
});