import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  createdBy: string;
  roleId: string;
}

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