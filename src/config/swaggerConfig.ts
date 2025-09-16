import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import dotenv from "dotenv";

dotenv.config();

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "User API",
    version: "1.0.0",
    description: "API documentation for the User service",
  },
  servers: [
    {
      url: process.env.BASE_URL || "http://localhost:4000",
    },
  ],
};

const options: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: [
    "./src/routes/*.ts",
    "./src/controllers/*.ts",
    // optionally add:
    // "./src/models/*.ts",
    // "./src/schemas/*.ts",
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default function setupSwagger(app: Express): void {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}