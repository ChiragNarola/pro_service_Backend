import { PrismaClient, Role, RoleName, EmployeeRole, Department } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all active Roles ordered by name.
 */
export const getAllRoles = async (): Promise<Role[]> => {
    const roleData = await prisma.role.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    });

    return roleData;
};

export const createRole = async (data: { name: RoleName }): Promise<Role> => {
  // Optional: check if role already exists
  const existingRole = await prisma.role.findUnique({
    where: { name: data.name }
  });

  if (existingRole) {
    throw new Error('Role already exists');
  }

  const newRole = await prisma.role.create({
    data: {
      name: data.name,
      isActive: true, // default value, if you track active status
      createdBy: "System"
    }
  });

  return newRole;
};

export const getAllEmployeeRoles = async (): Promise<EmployeeRole[]> => {
    const employeeRoleData = await prisma.employeeRole.findMany({
        orderBy: { name: 'asc' }
    });

    return employeeRoleData;
};

export const createEmployeeRole = async (data: { name: string }): Promise<EmployeeRole> => {
  // Optional: check if role already exists
  const existingRole = await prisma.employeeRole.findUnique({
    where: { name: data.name }
  });

  if (existingRole) {
    throw new Error('Employee Role already exists');
  }

  const newEmployeeRole = await prisma.employeeRole.create({
    data: {
      name: data.name
    }
  });

  return newEmployeeRole;
};

export const getAllEmployeeDepartment = async (): Promise<Department[]> => {
    const employeeDepartmentData = await prisma.department.findMany({
        orderBy: { name: 'asc' }
    });

    return employeeDepartmentData;
};

export const createEmployeeDepartment = async (data: { name: string }): Promise<Department> => {
  // Optional: check if role already exists
  const existingDepartment = await prisma.department.findUnique({
    where: { name: data.name }
  });

  if (existingDepartment) {
    throw new Error('Department already exists');
  }

  const newEmployeeDepartment = await prisma.department.create({
    data: {
      name: data.name
    }
  });

  return newEmployeeDepartment;
};
