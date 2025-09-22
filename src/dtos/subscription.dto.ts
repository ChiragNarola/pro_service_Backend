import Joi from 'joi';

// Enums mirrored from Prisma schema
const planNameEnum = Joi.string().valid('Starter', 'Professional', 'Enterprise');
const durationEnum = Joi.string().valid('Monthly', 'Annual');

export const createSubscriptionSchema = Joi.object({
  planName: planNameEnum.required(),
  duration: durationEnum.required(),
  planPrice: Joi.number().positive().precision(2).required(),
  isPopular: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  employeeCount: Joi.string().optional(),
  features: Joi.array().items(Joi.string()).optional(),
});

export const updateSubscriptionSchema = Joi.object({
  planName: planNameEnum.optional(),
  duration: durationEnum.optional(),
  planPrice: Joi.number().positive().precision(2).optional(),
  employeeCount: Joi.string().optional(),
  features: Joi.array().items(Joi.string()).optional(),
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