import { PrismaClient, User, Role, CompanyDetail, RoleName, EmployeeDetail, UserStatus, ClientDetail } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { GenericRepo } from './genericRepo';

const prisma = new PrismaClient();
const userRepo = new GenericRepo<
  User,
  typeof prisma.user,
  Parameters<typeof prisma.user.findMany>[0]['where'],
  Parameters<typeof prisma.user.findUnique>[0]['where'],
  Parameters<typeof prisma.user.findFirst>[0]['select'],
  Parameters<typeof prisma.user.findFirst>[0]['include'],
  Parameters<typeof prisma.user.create>[0]['data'],
  Parameters<typeof prisma.user.update>[0]['data'],
  Parameters<typeof prisma.user.updateMany>[0]['data'],
  Parameters<typeof prisma.user.findMany>[0]['orderBy']
>(prisma.user);

interface CreateUserDTO {
  name: string;
  email: string;
  password?: string;
  mobileNumber?: string;
  profilePhotoURL?: string;
  roleId?: string;
  createdBy?: string;
}

interface EmployeeData {
  id: string;
  userId: string;
  status: UserStatus;
}

interface EmployeeUpdate {
  id: string;
  userId: string;
  name: string;
  lastName: string,
  email?: string;
  mobileNumber: string;
  companyMobileNumber: string;
  address: string;
  city: string;
  state: string;
  departmentId: string;
  employeeRoleId: string;
  joinDate: Date | string;
  companyId: string;
  password: string;
  roleId: string;
  salary: string;
  skills: string;
  eid: string;
  managerId: string;
  employeeStatus: UserStatus;
  status: UserStatus;
  createdBy: string;
  modifiedBy: string;
  modifiedDate: Date | string;
}

interface ClientData {
  id: string;
  userId: string;
  companyId: string;
  clientCompanyName?: string;
  clientEmail?: string;
  clientPhone?: string;
  address: string;
  city: string;
  state: string;
  notes?: string;
  clientStatus: UserStatus;
  createdBy: string;
}

export const authenticateUser = async (
  email: string,
  plainPassword: string
): Promise<(Omit<User, 'password'> & { role?: Role; }) | null> => {

  const user = await userRepo.findSelectedOne(
    { email },
    {
      id: true,
      name: true,
      email: true,
      password: true,
      mobileNumber: true,
      profilePhotoURL: true,
      status: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    }
  ) as (User & { role?: Role; });

  if (!user) return null;
  const isMatch = await bcrypt.compare(plainPassword, user.password);
  if (!isMatch) return null;

  const { password, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword
  };
};

export const createCompany = async (companyData: Partial<CompanyDetail>): Promise<CompanyDetail> => {
  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setFullYear(now.getFullYear() + 1);
  return await prisma.companyDetail.create({
    data: {
      id: companyData.id!,
      userId: companyData.userId,
      companyName: companyData.companyName!,
      companyEmail: companyData.companyEmail!,
      industry: companyData.industry,
      companyMobileNumber: companyData.companyMobileNumber,
      address: companyData.address!,
      city: companyData.city!,
      state: companyData.state!,
      planId: companyData.planId,
      isActive: companyData.isActive ?? true,
      paymentDateTime: new Date(),
      startDateTime: new Date(),
      paymentMethod: companyData.paymentMethod,
      endDateTime: nextYear,
      createdBy: companyData.createdBy!,
      createdDate: new Date(),
      modifiedBy: companyData.modifiedBy,
      modifiedDate: companyData.modifiedDate,
    },
  });
};

export const getRoleId = async (type: RoleName): Promise<Role | null> => {
  const roleData = await prisma.role.findUnique({
    where: { name: type },
    select: {
      id: true,
      name: true,
      createdBy: true,
      createdDate: true,
      modifiedBy: true,
      modifiedDate: true,
      isActive: true,
      companyId: true,
    }
  });
  return roleData;
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
  const hashedPassword = userData?.password ? await bcrypt.hash(userData.password, 10) : undefined;

  return await prisma.user.create({
    data: {
      id: userData.id!,
      name: userData.name!,
      lastName: userData.lastName!,
      email: userData.email!,
      mobileNumber: userData.mobileNumber,
      password: hashedPassword,
      createdBy: userData.createdBy!,
      createdDate: new Date(),
      modifiedBy: userData.modifiedBy,
      modifiedDate: userData.modifiedDate,
      roleId: userData.roleId,
      status: userData.status ?? 'Active'
    },
  });
};

export const createEmployeeData = async (employeeData: Partial<EmployeeDetail>): Promise<EmployeeDetail> => {
  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setFullYear(now.getFullYear() + 1);
  return await prisma.employeeDetail.create({
    data: {
      id: employeeData.id!,
      userId: employeeData.userId,
      companyId: employeeData.companyId!,
      departmentId: employeeData.departmentId,
      employeeRoleId: employeeData.employeeRoleId,
      address: employeeData.address!,
      city: employeeData.city!,
      state: employeeData.state!,
      employeeStatus: "Active",
      joinDate: new Date(),
      createdBy: employeeData.createdBy!,
      createdDate: new Date(),
      modifiedBy: employeeData.modifiedBy,
      modifiedDate: employeeData.modifiedDate,
      salary: employeeData.salary,
      skills: employeeData.skills,
      managerId: employeeData.managerId,
      eid: employeeData.eid
    },
  });
};

