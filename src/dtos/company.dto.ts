import Joi from 'joi';
export interface UpdateCompanyDto {
  companyName?: string;
  companyEmail?: string;
  industry?: string;
  companyMobileNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  isActive?: boolean;
  website?: string;
  foundedYear?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export const companyResponseSchema = Joi.object({
  id: Joi.string().uuid().required(),
  userId: Joi.string().uuid().allow(null).required(),
  companyName: Joi.string().required(),
  companyEmail: Joi.string().required(),
  industry: Joi.string().allow(null).required(),
  companyMobileNumber: Joi.string().allow(null).required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  isActive: Joi.boolean().required(),
  website: Joi.string().allow(null).required(),
  planId: Joi.string().uuid().allow(null).required(),
  paymentMethod: Joi.string().allow(null).required(),
  paymentDateTime: Joi.date().required(),
  startDateTime: Joi.date().required(),
  endDateTime: Joi.date().allow(null).required(),
  createdBy: Joi.string().required(),
  createdDate: Joi.date().required(),
  modifiedBy: Joi.string().allow(null).required(),
  modifiedDate: Joi.date().allow(null).required(),
  foundedYear: Joi.string().allow(null).required(),
});

export interface CompanyResponseDto {
  id: string;
  userId: string | null;
  companyName: string;
  companyEmail: string;
  industry: string | null;
  companyMobileNumber: string | null;
  address: string;
  city: string;
  state: string;
  planId: string | null;
  isActive: boolean;
  website: string | null;
  foundedYear: string | null;
  paymentMethod: string | null;
  paymentDateTime: Date;
} 

export const updateCompanySchema = Joi.object({
  companyName: Joi.string().required(),
  companyEmail: Joi.string().required(),
  industry: Joi.string().required(),
  companyMobileNumber: Joi.string().required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  isActive: Joi.boolean().required(),
  website: Joi.string().required(),
  foundedYear: Joi.string().required(),
  primaryColor: Joi.string().required(),
  secondaryColor: Joi.string().required(),
}); 

export const addLeaveSchema = Joi.object({
  leaveName: Joi.string().required(),
  leaveDate: Joi.date().required(),
  year: Joi.string().required(),
});

export const updateLeaveSchema = Joi.object({
  leaveName: Joi.string().required(),
  leaveDate: Joi.date().required(),
  year: Joi.string().required(),
});

export const updateCompanyColorsSchema = Joi.object({
  primaryColor: Joi.string(),
  secondaryColor: Joi.string(),
});