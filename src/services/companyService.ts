import { PrismaClient, CompanyDetail, UserStatus } from '@prisma/client';
import { updateCompanyData } from '../repositories/userRepo';

const prisma = new PrismaClient();

export interface UpdateCompanyInput {
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
  modifiedBy: string;
  website?: string;
  foundedYear?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export const changeCompanyStatus = async (companyId: string, isActive: boolean, modifiedBy: string) => {
  const company = await prisma.companyDetail.findUnique({ where: { id: companyId } });
  if (!company) throw new Error('Company not found');

  const updated = await prisma.companyDetail.update({
    where: { id: companyId },
    data: {
      isActive,
      modifiedBy,
      modifiedDate: new Date(),
    },
    include: {
      subscription: true,
      user: {
        select: { id: true, name: true, lastName: true, email: true, status: true }
      },
    }
  });

  await prisma.user.update({
    where: { id: company.userId },
    data: {
      status: isActive ? 'Active' : 'InActive',
      modifiedBy,
      modifiedDate: new Date(),
    },
  });

  return updated;
};

export const getCompanyStatistics = async (companyId: string) => {
  const employeeCount = await prisma.employeeDetail.count({
    where: { companyId },
  });

  const clientCount = await prisma.clientDetail.count({
    where: { companyId },
  });

  const activeEmployeeCount = await prisma.employeeDetail.count({
    where: {
      companyId,
      employeeStatus: 'Active'
    },
  });

  const activeClientCount = await prisma.clientDetail.count({
    where: {
      companyId,
      clientStatus: 'Active'
    },
  });

  const totalServiceAssignments = await prisma.clientService.count({
    where: {
      client: {
        companyId: companyId
      }
    },
  });

  const activeServiceAssignments = await prisma.clientService.count({
    where: {
      client: {
        companyId: companyId
      },
      status: 'InProgress'
    },
  });

  return {
    totalEmployees: employeeCount,
    activeEmployees: activeEmployeeCount,
    totalClients: clientCount,
    activeClients: activeClientCount,
    totalServiceAssignments,
    activeServiceAssignments,
    companyId,
  };
};

export const updateCompany = async (id: string, input: UpdateCompanyInput): Promise<object> => {
  const existingCompany = await prisma.companyDetail.findFirst({
    where: { id },
    include: { user: true }
  });

  if (!existingCompany) {
    throw new Error('Company not found');
  }

  if (input.companyEmail && input.companyEmail !== existingCompany.companyEmail) {
    const emailExists = await prisma.companyDetail.findFirst({
      where: {
        companyEmail: input.companyEmail,
        id: { not: id }
      },
    });

    if (emailExists) {
      throw new Error('Company email already exists');
    }
  }

  await updateCompanyData({
    id: existingCompany.id,
    userId: existingCompany.userId,
    companyName: input.companyName || existingCompany.companyName,
    companyEmail: input.companyEmail || existingCompany.companyEmail,
    industry: input.industry || existingCompany.industry,
    companyMobileNumber: input.companyMobileNumber || existingCompany.companyMobileNumber,
    address: input.address || existingCompany.address,
    city: input.city || existingCompany.city,
    state: input.state || existingCompany.state,
    planId: input.planId || existingCompany.planId,
    isActive: input.isActive !== undefined ? input.isActive : existingCompany.isActive,
    website: input.website || existingCompany.website,
    foundedYear: input.foundedYear || existingCompany.foundedYear,
    createdBy: existingCompany.createdBy,
    createdDate: existingCompany.createdDate,
    modifiedBy: input.modifiedBy,
    modifiedDate: new Date(),
    primaryColor: input.primaryColor || existingCompany.primaryColor,
    secondaryColor: input.secondaryColor || existingCompany.secondaryColor,
  });

  const updatedCompanyData = await prisma.companyDetail.findFirst({
    where: { id },
    include: {
      subscription: true,
      user: {
        select: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          status: true,
        }
      },
      planDetails: true,
    },
  });

  return updatedCompanyData ?? {};
};

