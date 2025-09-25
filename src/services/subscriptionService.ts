import { PrismaClient, Subscription, SubscriptionType, Module, CompanyPlanDetail } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all active countries ordered by name.
 */
export const getAllSubscription = async (): Promise<(Subscription & { purchaseCount: number })[]> => {
  const subscriptionData = await prisma.subscription.findMany({
    where: { isActive: true },
    orderBy: { planName: 'asc' },
    include: {
      modulePlanMappings: {
        where: {
          isActive: true,
          module: {
            isActive: true,
          },
        },
        include: {
          module: true,
        },
      },
      _count: {
        select: { companyPlanDetails: true },
      },
    },
  });

  // Map to expose a simple purchaseCount field
  return subscriptionData.map((s: any) => ({
    ...s,
    purchaseCount: s?._count?.companyPlanDetails ?? 0,
  }));
};

export type CreateSubscriptionInput = {
  planName: string;
  duration: SubscriptionType;
  rate: number;
  isPopular?: boolean;
  createdBy: string;
  features: Array<{ id: string; name: string }>;
  employeeCount: string;
};

export type UpdateSubscriptionInput = Partial<CreateSubscriptionInput> & { modifiedBy: string };

export const createSubscription = async (input: CreateSubscriptionInput) => {
  const created = await prisma.subscription.create({
    data: {
      planName: input.planName,
      duration: input.duration,
      rate: input.rate,
      isPopular: input.isPopular ?? false,
      createdBy: input.createdBy
    },
  });

  const modulePlanMappings = input.features.map((feature) => ({
    moduleId: feature.id,
    isActive: true,
    subscriptionId: created.id,
    maxEmployees: feature.name === "Employee" ? input.employeeCount : null,
    createdBy: input.createdBy
  }));

  await prisma.modulePlanMapping.createMany({
    data: modulePlanMappings,
  });

  return created;
};

export const updateSubscription = async (id: string, input: UpdateSubscriptionInput) => {
  const updated = await prisma.subscription.update({
    where: { id },
    data: {
      planName: input.planName,
      duration: input.duration,
      rate: input.rate,
      isPopular: input.isPopular,
      modifiedBy: input.modifiedBy,
      modifiedDate: new Date(),
    },
  });

  const modulePlanMappings = input.features.map((feature) => ({
    moduleId: feature.id,
    isActive: true,
    subscriptionId: updated.id,
    maxEmployees: feature.name === "Employee" ? input.employeeCount : null,
    createdBy: input.modifiedBy
  }));

  const NewModulePlanMappings = await prisma.modulePlanMapping.findMany({
    where: { subscriptionId: updated.id },
  });

  const modulePlanMappingsToDelete = NewModulePlanMappings.filter((mapping) => !modulePlanMappings.some((m) => m.moduleId === mapping.moduleId));

  await prisma.modulePlanMapping.deleteMany({
    where: { id: { in: modulePlanMappingsToDelete.map((m) => m.id) } },
  });

  const modulePlanMappingsToCreate = modulePlanMappings.filter((mapping) => !NewModulePlanMappings.some((m) => m.moduleId === mapping.moduleId));

  await prisma.modulePlanMapping.createMany({
    data: modulePlanMappingsToCreate,
  });

  return updated;
};

export const deleteSubscription = async (id: string, deletedBy: string) => {

  const deleted = await prisma.subscription.update({
    where: { id },
    data: {
      isActive: false,
      isDeleted: true,
      deletedBy: deletedBy,
      deletedDate: new Date()
    }
  });

  const modulePlanMappingsToDelete = await prisma.modulePlanMapping.findMany({
    where: { subscriptionId: id },
  });

  await prisma.modulePlanMapping.updateMany({
    where: { id: { in: modulePlanMappingsToDelete.map((m) => m.id) } },
    data: {
      isActive: false,
      isDeleted: true,
      deletedBy: deletedBy,
      deletedDate: new Date()
    }
  });
  return deleted;
};

export const getAllModules = async (): Promise<Module[]> => {
  const modules = await prisma.module.findMany({
    orderBy: { createdDate: 'desc' }
  });
  return modules;
};

export type CreateModuleInput = {
  name: string;
  isActive?: boolean;
  createdBy: string;
};

export type UpdateModuleInput = Partial<CreateModuleInput> & { modifiedBy: string };

export const createModule = async (input: CreateModuleInput) => {
  const existingModule = await prisma.module.findFirst({
    where: { name: input.name }
  });

  if (existingModule) {
    throw new Error('Module already exists');
  }

  const created = await prisma.module.create({
    data: {
      name: input.name,
      isActive: input.isActive ?? true,
      createdBy: input.createdBy,
      createdDate: new Date(),
    },
  });
  return created;
};

export const updateModule = async (id: string, input: UpdateModuleInput) => {
  const updated = await prisma.module.update({
    where: { id },
    data: {
      name: input.name,
      isActive: input.isActive,
      modifiedBy: input.modifiedBy,
      modifiedDate: new Date(),
    },
  });
  return updated;
};

export const getModuleById = async (id: string) => {
  const module = await prisma.module.findFirst({
    where: { id }
  });
  return module;
};

export const getSubscriptionById = async (id: string) => {
  const subscription = await prisma.subscription.findFirst({
    where: { id },
    include: {
      modulePlanMappings: {
        include: {
          module: true,
        },
      },
      _count: { select: { companyPlanDetails: true } },
    },
  });
  if (!subscription) return subscription;
  return { ...(subscription as any), purchaseCount: (subscription as any)?._count?.companyPlanDetails ?? 0 };
};

export const deleteModule = async (id: string, createdBy: string) => {
  const deleted = await prisma.module.update({
    where: { id }, data: {
      isActive: false,
      isDeleted: true,
      deletedBy: createdBy,
      deletedDate: new Date()
    }
  });
  return deleted;
};

export const getCompanyPlanDetails = async (): Promise<CompanyPlanDetail[]> => {

  const items = await prisma.companyPlanDetail.findMany({
    orderBy: { createdDate: 'desc' },
    include: {
      company: {
        select: {
          id: true,
          companyName: true,
        }
      },
      subscription: true,
      user: {
        select: {
          id: true,
          name: true,
        }
      },
    },
  });
  return items;
};