import Joi from 'joi';

// Company Update Interface (matches the service interface)
export interface UpdateCompanyDto {
  companyName?: string;
  companyEmail?: string;
  industry?: string;
  companyMobileNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  planId?: string;
  isActive?: boolean;
  paymentMethod?: string;
}

// Company Response DTO
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
  planId: Joi.string().uuid().allow(null).required(),
  isActive: Joi.boolean().required(),
  paymentDateTime: Joi.date().required(),
  startDateTime: Joi.date().required(),
  paymentMethod: Joi.string().allow(null).required(),
  endDateTime: Joi.date().allow(null).required(),
  createdBy: Joi.string().required(),
  createdDate: Joi.date().required(),
  modifiedBy: Joi.string().allow(null).required(),
  modifiedDate: Joi.date().allow(null).required(),
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
  paymentDateTime: Date;
  startDateTime: Date;
  paymentMethod: string | null;
  endDateTime: Date | null;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string | null;
  modifiedDate: Date | null;
} 