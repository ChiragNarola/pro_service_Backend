import Joi from 'joi';

const durationEnum = Joi.string().valid('Monthly', 'Annual', 'Quarterly', 'HalfYearly');

export const createSubscriptionSchema = Joi.object({
  planName: Joi.string().required(),
  duration: durationEnum.required(),
  rate: Joi.number().positive().precision(2).required(),
  isPopular: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  employeeCount: Joi.string().optional(),
  features: Joi.array().items(Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required()
  })).optional(),
});

export const updateSubscriptionSchema = Joi.object({
  planName: Joi.string().optional(),
  duration: durationEnum.optional(),
  rate: Joi.number().positive().precision(2).optional(),
  employeeCount: Joi.string().optional(),
  features: Joi.array().items(Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required()
  })).optional(),
  isPopular: Joi.boolean().optional(),
}).min(1);

export const createModuleSchema = Joi.object({
  name: Joi.string().max(100).required(),
  isActive: Joi.boolean().optional(),
});

export const updateModuleSchema = Joi.object({
  name: Joi.string().max(100).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);