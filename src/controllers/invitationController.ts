import { Request, Response } from 'express';
import { PrismaClient, UserStatus, SubscriptionType } from '@prisma/client';
import { sendEmail } from '../utils/mailer';
import { successResponse, errorResponse } from '../utils/responseHelper';

const prisma = new PrismaClient();

async function findUserByInvitationToken(token: string) {
  return prisma.user.findFirst({ where: { invitationToken: token } });
}

export const acceptInvitationController = async (req: Request, res: Response) => {
  try {
    const token = String(req.query.token || '');
    if (!token) return errorResponse(res, 'Token is required', 400);

    const user = await findUserByInvitationToken(token);
    if (!user) return errorResponse(res, 'Invalid or expired token', 400);

    if (user.invitationExpiresAt && user.invitationExpiresAt < new Date()) {
      return errorResponse(res, 'Invitation link has expired', 400);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'Active' as UserStatus,
        invitationToken: null,
        invitationExpiresAt: null,
        modifiedDate: new Date(),
      },
      select: { id: true, email: true, status: true },
    });

    // Also activate the company linked to this user (if any) - update one only
    try {
      const company = await prisma.companyDetail.findFirst({
        where: { userId: user.id },
        select: { id: true, planId: true, createdBy: true },
      });
      if (company) {
        await prisma.companyDetail.update({
          where: { id: company.id },
          data: { isActive: true, modifiedDate: new Date() },
        });

        // Payment/Plan flow: ensure a CompanyPlanDetail exists and is active
        try {
          const existingActivePlan = await prisma.companyPlanDetail.findFirst({
            where: { companyId: company.id, isActive: true },
            select: { id: true },
          });

          if (!existingActivePlan && company.planId) {
            const plan = await prisma.subscription.findUnique({
              where: { id: company.planId },
              select: { id: true, duration: true },
            });

            const startDate = new Date();
            let endDate: Date | null = null;
            if (plan?.duration === SubscriptionType.Monthly) {
              endDate = new Date(startDate);
              endDate.setMonth(endDate.getMonth() + 1);
            } else if (plan?.duration === SubscriptionType.Annual) {
              endDate = new Date(startDate);
              endDate.setFullYear(endDate.getFullYear() + 1);
            }

            await prisma.companyPlanDetail.create({
              data: {
                companyId: company.id,
                userId: user.id,
                planId: plan?.id || company.planId,
                startDate,
                endDate,
                isActive: true,
                createdBy: user.name || user.email || company.createdBy || 'system',
              },
            });
          }
        } catch (e) {
          console.error('Failed to create company plan detail on invitation accept:', (e as any)?.message || e);
        }
      }
    } catch (e) {
      console.error('Failed to activate company on invitation accept:', (e as any)?.message || e);
    }
    // Email flow removed as per requirement

    return successResponse(res, { message: 'Invitation accepted', user: updated }, 200);
  } catch (e: any) {
    return errorResponse(res, e?.message || 'Server error', 500);
  }
};

export const rejectInvitationController = async (req: Request, res: Response) => {
  try {
    const token = String(req.query.token || '');
    if (!token) return errorResponse(res, 'Token is required', 400);

    const user = await findUserByInvitationToken(token);
    if (!user) return errorResponse(res, 'Invalid or expired token', 400);

    if (user.invitationExpiresAt && user.invitationExpiresAt < new Date()) {
      return errorResponse(res, 'Invitation link has expired', 400);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'InActive' as UserStatus,
        invitationToken: null,
        invitationExpiresAt: null,
        modifiedDate: new Date(),
      },
      select: { id: true, email: true, status: true },
    });

    return successResponse(res, { message: 'Invitation rejected', user: updated }, 200);
  } catch (e: any) {
    return errorResponse(res, e?.message || 'Server error', 500);
  }
};
