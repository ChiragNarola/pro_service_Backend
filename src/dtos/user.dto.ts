import Joi from 'joi';

export const updateUserSchema = Joi.object({
    name: Joi.string().max(100),
    lastName: Joi.string().max(100),
    email: Joi.string().email(),
    mobileNumber: Joi.string().max(20),
    profilePhotoURL: Joi.string().max(1000).optional(),
    id: Joi.string().guid({ version: ['uuidv4'] }).required()
  });