import { PrismaClient, ClientDetail, Services, User, ClientService, ServiceStatus } from '@prisma/client';
import { GenericRepo } from '../repositories/genericRepo';
import { createClientData, createUser, getRoleId, updateUser, updateClientData as updateClientDataRepo } from '../repositories/userRepo';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const clientRepo = new GenericRepo<ClientDetail, typeof prisma.clientDetail>(
  prisma.clientDetail
);

const servicesRepo = new GenericRepo<Services, typeof prisma.services>(
  prisma.services
);

export interface CreateClientInput {
  name: string;
  clientCompanyName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'InActive' | 'Invited' | 'Deactivate';
  companyId: string;
  services?: string[];
  notes?: string;
  state: string;
  city: string;
  createdBy: string;
}

export interface UpdateClientInput {
  name?: string;
  clientCompanyName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: 'Active' | 'InActive' | 'Invited' | 'Deactivate';
  services?: string[];
  notes?: string;
  state?: string;
  city?: string;
  modifiedBy: string;
}

export const createClient = async (input: CreateClientInput): Promise<{ clientDetail: ClientDetail; user: Omit<User, 'password'> }> => {
  const userId = uuidv4();

  const clientRole = await getRoleId("Client");
  if (!clientRole) {
    throw new Error('Client role not found. Please ensure the Client role exists in the database.');
  }

  const user = await createUser({
    id: userId,
    name: input.name,
    lastName: input.lastName,
    email: input.email,
    mobileNumber: input.phone,
    password: '12345678',
    createdBy: `${input.name} ${input.lastName}`,
    roleId: clientRole.id,
    status: input.status,
    invitationToken: uuidv4(),
    invitationExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  });

  const clientDetail = await createClientData({
    id: uuidv4(),
    userId: userId,
    clientCompanyName: input.clientCompanyName,
    companyId: input.companyId,
    address: input.address,
    city: input.city,
    state: input.state,
    notes: input.notes,
    inviteDate: new Date(),
    joinDate: new Date(),
    createdDate: new Date(),
    createdBy: `${input.name} ${input.lastName}`,
    clientStatus: input.status
  });

  if (input.services && input.services.length > 0) {
    const serviceAssignments = input.services.map(serviceId => ({
      id: uuidv4(),
      clientId: clientDetail.id,
      serviceId: serviceId,
      status: ServiceStatus.Scheduled,
      assignedDate: new Date(),
      createdDate: new Date(),
      createdBy: `${input.name} ${input.lastName}`,
    }));

    await prisma.clientService.createMany({
      data: serviceAssignments,
    });
  }

  const { password, ...userWithoutPassword } = user;

  return {
    clientDetail,
    user: userWithoutPassword
  };
};

export const updateClient = async (
  id: string,
  input: UpdateClientInput
): Promise<object> => {
  const existingClient = await prisma.clientDetail.findFirst({
    where: { id },
    include: { user: true }
  });

  if (!existingClient) {
    throw new Error('Client not found');
  }

  if (input.name || input.lastName || input.email || input.phone) {
    await updateUser({
      id: existingClient.userId!,
      name: input.name || existingClient.user?.name,
      lastName: input.lastName || existingClient.user?.lastName,
      email: input.email || existingClient.user?.email,
      mobileNumber: input.phone || existingClient.user?.mobileNumber,
      modifiedDate: new Date(),
      modifiedBy: input.modifiedBy
    });
  }

  await updateClientDataRepo({
    id: existingClient.id,
    userId: existingClient.userId,
    clientCompanyName: input.clientCompanyName || existingClient.clientCompanyName,
    companyId: existingClient.companyId,
    address: input.address || existingClient.address,
    city: input.city || existingClient.city,
    state: input.state || existingClient.state,
    notes: input.notes || existingClient.notes,
    inviteDate: existingClient.inviteDate || new Date(),
    joinDate: existingClient.joinDate || new Date(),
    createdDate: existingClient.createdDate || new Date(),
    createdBy: existingClient.createdBy || `${input.name} ${input.lastName}`,
    clientStatus: input.status || existingClient.clientStatus
  });


  if (input.services && input.services.length > 0) {
    await prisma.clientService.deleteMany({
      where: { clientId: id },
    });

    const serviceAssignments = input.services.map(serviceId => ({
      id: uuidv4(),
      clientId: id,
      serviceId: serviceId,
      status: ServiceStatus.Scheduled,
      assignedDate: new Date(),
      createdDate: new Date(),
      createdBy: input.modifiedBy,
    }));

    await prisma.clientService.createMany({
      data: serviceAssignments,
    });
  }

  const updatedClientData = await prisma.clientDetail.findFirst({
    where: { id },
    include: {
      user: true,
      CompanyDetail: true,
      clientServices: {
        include: {
          service: true,
        },
      },
    },
  });

  return updatedClientData ?? {};
};

