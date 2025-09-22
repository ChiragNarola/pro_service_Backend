import { PrismaClient, CompanyDetail } from '@prisma/client';
import { updateCompanyData } from '../repositories/userRepo';

const prisma = new PrismaClient();

// Company Update Interface
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
}

// Change company status only
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

// Company Statistics Services
export const getCompanyStatistics = async (companyId: string) => {
  // Get number of employees for the company
  const employeeCount = await prisma.employeeDetail.count({
    where: { companyId },
  });

  // Get number of clients for the company
  const clientCount = await prisma.clientDetail.count({
    where: { companyId },
  });

  // Get number of active employees
  const activeEmployeeCount = await prisma.employeeDetail.count({
    where: {
      companyId,
      employeeStatus: 'Active'
    },
  });

  // Get number of active clients
  const activeClientCount = await prisma.clientDetail.count({
    where: {
      companyId,
      clientStatus: 'Active'
    },
  });

  // Get total service assignments for the company's clients
  const totalServiceAssignments = await prisma.clientService.count({
    where: {
      client: {
        companyId: companyId
      }
    },
  });

  // Get active service assignments
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

// Update Company Service
export const updateCompany = async (
  id: string,
  input: UpdateCompanyInput
): Promise<object> => {
  // First, get the company to find the userId
  const existingCompany = await prisma.companyDetail.findFirst({
    where: { id },
    include: { user: true }
  });

  if (!existingCompany) {
    throw new Error('Company not found');
  }

  // If email is being updated, check if it's already taken by another company
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

  // Update company detail
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
    paymentDateTime: existingCompany.paymentDateTime,
    startDateTime: existingCompany.startDateTime,
    paymentMethod: existingCompany.paymentMethod,
    endDateTime: existingCompany.endDateTime,
    createdBy: existingCompany.createdBy,
    createdDate: existingCompany.createdDate,
    modifiedBy: input.modifiedBy,
    modifiedDate: new Date(),
  });

  // Get updated company with all related data
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

// Get All Companies Service
export const getAllCompanies = async (page: number = 1, limit: number = 10, search?: string) => {
  const skip = (page - 1) * limit;

  // Build where clause for search
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

  // Get companies with pagination and search
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

  // Get total count for pagination
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

// Get Company by Company ID Service
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