export const getAllCompanies = async (page: number = 1, limit: number = 10, search?: string) => {
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (search) {
    whereClause.OR = [
      { companyName: { contains: search, mode: 'insensitive' } },
      { companyEmail: { contains: search, mode: 'insensitive' } },
      { industry: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
      { state: { contains: search, mode: 'insensitive' } },
    ];
  }

  const companies = await prisma.companyDetail.findMany({
    where: whereClause,
    include: {
      subscription: true,
      user: {
        select: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          status: true,
        }
      },
      _count: {
        select: {
          employeeDetail: true,
          clientDetails: true,
        }
      }
    },
    skip,
    take: limit,
    orderBy: {
      createdDate: 'desc'
    },
  });

  const totalCount = await prisma.companyDetail.count({
    where: whereClause,
  });

  return {
    companies,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1,
    }
  };
};

export const getCompanyByCompanyId = async (companyId: string) => {
  const company = await prisma.companyDetail.findUnique({
    where: { id: companyId },
    include: {
      user: true,
      employeeDetail: true,
      clientDetails: true,
      subscription: true,
      planDetails: {
        include: {
          subscription: true,
        },
      },
    },
  });

  if (!company) {
    throw new Error('Company not found');
  }

  return company;
};

export const getCompanyByUserID = async (userId: string) => {
  const company = await prisma.companyDetail.findFirst({
    where: {
      userId: userId,
      isDeleted: false
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          status: true,
        }
      },
      employeeDetail: true,
      clientDetails: true,
      subscription: true,
      planDetails: {
        include: {
          subscription: true,
        },
      },
    },
  });

  if (!company) {
    throw new Error('Company not found for this user');
  }

  return company;
};

export const getLeavesByCompanyId = async (companyId: string, year: string) => {
  const leaves = await prisma.companyLeave.findMany({
    where: { companyId, year },
  });
  return leaves;
};

export const addLeave = async (companyId: string, input: AddLeaveInput, createdBy: string) => {
  const leave = await prisma.companyLeave.create({
    data: {
      companyId,
      ...input,
      createdBy,
      createdDate: new Date(),
    },
  });
  return leave;
};

export const updateLeave = async (leaveId: string, input: UpdateLeaveInput, modifiedBy: string) => {
  const leave = await prisma.companyLeave.update({
    where: { id: leaveId },
    data: {
      ...input,
      modifiedBy,
      modifiedDate: new Date(),
    },
  });
  return leave;
};

export const deleteLeave = async (leaveId: string, modifiedBy: string) => {
  const leave = await prisma.companyLeave.update({
    where: { id: leaveId },
    data: {
      isDeleted: true,
      modifiedBy,
      modifiedDate: new Date(),
    },
  });
  return leave;
};

export interface AddLeaveInput {
  leaveName: string;
  leaveDate: Date;
  year: string;
}

export interface UpdateLeaveInput {
  leaveName: string;
  leaveDate: Date;
  year: string;
}

export const updateCompanyLogo = async (companyId: string, logoUrl: string, modifiedBy: string) => {
  const existingCompany = await prisma.companyDetail.findUnique({ where: { id: companyId } });
  if (!existingCompany) {
    throw new Error('Company not found');
  }

  const updated = await prisma.companyDetail.update({
    where: { id: companyId },
    data: {
      companyLogoUrl: logoUrl,
      modifiedBy,
      modifiedDate: new Date(),
    },
    include: {
      subscription: true,
      user: {
        select: { id: true, name: true, lastName: true, email: true, status: true }
      },
    }
  });

  return updated;
};

export const updateCompanyColors = async (companyId: string, colors: UpdateCompanyColorsInput, modifiedBy: string) => {
  const existingCompany = await prisma.companyDetail.findUnique({ where: { id: companyId } });
  if (!existingCompany) {
    throw new Error('Company not found');
  }
  const updated = await prisma.companyDetail.update({
    where: { id: companyId },
    data: {
      primaryColor: colors.primaryColor || existingCompany.primaryColor,
      secondaryColor: colors.secondaryColor || existingCompany.secondaryColor,
      modifiedBy,
      modifiedDate: new Date(),
    },
    include: {
      subscription: true,
      user: {
        select: { id: true, name: true, lastName: true, email: true, status: true }
      },
    }
  });
  return updated;
};

