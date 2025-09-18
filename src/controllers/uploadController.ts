import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/responseHelper';
import { updateUser } from '../repositories/userRepo';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

// Extend Request type to include file property
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

    // Generate the file URL
    const fileUrl = `/uploads/profile-images/${req.file.filename}`;
    
    // Get current user data first
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return errorResponse(res, 'User not found', 404);
    }
    
    // Update user's profile photo URL in database
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
