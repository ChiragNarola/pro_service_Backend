import { PrismaClient, PaymentGateway } from '@prisma/client';

const prisma = new PrismaClient();

export type SystemSettingsInput = {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
    weeklyReports?: boolean;
    paymentGateway?: PaymentGateway | string;
    primaryColor?: string;
    secondaryColor?: string;
    brandingLogo?: string;
    supportEmail?: string;
    supportAutoAssign?: boolean;
    supportSlaHours?: number;
    supportAutoReply?: boolean;
    billingCurrency?: string;
    billingInvoicePrefix?: string;
    billingTaxRate?: number;
    stripePubKey?: string;
    stripeSecretKey?: string;
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
    const normalized: any = { ...body };
    if (normalized.paymentGateway && typeof normalized.paymentGateway === 'string') {
        normalized.paymentGateway = normalized.paymentGateway as PaymentGateway;
    }

    const existing = await prisma.systemSettings.findFirst({ where: { userId } });

    if (!existing) {
        return prisma.systemSettings.create({
            data: {
                userId,
                emailNotifications: normalized.emailNotifications ?? true,
                smsNotifications: normalized.smsNotifications ?? false,
                pushNotifications: normalized.pushNotifications ?? false,
                weeklyReports: normalized.weeklyReports ?? false,
                paymentGateway: normalized.paymentGateway ?? 'Stripe',
                primaryColor: normalized.primaryColor,
                secondaryColor: normalized.secondaryColor,
                brandingLogo: normalized.brandingLogo,
                supportEmail: normalized.supportEmail,
                supportAutoAssign: normalized.supportAutoAssign,
                supportSlaHours: normalized.supportSlaHours,
                supportAutoReply: normalized.supportAutoReply,
                billingCurrency: normalized.billingCurrency,
                billingInvoicePrefix: normalized.billingInvoicePrefix,
                billingTaxRate: normalized.billingTaxRate,
                stripePubKey: normalized.stripePubKey,
                stripeSecretKey: normalized.stripeSecretKey,
                createdBy: actorId || 'system',
            },
        });
    }

    return prisma.systemSettings.update({
        where: { id: existing.id },
        data: {
            emailNotifications: normalized.emailNotifications ?? existing.emailNotifications,
            smsNotifications: normalized.smsNotifications ?? existing.smsNotifications,
            pushNotifications: normalized.pushNotifications ?? existing.pushNotifications,
            weeklyReports: normalized.weeklyReports ?? existing.weeklyReports,
            paymentGateway: normalized.paymentGateway ?? existing.paymentGateway,
            primaryColor: normalized.primaryColor ?? existing.primaryColor,
            secondaryColor: normalized.secondaryColor ?? existing.secondaryColor,
            brandingLogo: normalized.brandingLogo ?? existing.brandingLogo,
            supportEmail: normalized.supportEmail ?? existing.supportEmail,
            supportAutoAssign: normalized.supportAutoAssign ?? existing.supportAutoAssign,
            supportSlaHours: normalized.supportSlaHours ?? existing.supportSlaHours,
            supportAutoReply: normalized.supportAutoReply ?? existing.supportAutoReply,
            billingCurrency: normalized.billingCurrency ?? existing.billingCurrency,
            billingInvoicePrefix: normalized.billingInvoicePrefix ?? existing.billingInvoicePrefix,
            billingTaxRate: normalized.billingTaxRate ?? existing.billingTaxRate,
            stripePubKey: normalized.stripePubKey ?? existing.stripePubKey,
            stripeSecretKey: normalized.stripeSecretKey ?? existing.stripeSecretKey,
            modifiedBy: actorId || 'system',
            modifiedDate: new Date(),
        },
    });
};