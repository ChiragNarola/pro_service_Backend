import { Request, Response } from "express";
import { loginUser, signupUser, changePassword, forgotPassword, resetPassword } from "../services/authService";
import { successResponse, errorResponse } from "../utils/responseHelper";
import { sendEmail } from "../utils/mailer";
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;
  try {
    const result = await loginUser(email, password);

    const backendUser = result.user as any;

    const formattedUser = {
      id: backendUser.id,
      name: backendUser.name,
      email: backendUser.email,
      role: backendUser.role,
      organization: backendUser.organization,
      mobileNumber: backendUser.mobileNumber,
      profession: backendUser.profession,
      qualification: backendUser.qualification,
      profilePhotoURL: backendUser.profilePhotoURL,
      eSignURL: backendUser.eSignURL,
    };

    return successResponse(res, {
      user: formattedUser,
      token: result.token,
    });
  } catch (err: any) {
    return errorResponse(res, err.message, 401);
  }
};

export const companySignup = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await signupUser(req.body);

    // Create and store invitation token for the newly created user (7 days validity)
    const prisma = new PrismaClient();
    const signupInvitationToken = uuidv4();
    try {
      if ((result as any)?.user?.id) {
        await prisma.user.update({
          where: { id: (result as any).user.id },
          data: {
            invitationToken: signupInvitationToken,
            invitationExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            modifiedDate: new Date(),
          },
        });
      }
    } catch (e) {
      console.error('Failed to store invitation token for signup user:', (e as any)?.message || e);
    }

    // Fire confirmation email (best effort; do not block response on failure)
    const recipientEmails: string[] = [];
    if (req.body?.email) recipientEmails.push(req.body.email);
    if (req.body?.companyEmail && req.body.companyEmail !== req.body.email) {
      recipientEmails.push(req.body.companyEmail);
    }

    if (recipientEmails.length > 0) {
      const companyName = req.body.companyName || result.company?.companyName || "your company";
      const userName = `${req.body.name || ''} ${req.body.lastName || ''}`.trim() || 'there';
      const appName = process.env.APP_NAME || 'Pro Service';
      const appUrl = process.env.APP_URL || 'http://localhost:8080';
      const backendPublicUrl = process.env.BACKEND_PUBLIC_URL || appUrl;
      const invitePageUrl = `${backendPublicUrl.replace(/\/$/, '')}/invite.html?token=${encodeURIComponent(signupInvitationToken)}`;
      sendEmail({
        to: recipientEmails,
        subject: `${appName}: Welcome, ${userName}!`,
        html: `
                  <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111">
                    <h2 style="margin:0 0 12px">Welcome to ${appName}</h2>
                    <p>Hi ${userName},</p>
                    <p>Your company <strong>${companyName}</strong> has been registered successfully.</p>
                    <p style="margin-top:12px;color:#555">Manage your invitation:</p>
                    <p><a href="${invitePageUrl}" target="_blank" rel="noopener">Open Invitation Page</a></p>
                    <p style="margin-top:24px;color:#555">If you didn’t create this account, please ignore this email.</p>
                  </div>
                `,
        text: `Welcome to ${appName}. ${companyName} has been registered successfully. Visit ${appUrl}`,
      }).catch((e) => {
        console.error('Failed to send signup email:', e?.message || e);
      });
    }

    return successResponse(res, { user: result });
  } catch (err: any) {
    return errorResponse(res, err.message, 401);
  }
};

// Change Password Controller
export const changePasswordController = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return errorResponse(res, 'Current password, new password, and confirm password are required', 400);
    }

    if (newPassword !== confirmPassword) {
      return errorResponse(res, 'New password and confirm password do not match', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'New password must be at least 6 characters long', 400);
    }

    const result = await changePassword(userId, currentPassword, newPassword);
    successResponse(res, result, 200);
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
};

// Forgot Password Controller
export const forgotPasswordController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 'Email is required', 400);
    }

    const result = await forgotPassword(email);
    return successResponse(res, result);
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
};

// Reset Password Controller
export const resetPasswordController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return errorResponse(res, 'Token, password, and confirm password are required', 400);
    }

    if (password !== confirmPassword) {
      return errorResponse(res, 'Password and confirm password do not match', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters long', 400);
    }

    const result = await resetPassword(token, password);
    return successResponse(res, result);
  } catch (error: any) {
    return errorResponse(res, error.message, 400);
  }
};