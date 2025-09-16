import { Request, Response } from "express";
// import { getAllSubscription } from "../services/subscriptionService";
import * as masterService from "../services/masterService";
import { successResponse, errorResponse } from "../utils/responseHelper";

export const fetchRole = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const roles = await masterService.getAllRoles();
    return res.json(roles);
  } catch (err: any) {
    return errorResponse(res, "Server error", 500);
  }
};

export const createRole = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name } = req.body;

    if (!name) {
      return errorResponse(res, 'Role name is required', 400);
    }

    const newRole = await masterService.createRole({ name });

    return successResponse(res, newRole, 201);
  } catch (err: any) {
    return errorResponse(res, 'Server error', 500);
  }
};

export const fetchEmployeeRole = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const roles = await masterService.getAllEmployeeRoles();
    return res.json(roles);
  } catch (err: any) {
    return errorResponse(res, "Server error", 500);
  }
};

export const createEmployeeRole = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name } = req.body;

    if (!name) {
      return errorResponse(res, 'Role name is required', 400);
    }

    const newEmployeeRole = await masterService.createEmployeeRole({ name });

    return successResponse(res, newEmployeeRole, 201);
  } catch (err: any) {
    return errorResponse(res, 'Server error', 500);
  }
};

export const fetchEmployeeDepartment = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const roles = await masterService.getAllEmployeeDepartment();
    return res.json(roles);
  } catch (err: any) {
    return errorResponse(res, "Server error", 500);
  }
};

export const createEmployeeDepartment = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name } = req.body;

    if (!name) {
      return errorResponse(res, 'Department name is required', 400);
    }

    const newEmployeeDepartment = await masterService.createEmployeeDepartment({ name });

    return successResponse(res, newEmployeeDepartment, 201);
  } catch (err: any) {
    return errorResponse(res, 'Server error', 500);
  }
};