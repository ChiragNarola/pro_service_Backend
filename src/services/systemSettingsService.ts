import { PrismaClient, PaymentGateway } from '@prisma/client';

const prisma = new PrismaClient();

export type SystemSettingsInput = {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    paymentGateway?: PaymentGateway | string;
};

export const getSystemSettingsByUserId = async () => {
    const settings = await prisma.systemSettings.findMany({});
    return settings;
};

export const upsertSystemSettings = async (
    userId: string,
    body: SystemSettingsInput,
    actorId: string,
) => {
    // Normalize paymentGateway if string
    const normalized: any = { ...body };
    if (normalized.paymentGateway && typeof normalized.paymentGateway === 'string') {
        normalized.paymentGateway = normalized.paymentGateway as PaymentGateway;
    }

    const existing = await prisma.systemSettings.findFirst({ where: { userId: actorId } });

    if (!existing) {
        return prisma.systemSettings.create({
            data: {
                userId,
                emailNotifications: normalized.emailNotifications ?? true,
                smsNotifications: normalized.smsNotifications ?? false,
                paymentGateway: normalized.paymentGateway ?? 'Stripe',
                createdBy: actorId || 'system',
            },
        });
    }

    return prisma.systemSettings.update({
        where: { id: existing.id },
        data: {
            emailNotifications: normalized.emailNotifications ?? existing.emailNotifications,
            smsNotifications: normalized.smsNotifications ?? existing.smsNotifications,
            paymentGateway: normalized.paymentGateway ?? existing.paymentGateway,
            modifiedBy: actorId || 'system',
            modifiedDate: new Date(),
        },
    });
};


