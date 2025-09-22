import { authenticateUser, createCompany, createUser, getRoleId } from '../repositories/userRepo';
import { generateToken } from '../utils/generateToken';
import { sendEmail } from '../utils/mailer';
import { User, CompanyDetail } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: Omit<User, 'password'>; token: string }> => {
  const user = await authenticateUser(email, password);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  if ((user as any)?.status && (user as any).status !== 'Active') {
    throw new Error('Your account is not active. Please contact support.');
  }

  const token = generateToken(user);
  return { user, token };
};

interface SignupInput {
  companyName: string;
  userId: string,
  industry?: string;
  companyEmail: string;
  companyMobileNumber: string;
  address: string;
  city: string;
  state: string;
  name: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  planId: string;
  password: string;
}

export const signupUser = async (input: SignupInput): Promise<{ company: CompanyDetail, user: Omit<User, 'password'> }> => {
  const userId = uuidv4();

  const getRoleIdDetails = await getRoleId("Company")
  const user = await createUser({
    id: userId,
    name: input.name,
    lastName: input.lastName,
    email: input.email,
    mobileNumber: input.mobileNumber,
    password: input.password,
    createdBy: `${input.name} ${input.lastName}`,
    roleId: getRoleIdDetails.id,
    status: 'Invited',
  });

  const company = await createCompany({
    id: uuidv4(),
    userId: userId,
    companyName: input.companyName,
    industry: input.industry,
    companyEmail: input.companyEmail,
    companyMobileNumber: input.companyMobileNumber,
    address: input.address,
    city: input.city,
    state: input.state,
    planId: input.planId,
    isActive: false,
    createdBy: `${input.name} ${input.lastName}`,
  });
  const { password, ...userWithoutPassword } = user;

  return {
    company,
    user: userWithoutPassword
  };
};

export const changePassword = async (userId: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, password: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword, modifiedDate: new Date() },
    });

    return { success: true, message: 'Password changed successfully', };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to change password');
  }
};

export const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return { success: true, message: 'If the email exists, a password reset link has been sent.' };
    }

    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiresAt: resetExpires,
        modifiedDate: new Date(),
      },
    });

    const appName = process.env.APP_NAME || 'Pro Service';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080/';
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

    await sendEmail({
      to: [user.email],
      subject: `${appName}: Password Reset Request`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111">
          <h2 style="margin:0 0 12px">Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>You requested a password reset for your ${appName} account.</p>
          <p style="margin-top:12px;color:#555">Click the link below to reset your password:</p>
          <p><a href="${resetUrl}" target="_blank" rel="noopener" style="background:#007bff;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block">Reset Password</a></p>
          <p style="margin-top:24px;color:#555;font-size:14px">This link will expire in 1 hour for security reasons.</p>
          <p style="margin-top:12px;color:#555;font-size:14px">If you didn't request this password reset, please ignore this email.</p>
        </div>
      `,
      text: `Password Reset Request for ${appName}. Click here to reset: ${resetUrl}`,
    });

    return { success: true, message: 'If the email exists, a password reset link has been sent.' };
  } catch (error: any) {
    console.error('Forgot password error:', error);
    throw new Error('Failed to process password reset request');
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        modifiedDate: new Date(),
      },
    });

    return { success: true, message: 'Password reset successfully' };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to reset password');
  }
};