export interface UpdateCompanyColorsInput {
  primaryColor?: string;
  secondaryColor?: string;
}

export const addDepartment = async (companyId: string, input: AddDepartmentInput, createdBy: string) => {
  const department = await prisma.companyDepartment.create({
    data: {
      companyId,
      ...input,
      createdBy,
      createdDate: new Date(),
    },
  });
  return department;
};

export interface AddDepartmentInput {
  department: string;
  status: boolean;
}

export const updateDepartment = async (departmentId: string, input: UpdateDepartmentInput, modifiedBy: string) => {
  const department = await prisma.companyDepartment.update({
    where: { id: departmentId },
    data: {
      ...input,
      modifiedBy,
      modifiedDate: new Date(),
    },
  });
  return department;
};

export interface UpdateDepartmentInput {
  department: string;
  status: boolean;
}

export const deleteDepartment = async (departmentId: string, modifiedBy: string) => {
  const department = await prisma.companyDepartment.update({
    where: { id: departmentId },
    data: {
      isDeleted: true,
      modifiedBy,
      modifiedDate: new Date(),
    },
  });
  return department;
};

export const getAllDepartments = async (companyId: string, page: number = 1, limit: number = 5) => {
  const skip = (page - 1) * limit;

  const where = { companyId: companyId, isDeleted: false } as const;

  const [departments, totalCount] = await Promise.all([
    prisma.companyDepartment.findMany({ where, skip, take: limit, orderBy: { createdDate: 'desc' } }),
    prisma.companyDepartment.count({ where })
  ]);

  return {
    items: departments,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1,
    },
  };
};

export const getDepartmentById = async (departmentId: string) => {
  const department = await prisma.companyDepartment.findUnique({
    where: { id: departmentId, isDeleted: false },
  });
  return department;
};

export const addPosition = async (companyId: string, input: AddPositionInput, createdBy: string) => {
  const position = await prisma.companyPosition.create({
    data: {
      company: { connect: { id: companyId } },
      ...(input.departmentId
        ? { department: { connect: { id: input.departmentId } } }
        : {}),
      title: input.title,
      level: input.level,
      description: input.description,
      salaryMin: input.salaryMin ? Number(input.salaryMin) : null,
      salaryMax: input.salaryMax ? Number(input.salaryMax) : null,
      jobRequirements: input.jobRequirements,
      jobResponsibilities: input.jobResponsibilities,
      technicalSkills: input.technicalSkills,
      createdBy,
      createdDate: new Date(),
    },
  });
  return position;
};

export interface AddPositionInput {
  departmentId: string | null | undefined;
  title: string;
  level: string;
  description: string;
  salaryMin: string;
  salaryMax: string;
  jobRequirements: string;
  jobResponsibilities: string;
  technicalSkills: string;
}

export const updatePosition = async (positionId: string, input: UpdatePositionInput, modifiedBy: string) => {
  const position = await prisma.companyPosition.update({
    where: { id: positionId, isDeleted: false },
    data: {
      title: input.title,
      level: input.level,
      description: input.description,
      salaryMin: input.salaryMin ? Number(input.salaryMin) : null,
      salaryMax: input.salaryMax ? Number(input.salaryMax) : null,
      jobRequirements: input.jobRequirements,
      jobResponsibilities: input.jobResponsibilities,
      technicalSkills: input.technicalSkills,
      ...(input.departmentId !== undefined
        ? input.departmentId
          ? { department: { connect: { id: input.departmentId } } }
          : { department: { disconnect: true } }
        : {}),
      modifiedBy,
      modifiedDate: new Date(),
    },
  });
  return position;
}

export interface UpdatePositionInput {
  departmentId: string | null | undefined;
  title: string;
  level: string;
  description: string;
  salaryMin: string;
  salaryMax: string;
  jobRequirements: string;
  jobResponsibilities: string;
  technicalSkills: string;
}

export const deletePosition = async (positionId: string, modifiedBy: string) => {
  const position = await prisma.companyPosition.update({
    where: { id: positionId, isDeleted: false },
    data: {
      isDeleted: true,
      modifiedBy,
      modifiedDate: new Date(),
    },
  });
  return position;
}

