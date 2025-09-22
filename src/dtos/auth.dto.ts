import Joi from "joi";

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Email must be valid",
    }),
    password: Joi.string().min(6).required().messages({
        "string.empty": "Password is required",
    }),
});

export const companySignupSchema = Joi.object({
    companyName: Joi.string().max(100).required().messages({
        "string.empty": "Company name is required",
        "string.max": "Company name must be less than or equal to 100 characters",
    }),
    industry: Joi.string().max(255).optional().messages({
        "string.max": "Industry must be less than or equal to 255 characters",
    }),
    companyEmail: Joi.string().email().required().messages({
        "string.empty": "Company email is required",
        "string.email": "Company email must be valid",
    }),
    companyMobileNumber: Joi.string()
        .pattern(/^[0-9]{10,20}$/)
        .required()
        .messages({
            "string.empty": "Company mobile number is required",
            "string.pattern.base": "Company mobile number must be 10-20 digits",
        }),
    address: Joi.string().max(255).required().messages({
        "string.empty": "Address is required",
        "string.max": "Address must be less than or equal to 255 characters",
    }),
    city: Joi.string().max(100).required().messages({
        "string.empty": "City is required",
        "string.max": "City must be less than or equal to 100 characters",
    }),
    state: Joi.string().max(100).required().messages({
        "string.empty": "State is required",
        "string.max": "State must be less than or equal to 100 characters",
    }),
    name: Joi.string().max(100).required().messages({
        "string.empty": "First name is required",
        "string.max": "First name must be less than or equal to 100 characters",
    }),
    lastName: Joi.string().max(100).required().messages({
        "string.empty": "Last name is required",
        "string.max": "Last name must be less than or equal to 100 characters",
    }),
    email: Joi.string().email().required().messages({
        "string.empty": "User email is required",
        "string.email": "User email must be valid",
    }),
    mobileNumber: Joi.string()
        .pattern(/^[0-9]{10,20}$/)
        .required()
        .messages({
            "string.empty": "User mobile number is required",
            "string.pattern.base": "User mobile number must be 10-20 digits",
        }),
    planId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.empty": "Plan ID is required",
            "string.guid": "Plan ID must be a valid UUID",
        }),
    password: Joi.string().min(6).required().messages({
        "string.empty": "Password is required",
    })
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "string.empty": "Current password is required",
  }),
  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.empty": "New password is required",
      "string.min": "New password must be at least 6 characters long",
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      "string.empty": "Confirm password is required",
      "any.only": "Confirm password must match new password",
    }),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be valid",
  }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    "string.empty": "Reset token is required",
  }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters long",
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      "string.empty": "Confirm password is required",
      "any.only": "Confirm password must match password",
    }),
});