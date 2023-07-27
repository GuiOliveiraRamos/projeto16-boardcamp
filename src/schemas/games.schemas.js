import Joi from "joi";

export const schemaGames = Joi.object({
  name: Joi.string().required(),
  pricePerDay: Joi.number().min(0).required(),
  stockTotal: Joi.number().min(0).integer().required(),
});
