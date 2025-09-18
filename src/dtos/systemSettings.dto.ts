import Joi from 'joi';

export const updateSettingsSchema = Joi.object({
  emailNotifications: Joi.boolean().optional(),
  smsNotifications: Joi.boolean().optional(),
  paymentGateway: Joi.string().valid('Stripe', 'PayPal', 'Square').optional(),
  userId: Joi.string().guid({ version: ['uuidv4'] }).required(),
});


