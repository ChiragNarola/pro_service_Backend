import { Request, Response } from 'express';
import { getCompanyStatistics, updateCompany, getAllCompanies, UpdateCompanyInput, getCompanyByCompanyId, changeCompanyStatus, getCompanyByUserID, getLeavesByCompanyId, addLeave, updateLeave, deleteLeave } from '../services/companyService';
import { successResponse, successResponseMessage, errorResponse } from '../utils/responseHelper';

export const getCompanyStatisticsController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return errorResponse(res, 'Company ID is required', 400);
    }

    const statistics = await getCompanyStatistics(companyId);
    successResponse(res, statistics, 200);
  } catch (error: any) {
    errorResponse(res, 'Error retrieving company statistics', 500);
  }
};

export const updateCompanyController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const input: UpdateCompanyInput = {
      ...req.body,
      modifiedBy: req.user?.id || 'system',
    };

    const company = await updateCompany(companyId, input);
    successResponse(res, company, 200);
  } catch (error: any) {
    errorResponse(res, 'Error updating company', 500);
  }
};

export const getAllCompaniesController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.body.page as string) || 1;
    const limit = parseInt(req.body.limit as string) || 10;
    const search = req.body.search as string;

    if (page < 1) {
      return errorResponse(res, 'Page number must be greater than 0', 400);
    }
    if (limit < 1 || limit > 100) {
      return errorResponse(res, 'Limit must be between 1 and 100', 400);
    }

    const result = await getAllCompanies(page, limit, search);
    successResponse(res, result, 200);
  } catch (error: any) {
    errorResponse(res, 'Error retrieving companies', 500);
  }
};

export const getCompanyByCompanyIdController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const company = await getCompanyByCompanyId(companyId);
    successResponse(res, company, 200);
  } catch (error: any) {
    if (error.message === 'Company not found') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, 'Error retrieving company', 500);
  }
};

export const changeCompanyStatusController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { isActive } = req.body as { isActive: boolean };
    if (typeof isActive !== 'boolean') {
      return errorResponse(res, 'isActive (boolean) is required', 400);
    }
    const updated = await changeCompanyStatus(companyId, isActive, req.user?.id || 'system');
    successResponse(res, updated, 200);
  } catch (error: any) {
    if (error.message === 'Company not found') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, 'Error changing company status', 500);
  }
};

export const getCompanyByUserIDController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return errorResponse(res, 'User ID is required', 400);
    }

    const company = await getCompanyByUserID(userId);
    successResponse(res, company, 200);
  } catch (error: any) {
    if (error.message === 'Company not found for this user') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, 'Error retrieving company by user ID', 500);
  }
};

export const getLeavesByCompanyIdController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { year } = req.params;
    const leaves = await getLeavesByCompanyId(companyId, year);
    successResponse(res, leaves, 200);
  } catch (error: any) {
    errorResponse(res, 'Error retrieving leaves by company ID', 500);
  }
};

export const addLeaveController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const leave = await addLeave(companyId, req.body, req.user?.id || 'system');
    successResponse(res, leave, 200);
  } catch (error: any) {
    errorResponse(res, 'Error adding leave', 500);
  }
};

export const updateLeaveController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const leave = await updateLeave(companyId, req.body, req.user?.id || 'system');
    successResponse(res, leave, 200);
  } catch (error: any) {
    errorResponse(res, 'Error updating leave', 500);
  }
};

export const deleteLeaveController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const leave = await deleteLeave(companyId, req.body, req.user?.id || 'system');
    successResponse(res, leave, 200);
  } catch (error: any) {
    errorResponse(res, 'Error deleting leave', 500);
  }
};