export const getPositionByCompanyId = async (companyId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const positions = await prisma.companyPosition.findMany({
    where: { companyId, isDeleted: false },
    include: {
      department: {
        select: {
          id: true,
          department: true,
          status: true,
        }
      }
    },
    skip,
    take: limit,
    orderBy: {
      createdDate: 'desc'
    },
  });

  const totalCount = await prisma.companyPosition.count({
    where: { companyId, isDeleted: false },
  });

  return {
    items: positions,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1,
    }
  };
}

export const getPositionById = async (positionId: string) => {
  const position = await prisma.companyPosition.findUnique({
    where: { id: positionId, isDeleted: false },
  });
  return position;
}

// ================= Notification Rules (Company) =================
export type CreateNotificationRuleInput = {
  name: string;
  description?: string | null;
  templateId?: string | null;
  isActive?: boolean;
  channels?: Array<'Email' | 'SMS' | 'Push'>;
  recipients?: Array<'assigned_employee' | 'manager' | 'client' | 'accounting'>;
};

export const createCompanyNotificationRule = async (
  companyId: string,
  input: CreateNotificationRuleInput,
  createdBy: string,
) => {
  const rule = await prisma.companyNotificationRule.create({
    data: {
      company: { connect: { id: companyId } },
      name: input.name,
      description: input.description ?? null,
      ...(input.templateId
        ? { template: { connect: { id: input.templateId } } }
        : {}),
      isActive: input.isActive ?? true,
      createdBy,
      channels: {
        create: (input.channels ?? ['Email']).map((t) => ({ type: t as any, isEnabled: true, createdBy })),
      },
      recipients: {
        create: (input.recipients ?? ['assigned_employee']).map((r) => ({ type: r as any, createdBy })),
      },
    },
    include: { channels: true, recipients: true, template: true },
  });
  return rule;
};

export type UpdateNotificationRuleInput = Partial<CreateNotificationRuleInput> & { id: string };

export const updateCompanyNotificationRule = async (ruleId: string, input: UpdateNotificationRuleInput, modifiedBy: string,) => {
  const updated = await prisma.companyNotificationRule.update({
    where: { id: ruleId, isDeleted: false },
    data: {
      name: input.name,
      description: input.description,
      ...(input.templateId !== undefined
        ? input.templateId
          ? { template: { connect: { id: input.templateId } } }
          : { template: { disconnect: true } }
        : {}),
      isActive: input.isActive,
      modifiedBy,
      modifiedDate: new Date(),
      // replace channels/recipients if provided
      ...(input.channels
        ? { channels: { deleteMany: {}, create: input.channels.map((t) => ({ type: t as any, isEnabled: true, createdBy: modifiedBy })) } }
        : {}),
      ...(input.recipients
        ? { recipients: { deleteMany: {}, create: input.recipients.map((r) => ({ type: r as any, createdBy: modifiedBy })) } }
        : {}),
    },
    include: { channels: true, recipients: true, template: true },
  });
  return updated;
};

export const deleteCompanyNotificationRule = async (ruleId: string, modifiedBy: string) => {
  const deleted = await prisma.companyNotificationRule.update({
    where: { id: ruleId, isDeleted: false },
    data: { isDeleted: true, modifiedBy, modifiedDate: new Date() },
  });
  return deleted;
};

export const getCompanyNotificationRuleById = async (ruleId: string) => {
  return prisma.companyNotificationRule.findUnique({
    where: { id: ruleId, isDeleted: false },
    include: { channels: true, recipients: true, template: true },
  });
};

export const listCompanyNotificationRules = async (companyId: string) => {
  return prisma.companyNotificationRule.findMany({
    where: { companyId, isDeleted: false },
    orderBy: { createdDate: 'desc' },
    include: { channels: true, recipients: true, template: true },
  });
};

// ================= Invoice Templates =================
export type InvoiceTemplateCreateInput = {
  name: string;
  description?: string | null;
  isDefault?: boolean;
  status?: 'active' | 'inactive';
  templateHtml?: string | null;
};

