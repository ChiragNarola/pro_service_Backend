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
  console.log("🚀 ~ getLeavesByCompanyId ~ year:", year)
  const leaves = await prisma.companyLeave.findMany({
    where: { companyId, year },
  });
  console.log("🚀 ~ getLeavesByCompanyId ~ leaves:", leaves)
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

export const updateLeave = async (companyId: string, input: UpdateLeaveInput, modifiedBy: string) => {
  const leave = await prisma.companyLeave.update({
    where: { id: companyId },
    data: {
      ...input,
      modifiedBy,
      modifiedDate: new Date(),
    },
  });
  return leave;
};

export const deleteLeave = async (companyId: string, input: UpdateLeaveInput, modifiedBy: string) => {
  const leave = await prisma.companyLeave.update({
    where: { id: companyId },
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