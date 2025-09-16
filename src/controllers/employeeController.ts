import { Request, Response } from "express";
// import { getAllSubscription } from "../services/subscriptionService";
import * as employeeService from "../services/employeeService";
import { successResponse, errorResponse } from "../utils/responseHelper";

export const fetchEmployee = async (req: Request, res: Response): Promise<Response> => {
  try {

    const { companyId } = req.body;

    const employees = await employeeService.getEmployees({companyId});
    return res.json(employees);
  } catch (err: any) {
    return errorResponse(res, "Server error", 500);
  }
};

export const createEmployee = async (req: Request, res: Response): Promise<Response> => {
  try {
    const employees = await employeeService.createEmployee(req.body);
    return res.json(employees);
  } catch (err: any) {
    return errorResponse(res, "Server error", 500);
  }
};

export const fetchCompany = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.body;
    const company = await employeeService.getCompany({companyId});
    return res.json(company);
  } catch (err: any) {
    return errorResponse(res, "Server error", 500);
  }
};

export const updateEmployeeStatusById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const employee = await employeeService.updateEmployeeStatus(req.body);
    return successResponse(res, employee, 201);
  } catch (err: any) {
    return errorResponse(res, "Server error", 500);
  }
};

export const updateEmployeeById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const employee = await employeeService.updateEmployee(req.body);
    return successResponse(res, employee, 201);
  } catch (err: any) {
    return errorResponse(res, "Server error", 500);
  }
};

