import { Request, Response } from 'express';
import { getCompanyStatistics, updateCompany, getAllCompanies, UpdateCompanyInput, getCompanyByCompanyId } from '../services/companyService';
import { successResponse, successResponseMessage, errorResponse } from '../utils/responseHelper';

// Company Statistics Controller
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

// Update Company Controller
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


// Get All Companies Controller
export const getAllCompaniesController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.body.page as string) || 1;
    const limit = parseInt(req.body.limit as string) || 10;
    const search = req.body.search as string;

    // Validate pagination parameters
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

// Get Company by Company ID Controller
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