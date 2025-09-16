import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

// Define type for the createUser data input
interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  createdBy: string;
  roleId: string;
}

// Database connection function
export async function DBconnection(): Promise<void> {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL Database!");
  } catch (error) {
    console.error("Error during DB connection:", error);
    process.exit(1);
  }
}

export { prisma };