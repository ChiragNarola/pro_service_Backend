import { PrismaClient, Subscription, SubscriptionType, PlanName, Module } from '@prisma/client';
import { Response } from 'express';
import { errorResponse } from '../utils/responseHelper';

const prisma = new PrismaClient();

/**
 * Get all active countries ordered by name.
 */
export const getAllSubscription = async (): Promise<Subscription[]> => {
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
    },
  });

  return subscriptionData;
};

export type CreateSubscriptionInput = {
  planName: PlanName;
  duration: SubscriptionType;
  rate: number;
  isPopular?: boolean;
  createdBy: string;
};

export type UpdateSubscriptionInput = Partial<CreateSubscriptionInput> & { modifiedBy: string };

export const createSubscription = async (input: CreateSubscriptionInput) => {
  const created = await prisma.subscription.create({
    data: {
      planName: input.planName,
      duration: input.duration,
      rate: input.rate,
      isPopular: input.isPopular ?? false,
      createdBy: input.createdBy,
    },
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
  return updated;
};

export const deleteSubscription = async (id: string) => {
  const deleted = await prisma.subscription.delete({ where: { id } });
  return deleted;
};

// Modules
export const getAllModules = async (): Promise<Module[]> => {
  const modules = await prisma.module.findMany({
    // where: { isActive: true },
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
    },
  });
  return subscription;
};

export const deleteModule = async (id: string, createdBy: string) => {
  const deleted = await prisma.module.update({ where: { id }, data: { 
    isActive: false,
    isDeleted: true, 
    deletedBy: createdBy, 
    deletedDate: new Date() } });
  return deleted;
};