import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/responseHelper';
import { updateUser } from '../repositories/userRepo';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

interface UploadRequest extends Request {
  file?: any;
  user?: any;
}

export const uploadProfileImageController = async (req: UploadRequest, res: Response): Promise<Response> => {
  try {
    console.log('Upload request received:', {
      hasFile: !!req.file,
      hasUser: !!req.user,
      userId: req.user?.id,
      fileInfo: req.file ? {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null
    });

    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const fileUrl = `/uploads/profile-images/${req.file.filename}`;

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return errorResponse(res, 'User not found', 404);
    }

    const updatedUser = await updateUser({
      id: userId,
      name: currentUser.name,
      lastName: currentUser.lastName,
      email: currentUser.email,
      mobileNumber: currentUser.mobileNumber,
      profilePhotoURL: fileUrl,
      createdBy: currentUser.createdBy,
      createdDate: currentUser.createdDate,
      modifiedDate: new Date(),
      modifiedBy: userId,
      roleId: currentUser.roleId,
      status: currentUser.status,
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Profile image uploaded successfully',
        profilePhotoURL: fileUrl,
        user: updatedUser
      }
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload profile image'
    });
  }
};

export default uploadProfileImageController;

export const uploadSignatureController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { imageBase64 } = req.body as { imageBase64?: string };
    if (!imageBase64 || !imageBase64.startsWith('data:image')) {
      return errorResponse(res, 'imageBase64 is required (data URL)', 400);
    }

    // Extract mime and data
    const matches = imageBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!matches) {
      return errorResponse(res, 'Invalid image data URL', 400);
    }
    const mime = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');

    // Decide extension
    const ext = mime.split('/')[1] || 'png';
    const fs = await import('fs');
    const path = await import('path');
    const dir = path.join(process.cwd(), 'uploads', 'signatures');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filename = `signature-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, buffer);

    const fileUrl = `/uploads/signatures/${filename}`;

    // Persist signature URL to the current user's record, when available
    try {
      const userId = id;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { signatureURL: fileUrl, modifiedBy: userId, modifiedDate: new Date() } as any,
        });
      }
    } catch (dbErr) {
      console.error('Failed to save signature URL to user:', dbErr);
      // Do not fail the upload solely due to persistence issue; still return the URL
    }

    return successResponse(res, { signatureUrl: fileUrl }, 200);
  } catch (e: any) {
    return errorResponse(res, e?.message || 'Failed to upload signature', 500);
  }
};