export type InvoiceTemplateUpdateInput = Partial<InvoiceTemplateCreateInput>;

export const createInvoiceTemplate = async (companyId: string, input: InvoiceTemplateCreateInput, createdBy: string) => {
  const created = await prisma.companyInvoiceTemplate.create({
    data: {
      company: { connect: { id: companyId } },
      name: input.name,
      description: input.description ?? null,
      isDefault: input.isDefault ?? false,
      status: input.status ?? 'active',
      templateHtml: input.templateHtml ?? null,
      createdBy,
    }
  });
  return created;
};

export const updateInvoiceTemplate = async (templateId: string, input: InvoiceTemplateUpdateInput, modifiedBy: string) => {
  const updated = await prisma.companyInvoiceTemplate.update({
    where: { id: templateId, isDeleted: false },
    data: {
      name: input.name,
      description: input.description,
      isDefault: input.isDefault,
      status: input.status,
      templateHtml: input.templateHtml,
      modifiedBy,
      modifiedDate: new Date()
    }
  });
  return updated;
};

export const deleteInvoiceTemplate = async (templateId: string, modifiedBy: string) => {
  const deleted = await prisma.companyInvoiceTemplate.update({
    where: { id: templateId, isDeleted: false },
    data: { isDeleted: true, modifiedBy, modifiedDate: new Date() }
  });
  return deleted;
};

export const getInvoiceTemplateById = async (templateId: string) => {
  return prisma.companyInvoiceTemplate.findUnique({ where: { id: templateId, isDeleted: false } });
};

export const listInvoiceTemplates = async (companyId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  const where = { companyId, isDeleted: false } as const;
  const [items, totalCount] = await Promise.all([
    prisma.companyInvoiceTemplate.findMany({ where, skip, take: limit, orderBy: { createdDate: 'desc' } }),
    prisma.companyInvoiceTemplate.count({ where })
  ]);
  return {
    items,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1,
    }
  };
};

export type InventorySupplierCreateInput = {
  name: string;
  description: string;
  status: UserStatus;
};

export type InventorySupplierUpdateInput = Partial<InventorySupplierCreateInput>;

export const createInventorySupplier = async (companyId: string, input: InventorySupplierCreateInput, createdBy: string) => {
  return prisma.inventorySupplier.create({
    data: {
      company: { connect: { id: companyId } },
      name: input.name,
      description: input.description,
      status: input.status as UserStatus,
      createdBy,
    }
  });
};

export const updateInventorySupplier = async (supplierId: string, input: InventorySupplierUpdateInput, modifiedBy: string) => {
  return prisma.inventorySupplier.update({
    where: { id: supplierId, isDeleted: false },
    data: {
      name: input.name,
      description: input.description,
      status: input.status as UserStatus,
      modifiedBy,
      modifiedDate: new Date(),
    }
  });
};

export const deleteInventorySupplier = async (supplierId: string, modifiedBy: string) => {
  return prisma.inventorySupplier.update({
    where: { id: supplierId, isDeleted: false },
    data: { isDeleted: true, deletedBy: modifiedBy, deletedDate: new Date() }
  });
};

export const getInventorySupplierById = async (supplierId: string) => {
  return prisma.inventorySupplier.findUnique({ where: { id: supplierId, isDeleted: false } });
};

export const listInventorySuppliers = async (companyId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  const where = { companyId, isDeleted: false } as const;
  const [items, totalCount] = await Promise.all([
    prisma.inventorySupplier.findMany({ where, skip, take: limit, orderBy: { createdDate: 'desc' } }),
    prisma.inventorySupplier.count({ where })
  ]);
  return {
    items,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1,
    }
  };
};

// ================= Inventory Categories =================
export type InventoryCategoryCreateInput = {
  name: string;
  description?: string | null;
  status?: boolean;
};

export type InventoryCategoryUpdateInput = Partial<InventoryCategoryCreateInput>;

export const createInventoryCategory = async (companyId: string, input: InventoryCategoryCreateInput, createdBy: string) => {
  return prisma.inventoryCategory.create({
    data: {
      companyId: companyId,
      name: input.name,
      description: input.description ?? null,
      status: input.status ?? true,
      createdBy,
    }
  });
};

