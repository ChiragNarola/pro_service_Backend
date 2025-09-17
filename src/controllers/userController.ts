import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/responseHelper';

const prisma = new PrismaClient();

export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return errorResponse(res, 'User ID is required', 400);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        mobileNumber: true,
        status: true,
        createdDate: true,
        role: { select: { id: true, name: true } },
      },
    });

    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, user, 200);
  } catch (e: any) {
    return errorResponse(res, e?.message || 'Failed to fetch user', 500);
  }
};


