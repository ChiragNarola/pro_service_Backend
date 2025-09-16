import { PrismaClient, Subscription } from '@prisma/client';

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