import Joi from 'joi';

export const updateSettingsSchema = Joi.object({
  emailNotifications: Joi.boolean().optional(),
  smsNotifications: Joi.boolean().optional(),
  pushNotifications: Joi.boolean().optional(),
  weeklyReports: Joi.boolean().optional(),
  paymentGateway: Joi.string().valid('Stripe', 'PayPal', 'Square').optional(),
  primaryColor: Joi.string().optional(),
  secondaryColor: Joi.string().optional(),
  brandingLogo: Joi.string().uri().optional(),
  supportEmail: Joi.string().email().optional(),
  supportAutoAssign: Joi.boolean().optional(),
  supportSlaHours: Joi.number().integer().min(0).optional(),
  supportAutoReply: Joi.boolean().optional(),
  billingCurrency: Joi.string().optional(),
  billingInvoicePrefix: Joi.string().optional(),
  billingTaxRate: Joi.number().precision(2).optional(),
  stripePubKey: Joi.string().optional(),
  stripeSecretKey: Joi.string().optional(),
  userId: Joi.string().guid({ version: ['uuidv4'] }).required(),
});