export const createClientData = async (clientData: Partial<ClientDetail>): Promise<ClientDetail> => {
  return await prisma.clientDetail.create({
    data: {
      id: clientData.id!,
      userId: clientData.userId!,
      companyId: clientData.companyId!,
      clientCompanyName: clientData.clientCompanyName!,
      address: clientData.address!,
      city: clientData.city!,
      state: clientData.state!,
      notes: clientData.notes,
      clientStatus: clientData.clientStatus ?? 'Active',
      inviteDate: new Date(),
      joinDate: new Date(),
      createdBy: clientData.createdBy!,
      createdDate: new Date(),
      modifiedBy: clientData.modifiedBy,
      modifiedDate: clientData.modifiedDate,
    },
  });
};

export const updateUserStatus = async (userData: Partial<User>): Promise<User> => {
  if (!userData.id || !userData.status) {
    throw new Error('User ID and status are required.');
  }

  return await prisma.user.update({
    where: { id: userData.id },
    data: {
      status: userData.status,
    },
  });
};

export const updateEmployeeStatusData = async (userData: Partial<EmployeeData>): Promise<EmployeeDetail> => {
  if (!userData.id || !userData.status) {
    throw new Error('User ID and status are required.');
  }

  return await prisma.employeeDetail.update({
    where: { id: userData.id },
    data: {
      employeeStatus: userData.status,
    },
  });
};

export const updateUser = async (userData: Partial<User>): Promise<User> => {

  return await prisma.user.update({
    where: { id: userData.id },
    data: {
      id: userData.id!,
      name: userData.name!,
      lastName: userData.lastName!,
      email: userData.email!,
      mobileNumber: userData.mobileNumber,
      profilePhotoURL: userData.profilePhotoURL,
      createdBy: userData.createdBy!,
      createdDate: userData.createdDate!,
      modifiedBy: userData.modifiedBy,
      modifiedDate: userData.modifiedDate,
      roleId: userData.roleId,
      status: userData.status
    },
  });
};

export const updateEmployeeData = async (employeeData: Partial<EmployeeDetail>): Promise<EmployeeDetail> => {
  return await prisma.employeeDetail.update({
    where: { id: employeeData.id },
    data: {
      id: employeeData.id!,
      userId: employeeData.userId,
      companyId: employeeData.companyId!,
      departmentId: employeeData.departmentId,
      employeeRoleId: employeeData.employeeRoleId,
      address: employeeData.address!,
      city: employeeData.city!,
      state: employeeData.state!,
      employeeStatus: employeeData.employeeStatus,
      joinDate: new Date(),
      createdBy: employeeData.createdBy!,
      createdDate: new Date(),
      modifiedBy: employeeData.modifiedBy,
      modifiedDate: employeeData.modifiedDate,
      salary: employeeData.salary,
      skills: employeeData.skills,
      managerId: employeeData.managerId,
      eid: employeeData.eid
    },
  });
};


export const updateClientData = async (clientData: Partial<ClientDetail>): Promise<ClientDetail> => {
  return await prisma.clientDetail.update({
    where: { id: clientData.id },
    data: {
      id: clientData.id!,
      userId: clientData.userId,
      companyId: clientData.companyId!,
      clientCompanyName: clientData.clientCompanyName!,
      address: clientData.address!,
      city: clientData.city!,
      notes: clientData.notes,
      state: clientData.state!,
      clientStatus: clientData.clientStatus,
      joinDate: clientData.joinDate,
      createdBy: clientData.createdBy!,
      createdDate: clientData.createdDate,
      modifiedBy: clientData.modifiedBy,
      modifiedDate: clientData.modifiedDate,
    },
  });
};

export const updateCompanyData = async (companyData: Partial<CompanyDetail>): Promise<CompanyDetail> => {
  return await prisma.companyDetail.update({
    where: { id: companyData.id },
    data: {
      id: companyData.id!,
      userId: companyData.userId,
      companyName: companyData.companyName!,
      companyEmail: companyData.companyEmail!,
      industry: companyData.industry,
      companyMobileNumber: companyData.companyMobileNumber,
      address: companyData.address!,
      city: companyData.city!,
      state: companyData.state!,
      planId: companyData.planId,
      isActive: companyData.isActive!,
      paymentDateTime: companyData.paymentDateTime!,
      startDateTime: companyData.startDateTime!,
      paymentMethod: companyData.paymentMethod,
      endDateTime: companyData.endDateTime,
      createdBy: companyData.createdBy!,
      createdDate: companyData.createdDate!,
      modifiedBy: companyData.modifiedBy,
      modifiedDate: companyData.modifiedDate,
    },
  });
};