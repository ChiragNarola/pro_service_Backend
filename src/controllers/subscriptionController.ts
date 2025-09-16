import { Request, Response } from "express";
// import { getAllSubscription } from "../services/subscriptionService";
import * as subscriptionService from "../services/subscriptionService";
import { successResponse, errorResponse } from "../utils/responseHelper";

export const fetchSubscription = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const subscription = await subscriptionService.getAllSubscription();
    return res.json(subscription);
  } catch (err: any) {
    return errorResponse(res, "Server error", 500);
  }
};