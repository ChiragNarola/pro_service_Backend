import bcrypt from 'bcrypt';
import crypto from 'crypto';

const saltRounds = 10;

export const hashPassword = async (plainPassword: string): Promise<string> => {
    return bcrypt.hash(plainPassword, saltRounds);
};

export const genrateToken = () => {
    return crypto.randomBytes(32).toString('hex');
}