import { PrismaClient, CompanyDetail } from '@prisma/client';
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
  eventKey: 'JobAssigned' | 'InvoiceDue' | 'PaymentReceived' | 'JobCompleted';
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
      isActive: input.isActive ?? true,
      createdBy,
      channels: {
        create: (input.channels ?? ['Email']).map((t) => ({ type: t as any, isEnabled: true, createdBy })),
      },
      recipients: {
        create: (input.recipients ?? ['assigned_employee']).map((r) => ({ type: r as any, createdBy })),
      },
    },
    include: { channels: true, recipients: true },
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
    include: { channels: true, recipients: true },
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
    include: { channels: true, recipients: true },
  });
};

export const listCompanyNotificationRules = async (companyId: string) => {
  return prisma.companyNotificationRule.findMany({
    where: { companyId, isDeleted: false },
    orderBy: { createdDate: 'desc' },
    include: { channels: true, recipients: true },
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