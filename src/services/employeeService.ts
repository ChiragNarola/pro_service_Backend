import { PrismaClient, EmployeeDetail, CompanyDetail, User, UserStatus } from '@prisma/client';
import { createEmployeeData, createUser, updateEmployeeData, updateEmployeeStatusData, updateUser, updateUserStatus } from '../repositories/userRepo';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

interface EmployeeDetails {
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
    joinDate: string;
    companyId: string;
    password: string;
    roleId: string;
    salary: string;
    skills: string;
    eid: string;
    managerId: string;
}

interface EmployeeStatusUpdate {
    id: string;
    userId: string;
    employeeStatus: UserStatus,
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
    modifiedDate: Date | string;
    companyId: string;
    password: string;
    roleId: string;
    salary: string;
    skills: string;
    eid: string;
    managerId: string;
    employeeStatus: UserStatus;
    status: UserStatus;
}

export const getEmployees = async (data: { companyId: string }): Promise<EmployeeDetail[]> => {
    const EmployeeData = await prisma.employeeDetail.findMany({
        where: { companyId: data.companyId },
        include: {
            user: {
                include: {
                    role: true,
                }
            },
            employeeRole: true,
            department: true,
            CompanyDetail: true,
        },
    });
    return EmployeeData;
};

export const getCompany = async (data: { companyId: string }): Promise<CompanyDetail | null> => {
    const CompanyData = await prisma.companyDetail.findFirst({
        where: { userId: data.companyId },
        include: {
            subscription: {
                select: {
                    id: true,
                    planName: true
                }
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    lastName: true,
                    email: true,
                    status: true,
                    mobileNumber: true
                }
            }
        },
    });
    return CompanyData;
};

export const createEmployee = async (input: EmployeeDetails): Promise<{ employeeDetail: EmployeeDetail; user: Omit<User, 'password'> }> => {
    const userId = uuidv4();
    const user = await createUser({
        id: userId,
        name: input.name,
        lastName: input.lastName,
        email: input.email,
        mobileNumber: input.mobileNumber,
        password: input.password,
        createdBy: `${input.name} ${input.lastName}`,
        roleId: input.roleId,
        status: 'Active',
    });

    const employeeDetail = await createEmployeeData({
        id: uuidv4(),
        userId: userId,
        companyId: input.companyId,
        address: input.address,
        departmentId: input.departmentId,
        employeeRoleId: input.employeeRoleId,
        city: input.city,
        state: input.state,
        employeeStatus: "Active",
        joinDate: new Date(),
        createdDate: new Date(),
        createdBy: `${input.name} ${input.lastName}`,
        salary: input.salary,
        skills: input.skills,
        managerId: input.managerId,
        eid: input.eid
    });
    const { password, ...userWithoutPassword } = user;

    return {
        employeeDetail,
        user: userWithoutPassword
    };
};

export const updateEmployeeStatus = async (input: EmployeeStatusUpdate): Promise<object> => {
    await updateUserStatus({
        id: input.userId,
        status: input.employeeStatus,
    });
    await updateEmployeeStatusData({
        id: input.id,
        userId: input.userId,
        status: input.employeeStatus,
    });
    const EmployeeData = await prisma.employeeDetail.findFirst({
        where: { id: input.id },
        include: {
            user: true,
            employeeRole: true,
            department: true,
            CompanyDetail: true,
        },
    });
    return EmployeeData ?? {}
};

export const updateEmployee = async (input: EmployeeUpdate): Promise<object> => {
    await updateUser({
        name: input.name,
        lastName: input.lastName,
        email: input.email,
        mobileNumber: input.mobileNumber,
        password: input.password,
        createdBy: `${input.name} ${input.lastName}`,
        roleId: input.roleId,
        id: input.userId,
        status: input.employeeStatus,
        modifiedDate: new Date(),
        modifiedBy: `${input.name} ${input.lastName}`
    });
    await updateEmployeeData({
        id: input.id,
        userId: input.userId,
        employeeStatus: input.employeeStatus,
        companyId: input.companyId,
        address: input.address,
        departmentId: input.departmentId,
        employeeRoleId: input.employeeRoleId,
        city: input.city,
        state: input.state,
        joinDate: new Date(),
        modifiedDate: new Date(),
        modifiedBy: `${input.name} ${input.lastName}`,
        salary: input.salary,
        skills: input.skills,
        managerId: input.managerId,
        eid: input.eid
    });
    const EmployeeData = await prisma.employeeDetail.findFirst({
        where: { id: input.id },
        include: {
            user: true,
            employeeRole: true,
            department: true,
            CompanyDetail: true,
        },
    });
    return EmployeeData ?? {}
};


