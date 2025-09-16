import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateToken = (user: any): string => {
    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
        throw new Error('JWT_SECRET or JWT_EXPIRES_IN is not defined in environment');
    }

    // Ensure user has required properties
    if (!user || !user.id) {
        throw new Error('Invalid user data for token generation');
    }

    const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role?.name || user.role || 'User' // Handle both role object and direct role string
    };

    const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN,
        }
    );

    return token;
};