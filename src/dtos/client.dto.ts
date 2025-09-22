import Joi from "joi";

export const createClientSchema = Joi.object({
    name: Joi.string().max(100).required().messages({
        "string.empty": "Name is required",
        "string.max": "Name must be less than or equal to 100 characters",
    }),
    clientCompanyName: Joi.string().max(100).required().messages({
        "string.empty": "Company name is required",
        "string.max": "Company name must be less than or equal to 100 characters",
    }),
    lastName: Joi.string().max(100).required().messages({
        "string.empty": "Last name is required",
        "string.max": "Last name must be less than or equal to 100 characters",
    }),
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Email must be valid",
    }),
    phone: Joi.string()
        .pattern(/^[0-9]{10,20}$/)
        .required()
        .messages({
            "string.empty": "Phone number is required",
            "string.pattern.base": "Phone number must be 10-20 digits",
        }),
    address: Joi.string().max(255).required().messages({
        "string.empty": "Address is required",
        "string.max": "Address must be less than or equal to 255 characters",
    }),
    status: Joi.string().valid('Active', 'InActive', 'Invited', 'Deactivate').required().messages({
        "string.empty": "Status is required",
        "any.only": "Status must be one of: Active, InActive, Invited, Deactivate",
    }),
    companyId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.empty": "Company ID is required",
            "string.guid": "Company ID must be a valid UUID",
        }),
    services: Joi.array().items(
        Joi.string().guid({ version: ["uuidv4"] })
    ).optional().messages({
        "array.base": "Services must be an array",
        "string.guid": "Each service ID must be a valid UUID",
    }),
    notes: Joi.string().max(255).optional().messages({
        "string.max": "Notes must be less than or equal to 255 characters",
    }),
    state: Joi.string().max(255).required().messages({
        "string.empty": "State is required",
        "string.max": "State must be less than or equal to 255 characters",
    }),
    city: Joi.string().max(255).required().messages({
        "string.empty": "City is required",
        "string.max": "City must be less than or equal to 255 characters",
    }),
});

export const updateClientSchema = Joi.object({
    name: Joi.string().max(100).optional().messages({
        "string.max": "Name must be less than or equal to 100 characters",
    }),
    companyName: Joi.string().max(100).optional().messages({
        "string.max": "Company name must be less than or equal to 100 characters",
    }),
    lastName: Joi.string().max(100).optional().messages({
        "string.max": "Last name must be less than or equal to 100 characters",
    }),
    email: Joi.string().email().optional().messages({
        "string.email": "Email must be valid",
    }),
    phone: Joi.string()
        .pattern(/^[0-9]{10,20}$/)
        .optional()
        .messages({
            "string.pattern.base": "Phone number must be 10-20 digits",
        }),
    status: Joi.string().valid('Active', 'InActive', 'Invited', 'Deactivate').optional().messages({
        "any.only": "Status must be one of: Active, InActive, Invited, Deactivate",
    }),
    address: Joi.string().max(255).optional().messages({
        "string.max": "Address must be less than or equal to 255 characters",
    }),
    city: Joi.string().max(255).optional().messages({
        "string.max": "City must be less than or equal to 255 characters",
    }),
    state: Joi.string().max(255).optional().messages({
        "string.max": "State must be less than or equal to 255 characters",
    }),
    notes: Joi.string().max(255).optional().messages({
        "string.max": "Notes must be less than or equal to 255 characters",
    }),
    services: Joi.array().items(
        Joi.string().guid({ version: ["uuidv4"] })
    ).optional().messages({
        "array.base": "Services must be an array",
        "string.guid": "Each service ID must be a valid UUID",
    }),
    companyId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.empty": "Company ID is required",
            "string.guid": "Company ID must be a valid UUID",
        })
});

export const createServiceSchema = Joi.object({
    serviceName: Joi.string().max(100).required().messages({
        "string.empty": "Service name is required",
        "string.max": "Service name must be less than or equal to 100 characters",
    }),
});

export const updateServiceSchema = Joi.object({
    serviceName: Joi.string().max(100).optional().messages({
        "string.max": "Service name must be less than or equal to 100 characters",
    }),
});