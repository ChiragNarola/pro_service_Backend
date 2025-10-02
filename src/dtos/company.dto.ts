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

export const addDepartmentSchema = Joi.object({
  companyId: Joi.string().required(),
  department: Joi.string().required(),
  status: Joi.boolean().required()
});

export const updateDepartmentSchema = Joi.object({
  companyId: Joi.string().required(),
  department: Joi.string().required(),
  status: Joi.boolean().required()
});

export const addPositionSchema = Joi.object({
  companyId: Joi.string().required(),
  departmentId: Joi.string().required(),
  title: Joi.string().required(),
  level: Joi.string().required(),
  description: Joi.string().required(),
  salaryMin: Joi.string().required(),
  salaryMax: Joi.string().required(),
  jobRequirements: Joi.string().required(),
  jobResponsibilities: Joi.string().required(),
  technicalSkills: Joi.string().required(),
});

export const updatePositionSchema = Joi.object({
  id: Joi.string().required(),
  companyId: Joi.string().required(),
  departmentId: Joi.string().required(),
  title: Joi.string().required(),
  level: Joi.string().required(),
  description: Joi.string().required(),
  salaryMin: Joi.string().required(),
  salaryMax: Joi.string().required(),
  jobRequirements: Joi.string().required(),
  jobResponsibilities: Joi.string().required(),
  technicalSkills: Joi.string().required(),
});

// ================= Invoice Template Schemas =================
export const addInvoiceTemplateSchema = Joi.object({
  companyId: Joi.string().required(),
  name: Joi.string().max(150).required(),
  description: Joi.string().allow(null, ''),
  isDefault: Joi.boolean().default(false),
  status: Joi.string().valid('active', 'inactive').default('active'),
  templateHtml: Joi.string().allow(null, ''),
});

export const updateInvoiceTemplateSchema = Joi.object({
  templateId: Joi.string(),
  name: Joi.string().max(150),
  description: Joi.string().allow(null, ''),
  isDefault: Joi.boolean(),
  status: Joi.string().valid('active', 'inactive'),
  templateHtml: Joi.string().allow(null, ''),
});

// ================= Inventory Category Schemas =================
export const addInventoryCategorySchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().max(100).allow(null, ''),
  status: Joi.boolean().default(true),
});

export const updateInventoryCategorySchema = Joi.object({
  name: Joi.string().max(100),
  description: Joi.string().max(100).allow(null, ''),
  status: Joi.boolean(),
});

// ================= Inventory Item Schemas =================
export const addInventoryItemSchema = Joi.object({
  name: Joi.string().max(150).required(),
  categoryId: Joi.string().uuid().allow(null, ''),
  brand: Joi.string().max(100).allow(null, ''),
  sku: Joi.string().max(100).required(),
  model: Joi.string().max(100).allow(null, ''),
  location: Joi.string().max(255).allow(null, ''),
  supplierId: Joi.string().uuid().allow(null, ''),
  purchaseDate: Joi.date().allow(null, ''),
  description: Joi.string().max(2000).allow(null, ''),
  quantity: Joi.number().integer().min(0).required(),
  unit: Joi.string().valid('Units', 'Pieces', 'Boxes', 'Packs').required(),
  unitPrice: Joi.number().min(0).required(),
  warrantyExpiry: Joi.date().allow(null, ''),
  notes: Joi.string().max(1000).allow(null, ''),
  serialNumbers: Joi.array().items(Joi.string().max(200)).max(1000).allow(null, ''),
}).unknown(true);

export const updateInventoryItemSchema = Joi.object({
  name: Joi.string().max(150),
  categoryId: Joi.string().uuid().allow(null, ''),
  brand: Joi.string().max(100).allow(null, ''),
  sku: Joi.string().max(100),
  model: Joi.string().max(100).allow(null, ''),
  location: Joi.string().max(255).allow(null, ''),
  supplierId: Joi.string().uuid().allow(null, ''),
  purchaseDate: Joi.date().allow(null, ''),
  description: Joi.string().max(2000).allow(null, ''),
  quantity: Joi.number().integer().min(0),
  unit: Joi.string().valid('Units', 'Pieces', 'Boxes', 'Packs'),
  unitPrice: Joi.number().min(0),
  warrantyExpiry: Joi.date().allow(null, ''),
  notes: Joi.string().max(1000).allow(null, ''),
});

export const bulkCreateInventoryItemsSchema = Joi.object({
  companyId: Joi.string().required(),
  items: Joi.array().items(addInventoryItemSchema).min(1).max(100).required()
}).unknown(true);