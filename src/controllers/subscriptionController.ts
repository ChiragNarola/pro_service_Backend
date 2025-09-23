import { Request, Response } from "express";
import * as subscriptionService from "../services/subscriptionService";
import { successResponse, errorResponse } from "../utils/responseHelper";

export const fetchSubscription = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const subscription = await subscriptionService.getAllSubscription();
    return successResponse(res, subscription, 200);
  } catch (err: any) {
    return errorResponse(res, "Server error", 500);
  }
};

export const createSubscription = async (req: Request, res: Response): Promise<Response> => {
  try {
    req.body.createdBy = req.user.id;
    const subscription = await subscriptionService.createSubscription(req.body);
    return successResponse(res, subscription, 201);
  } catch (err: any) {
    return errorResponse(res, "Server error", 500);
  }
};

export const updateSubscription = async (req: Request, res: Response): Promise<Response> => {
  try {
    req.body.modifiedBy = req.user.id;
    const subscription = await subscriptionService.updateSubscription(req.params.id, req.body);
    return successResponse(res, subscription, 200);
  } catch (err: any) {
    return errorResponse(res, "Server error", 500);
  }
};

export const fetchSubscriptionById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const subscription = await subscriptionService.getSubscriptionById(req.params.id);
    return successResponse(res, subscription, 200);
  } catch (err: any) {
    return errorResponse(res, "Server error", 500);
  }
};

export const deleteSubscription = async (req: Request, res: Response): Promise<Response> => {
  try {
    const subscription = await subscriptionService.deleteSubscription(req.params.id, req.user.id);
    return successResponse(res, subscription, 200);
  } catch (err: any) {
    return errorResponse(res, "Server error", 500);
  }
};

export const fetchModules = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const modules = await subscriptionService.getAllModules();
    return successResponse(res, modules, 200);
  } catch (err: any) {
    return errorResponse(res, "Server error", 500);
  }
};

export const createModule = async (req: Request, res: Response): Promise<Response> => {
  try {
    req.body.createdBy = req.user.id;
    const module = await subscriptionService.createModule(req.body);
    return successResponse(res, module, 201);
  } catch (err: any) {
    return errorResponse(res, "Server error", 500);
  }
};

export const deleteModule = async (req: Request, res: Response): Promise<Response> => {
  try {

    const createdBy = req.user.id;
    const module = await subscriptionService.deleteModule(req.params.id, createdBy);
    return successResponse(res, module, 200);
  } catch (err: any) {
    return errorResponse(res, "Server error", 500);
  }
};

export const updateModule = async (req: Request, res: Response): Promise<Response> => {
  try {
    req.body.modifiedBy = req.user.id;

    const existingModule = await subscriptionService.getModuleById(req.params.id);

    if (!existingModule || existingModule?.createdBy === "system") {
      return errorResponse(res, 'Module not found or cannot be updated', 500);
    }
    const module = await subscriptionService.updateModule(req.params.id, req.body);
    return successResponse(res, module, 200);
  } catch (err: any) {
    return errorResponse(res, "Server error", 500);
  }
};

export const getModuleById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const module = await subscriptionService.getModuleById(req.params.id);
    return successResponse(res, module, 200);
  } catch (err: any) {
    return errorResponse(res, "Server error", 500);
  }
};
