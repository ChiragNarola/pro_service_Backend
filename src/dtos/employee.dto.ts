import Joi from "joi";

export const employeeSchema = Joi.object({
    name: Joi.string().max(100).required().messages({
        "string.empty": "First name is required",
        "string.max": "First name must be less than or equal to 100 characters",
    }),
    lastName: Joi.string().max(100).required().messages({
        "string.empty": "Last name is required",
        "string.max": "Last name must be less than or equal to 100 characters",
    }),
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Email must be valid",
    }),
    mobileNumber: Joi.string()
        .pattern(/^[0-9]{10,20}$/)
        .required()
        .messages({
            "string.empty": "Mobile number is required",
            "string.pattern.base": "Mobile number must be 10-20 digits",
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
    departmentId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.empty": "Department ID is required",
            "string.guid": "Department ID must be a valid UUID",
        }),
    employeeRoleId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.empty": "Employee Role ID is required",
            "string.guid": "Employee Role ID must be a valid UUID",
        }),
    password: Joi.string().min(6).required().messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters",
    }),
    joinDate: Joi.date().required().messages({
        "date.base": "Join date must be a valid date",
        "any.required": "Join date is required",
    }),
    companyId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.empty": "Company ID is required",
            "string.guid": "Company ID must be a valid UUID",
        }),
    salary: Joi.string().max(100).required().messages({
        "string.empty": "salary is required",
        "string.max": "salary must be less than or equal to 100 characters",
    }),
    roleId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.empty": "Company ID is required",
            "string.guid": "Company ID must be a valid UUID",
        }),
    skills: Joi.string().max(100).required().messages({
        "string.empty": "skills is required",
        "string.max": "skills must be less than or equal to 100 characters",
    }),
    managerId: Joi.alternatives().try(
        Joi.string().guid({ version: ['uuidv4'] }),
        Joi.valid(null),
        Joi.valid('')
    ).optional().messages({
        'string.guid': 'Manager Id must be a valid UUID',
    }),
    eid: Joi.string().max(100).required().messages({
        "string.empty": "Employee id is required",
        "string.max": "Employee id must be less than or equal to 100 characters",
    })
});

export const updateEmployeeSchema = Joi.object({
    id: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.empty": "ID is required",
            "string.guid": "ID must be a valid UUID",
        }),
    userId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.empty": "userId is required",
            "string.guid": "userId  must be a valid UUID",
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
        "string.empty": "Email is required",
        "string.email": "Email must be valid",
    }),
    mobileNumber: Joi.string()
        .pattern(/^[0-9]{10,20}$/)
        .required()
        .messages({
            "string.empty": "Mobile number is required",
            "string.pattern.base": "Mobile number must be 10-20 digits",
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
    departmentId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.empty": "Department ID is required",
            "string.guid": "Department ID must be a valid UUID",
        }),
    employeeRoleId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.empty": "Employee Role ID is required",
            "string.guid": "Employee Role ID must be a valid UUID",
        }),
    password: Joi.string().min(6).required().messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters",
    }),
    joinDate: Joi.date().required().messages({
        "date.base": "Join date must be a valid date",
        "any.required": "Join date is required",
    }),
    companyId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.empty": "Company ID is required",
            "string.guid": "Company ID must be a valid UUID",
        }),
    salary: Joi.string().max(100).required().messages({
        "string.empty": "salary is required",
        "string.max": "salary must be less than or equal to 100 characters",
    }),
    roleId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.empty": "Company ID is required",
            "string.guid": "Company ID must be a valid UUID",
        }),
    skills: Joi.string().max(100).required().messages({
        "string.empty": "skills is required",
        "string.max": "skills must be less than or equal to 100 characters",
    }),
    managerId: Joi.alternatives().try(
        Joi.string().guid({ version: ['uuidv4'] }),
        Joi.valid(null),
        Joi.valid('')
    ).optional().messages({
        'string.guid': 'Manager Id must be a valid UUID',
    }),
    eid: Joi.string().max(100).required().messages({
        "string.empty": "Employee id is required",
        "string.max": "Employee id must be less than or equal to 100 characters",
    }),
     employeeStatus: Joi.string().max(100).required().messages({
        "string.empty": "status is required",
        "string.max": "status must be less than or equal to 100 characters",
    }),
});

export const fetchCompanySchema = Joi.object({
    companyId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.empty": "Company ID is required",
            "string.guid": "Company ID must be a valid UUID",
        })
});