export const getClientById = async (id: string): Promise<ClientDetail | null> => {
  return prisma.clientDetail.findFirst({
    where: { id },
    include: {
      clientServices: {
        include: {
          service: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          mobileNumber: true,
        },
      },
      CompanyDetail: {
        select: {
          id: true,
          companyName: true,
          companyEmail: true,
        },
      },
    },
  });
};

export const getAllClients = async (
  companyId?: string,
  status?: string
): Promise<ClientDetail[]> => {
  const filter: any = {};
  if (companyId) filter.companyId = companyId;
  if (status) filter.clientStatus = status;

  return clientRepo.findAll(filter, { createdDate: 'desc' });
};


export interface CreateServiceInput {
  serviceName: string;
  createdBy: string;
}

export interface UpdateServiceInput {
  serviceName?: string;
  modifiedBy: string;
}

export const createService = async (input: CreateServiceInput): Promise<Services> => {
  return servicesRepo.create({
    ...input,
    createdDate: new Date(),
  });
};

export const updateService = async (
  id: string,
  input: UpdateServiceInput
): Promise<Services> => {
  return servicesRepo.update(
    { id },
    {
      ...input,
      modifiedDate: new Date(),
    }
  );
};

export const getServiceById = async (id: string): Promise<Services | null> => {
  return servicesRepo.findFirst({ id });
};

export const getAllServices = async (): Promise<Services[]> => {
  return servicesRepo.findAll({}, { createdDate: 'desc' });
};

export const deleteService = async (id: string): Promise<Services> => {
  return servicesRepo.delete({ id });
};

export interface AssignServiceInput {
  clientId: string;
  serviceId: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  createdBy: string;
}

export const getClientServices = async (
  clientId: string,
  status?: string
): Promise<ClientService[]> => {
  const filter: any = { clientId };
  if (status) filter.status = status;

  return prisma.clientService.findMany({
    where: filter,
    include: {
      service: true,
    },
    orderBy: { createdDate: 'desc' },
  });
};

export const getServiceClients = async (
  serviceId: string,
  status?: string
): Promise<ClientService[]> => {
  const filter: any = { serviceId };
  if (status) filter.status = status;

  return prisma.clientService.findMany({
    where: filter,
    include: {
      client: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { createdDate: 'desc' },
  });
};

export const getClientStatistics = async (companyId?: string) => {
  const whereClause = companyId ? { companyId } : {};

  const totalClients = await prisma.clientDetail.count({ where: whereClause });
  const activeClients = await prisma.clientDetail.count({
    where: { ...whereClause, clientStatus: 'Active' },
  });
  const totalServiceAssignments = await prisma.clientService.count();
  const activeServiceAssignments = await prisma.clientService.count({
    where: { status: 'InProgress' },
  });

  return {
    totalClients,
    activeClients,
    totalServiceAssignments,
    activeServiceAssignments,
  };
};

export const getServiceStatistics = async () => {
  const totalServices = await prisma.services.count();
  const serviceAssignments = await prisma.clientService.groupBy({
    by: ['serviceId'],
    _count: {
      serviceId: true,
    },
  });

  return {
    totalServices,
    serviceAssignments,
  };
};

export const getClientByCompanyId = async (companyId: string) => {
  return prisma.clientDetail.findMany({
    where: { companyId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          mobileNumber: true,
        },
      },
      CompanyDetail: {
        select: {
          id: true,
          companyName: true,
          companyEmail: true,
        },
      },
      clientServices: {
        include: {
          service: true,
        },
      },
    },
  });
};