export const updateInventoryCategory = async (categoryId: string, input: InventoryCategoryUpdateInput, modifiedBy: string) => {
  // Get the current category to check companyId
  const currentCategory = await prisma.inventoryCategory.findUnique({
    where: { id: categoryId, isDeleted: false },
  });

  if (!currentCategory) {
    throw new Error('Category not found.');
  }

  // If name is being updated, check for duplicates
  if (input.name && input.name !== currentCategory.name) {
    const existingCategory = await prisma.inventoryCategory.findFirst({
      where: {
        companyId: currentCategory.companyId,
        name: input.name,
        isDeleted: false,
        id: { not: categoryId }, // Exclude current category
      },
    });

    if (existingCategory) {
      throw new Error('Inventory category with this name already exists for this company.');
    }
  }

  return prisma.inventoryCategory.update({
    where: { id: categoryId, isDeleted: false },
    data: {
      name: input.name,
      description: input.description,
      status: input.status,
      modifiedBy,
      modifiedDate: new Date(),
    }
  });
};

export const deleteInventoryCategory = async (categoryId: string, modifiedBy: string) => {
  return prisma.inventoryCategory.update({
    where: { id: categoryId, isDeleted: false },
    data: { isDeleted: true, deletedBy: modifiedBy, deletedDate: new Date() }
  });
};

export const getInventoryCategoryById = async (categoryId: string) => {
  return prisma.inventoryCategory.findUnique({ where: { id: categoryId, isDeleted: false } });
};

export const listInventoryCategories = async (companyId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  const where = { companyId, isDeleted: false } as const;
  const [items, totalCount] = await Promise.all([
    prisma.inventoryCategory.findMany({ where, skip, take: limit, orderBy: { createdDate: 'desc' } }),
    prisma.inventoryCategory.count({ where })
  ]);
  return {
    items,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1,
    }
  };
};

// ================= Inventory Items =================
export type InventoryItemCreateInput = {
  name: string;
  categoryId?: string | null;
  brand?: string | null;
  sku: string;
  model?: string | null;
  location?: string | null;
  supplierId?: string | null;
  purchaseDate?: Date | null;
  description?: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  warrantyExpiry?: Date | null;
  notes?: string | null;
  serialNumbers?: string[];
};

export type InventoryItemUpdateInput = Partial<InventoryItemCreateInput>;

export const createInventoryItem = async (companyId: string, input: InventoryItemCreateInput, createdBy: string) => {
  // Check if SKU already exists for this company
  const existingItem = await prisma.inventoryItem.findFirst({
    where: {
      companyId: companyId,
      sku: input.sku,
      isDeleted: false,
    },
  });

  if (existingItem) {
    throw new Error('Inventory item with this SKU already exists for this company.');
  }

  return prisma.inventoryItem.create({
    data: {
      companyId: companyId,
      name: input.name,
      categoryId: input.categoryId,
      brand: input.brand,
      sku: input.sku,
      model: input.model,
      location: input.location,
      supplierId: input.supplierId,
      purchaseDate: input.purchaseDate,
      description: input.description,
      quantity: input.quantity,
      unit: input.unit as any,
      unitPrice: input.unitPrice,
      warrantyExpiry: input.warrantyExpiry,
      notes: input.notes,
      createdBy,
    }
  });
};

export const updateInventoryItem = async (itemId: string, input: InventoryItemUpdateInput, modifiedBy: string) => {
  // Get the current item to check companyId
  const currentItem = await prisma.inventoryItem.findUnique({
    where: { id: itemId, isDeleted: false },
  });

  if (!currentItem) {
    throw new Error('Inventory item not found.');
  }

  // If SKU is being updated, check for duplicates
  if (input.sku && input.sku !== currentItem.sku) {
    const existingItem = await prisma.inventoryItem.findFirst({
      where: {
        companyId: currentItem.companyId,
        sku: input.sku,
        isDeleted: false,
        id: { not: itemId }, // Exclude current item
      },
    });

    if (existingItem) {
      throw new Error('Inventory item with this SKU already exists for this company.');
    }
  }

  return prisma.inventoryItem.update({
    where: { id: itemId, isDeleted: false },
    data: {
      name: input.name,
      categoryId: input.categoryId,
      brand: input.brand,
      sku: input.sku,
      model: input.model,
      location: input.location,
      supplierId: input.supplierId,
      purchaseDate: input.purchaseDate,
      description: input.description,
      quantity: input.quantity,
      unit: input.unit as any,
      unitPrice: input.unitPrice,
      warrantyExpiry: input.warrantyExpiry,
      notes: input.notes,
      modifiedBy,
      modifiedDate: new Date(),
    }
  });
};

