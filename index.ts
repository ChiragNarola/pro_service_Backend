import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";
import setupSwagger from "./src/config/swaggerConfig";
import cookieParser from "cookie-parser";
import cors from 'cors';
import { verifyEmailTransport } from './src/utils/mailer';

// const userRoutes = require("./src/routes/user");
const authRoutes = require("./src/routes/auth");
const invitationRoutes = require("./src/routes/invitationRoutes");
const subscriptionRoutes = require("./src/routes/subscriptionRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const masterRoutes = require("./src/routes/masterRoutes");
const employeeRoutes = require("./src/routes/employeeRoutes");
const userRoutes = require("./src/routes/userRoutes");
const clientRoutes = require("./src/routes/clientRoutes");
const companyRoutes = require("./src/routes/companyRoutes");

const { DBconnection } = require("./src/config/DBconnection");
// const errorHandler = require("./src/middlewares/errorHandler");
// const responseHandler = require("./src/middlewares/responseHandler");

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
}));

const port = process.env.PORT || 4000;
// app.use("/favicon.ico", express.static(path.join(__dirname, "public", "favicon.ico")));
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'public')));

DBconnection();

// Middleware
// JSON parser must come after raw webhook path is registered, so we mount payment routes first
app.use('/payments', paymentRoutes);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Swagger Docs
setupSwagger(app);

// Routes
app.use("/auth", authRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/employee", employeeRoutes);
app.use("/user", userRoutes);
app.use("/master", masterRoutes);
app.use("/client", clientRoutes);
app.use("/company", companyRoutes);
// app.use("/permission", permissionRoutes);

// Test Route
app.get("/", (req: Request, res: Response) => {
  res.send("Server is up and running!");
});

// Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}`);
  // Verify SMTP on boot for easier diagnostics (only if configured)
  const hasSmtpConfig = !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
  if (hasSmtpConfig) {
    verifyEmailTransport()
      .then(() => console.log('SMTP transport verified successfully.'))
      .catch((e) => console.error('SMTP verification failed:', e?.message || e));
  } else {
    console.warn('SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS to enable email.');
  }
});

// app.use(responseHandler);
// app.use(errorHandler);