export const deleteInventoryItem = async (itemId: string, modifiedBy: string) => {
  return prisma.inventoryItem.update({
    where: { id: itemId, isDeleted: false },
    data: { isDeleted: true, deletedBy: modifiedBy, deletedDate: new Date() }
  });
};

export const getInventoryItemById = async (itemId: string) => {
  return prisma.inventoryItem.findUnique({
    where: { id: itemId, isDeleted: false },
    include: {
      category: true,
      supplier: true,
      serialNumbers: true,
    }
  });
};

export const listInventoryItems = async (companyId: string, page: number = 1, limit: number = 10, search?: string) => {
  const skip = (page - 1) * limit;
  const where: any = { companyId, isDeleted: false };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { model: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, totalCount] = await Promise.all([
    prisma.inventoryItem.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdDate: 'desc' },
      include: {
        category: true,
        supplier: true,
        serialNumbers: true,
      }
    }),
    prisma.inventoryItem.count({ where })
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1,
    }
  };
};

export const bulkCreateInventoryItems = async (companyId: string, items: InventoryItemCreateInput[], createdBy: string) => {
  // Check for duplicate SKUs within the provided items
  const skus = items.map(item => item.sku);
  const duplicateSkus = skus.filter((sku, index) => skus.indexOf(sku) !== index);

  if (duplicateSkus.length > 0) {
    throw new Error(`Duplicate SKUs found in request: ${duplicateSkus.join(', ')}`);
  }

  // Check if any SKU already exists for this company
  const existingItems = await prisma.inventoryItem.findMany({
    where: {
      companyId: companyId,
      sku: { in: skus },
      isDeleted: false,
    },
    select: { sku: true }
  });

  if (existingItems.length > 0) {
    const existingSkus = existingItems.map(item => item.sku);
    throw new Error(`The following SKUs already exist for this company: ${existingSkus.join(', ')}`);
  }

  // Create all items in a transaction
  const createdItems = await prisma.$transaction(async (tx) => {
    const results = [];
    for (const item of items) {
      const createdItem = await tx.inventoryItem.create({
        data: {
          companyId: companyId,
          name: item.name,
          categoryId: item.categoryId,
          brand: item.brand,
          sku: item.sku,
          model: item.model,
          location: item.location,
          supplierId: item.supplierId,
          purchaseDate: item.purchaseDate,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit as any,
          unitPrice: item.unitPrice,
          warrantyExpiry: item.warrantyExpiry,
          notes: item.notes,
          createdBy,
        },
        include: {
          category: true,
          supplier: true,
          serialNumbers: true,
        }
      });
      
      // Create serial numbers if provided
      if (item.serialNumbers && item.serialNumbers.length > 0) {
        await Promise.all(
          item.serialNumbers.map(serialNumber =>
            tx.inventorySerial.create({
              data: {
                itemId: createdItem.id,
                serial: serialNumber,
                createdBy,
              }
            })
          )
        );
      }
      
      results.push(createdItem);
    }
    return results;
  });

  return {
    success: true,
    count: createdItems.length,
    items: createdItems,
  };
};

export const getInventoryItemsByCompanyId = async (companyId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  const where: any = { companyId, isDeleted: false };
  const [items, totalCount] = await Promise.all([
    prisma.inventoryItem.findMany({ where, skip, take: limit, orderBy: { createdDate: 'desc' } }),
    prisma.inventoryItem.count({ where })
  ]);
  return {
    items,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1,
    }
  };
};
