import { Request, Response } from 'express';
import { getCompanyStatistics, updateCompany, getAllCompanies, UpdateCompanyInput, getCompanyByCompanyId, changeCompanyStatus, getCompanyByUserID, getLeavesByCompanyId, addLeave, updateLeave, deleteLeave, updateCompanyLogo, updateCompanyColors, addDepartment, updateDepartment, deleteDepartment, getAllDepartments, getDepartmentById, addPosition, updatePosition, deletePosition, getPositionByCompanyId, getPositionById, createCompanyNotificationRule, updateCompanyNotificationRule, deleteCompanyNotificationRule, getCompanyNotificationRuleById, listCompanyNotificationRules, createInvoiceTemplate, updateInvoiceTemplate, deleteInvoiceTemplate, getInvoiceTemplateById, listInvoiceTemplates, createInventorySupplier, updateInventorySupplier, deleteInventorySupplier, getInventorySupplierById, listInventorySuppliers, createInventoryCategory, updateInventoryCategory, deleteInventoryCategory, getInventoryCategoryById, listInventoryCategories } from '../services/companyService';
import { successResponse, errorResponse } from '../utils/responseHelper';

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
    const { leaveId } = req.params;
    const leave = await updateLeave(leaveId, req.body, req.user?.id || 'system');
    successResponse(res, leave, 200);
  } catch (error: any) {
    errorResponse(res, 'Error updating leave', 500);
  }
};

export const deleteLeaveController = async (req: Request, res: Response) => {
  try {
    const { leaveId } = req.params;
    const leave = await deleteLeave(leaveId, req.user?.id || 'system');
    successResponse(res, leave, 200);
  } catch (error: any) {
    errorResponse(res, 'Error deleting leave', 500);
  }
};

export const uploadCompanyLogoController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const file = (req as any).file;
    if (!file) {
      return errorResponse(res, 'Logo file is required', 400);
    }
    const logoUrl = `/${file.path.replace(/\\/g, '/')}`;
    const updated = await updateCompanyLogo(companyId, logoUrl, req.user?.id || 'system');
    successResponse(res, updated, 200);
  } catch (error: any) {
    errorResponse(res, 'Error uploading company logo', 500);
  }
};

export const updateCompanyColorsController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const colors = await updateCompanyColors(companyId, req.body, req.user?.id || 'system');
    successResponse(res, colors, 200);
  } catch (error: any) {
    errorResponse(res, 'Error updating company colors', 500);
  }
};

//Department Controller
export const addDepartmentController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const department = await addDepartment(companyId, req.body, req.user?.id || 'system');
    successResponse(res, department, 200);
  } catch (error: any) {
    errorResponse(res, 'Error adding department', 500);
  }
};

export const updateDepartmentController = async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.params;
    const department = await updateDepartment(departmentId, req.body, req.user?.id || 'system');
    successResponse(res, department, 200);
  } catch (error: any) {
    errorResponse(res, 'Error updating department', 500);
  }
};

export const deleteDepartmentController = async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.params;
    const department = await deleteDepartment(departmentId, req.user?.id || 'system');
    successResponse(res, department, 200);
  } catch (error: any) {
    errorResponse(res, 'Error deleting department', 500);
  }
};

export const getAllDepartmentsController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '10');
    const result = await getAllDepartments(companyId, page, limit);
    successResponse(res, result, 200);
  } catch (error: any) {
    errorResponse(res, 'Error retrieving all departments', 500);
  }
};

export const getDepartmentByIdController = async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.params;
    const department = await getDepartmentById(departmentId);
  } catch (error: any) {
    errorResponse(res, 'Error retrieving department by ID', 500);
  }
};

//Position Controller
export const addPositionController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const position = await addPosition(companyId, req.body, req.user?.id || 'system');
    successResponse(res, position, 200);
  } catch (error: any) {
    errorResponse(res, 'Error adding position', 500);
  }
};

export const updatePositionController = async (req: Request, res: Response) => {
  try {
    const { positionId } = req.params;
    const position = await updatePosition(positionId, req.body, req.user?.id || 'system');
    successResponse(res, position, 200);
  } catch (error: any) {
    errorResponse(res, 'Error updating position', 500);
  }
};

export const deletePositionController = async (req: Request, res: Response) => {
  try {
    const { positionId } = req.params;
    const position = await deletePosition(positionId, req.user?.id || 'system');
    successResponse(res, position, 200);
  } catch (error: any) {
    errorResponse(res, 'Error deleting position', 500);
  }
};

export const getPositionByCompanyIdController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (pageNum < 1) {
      return errorResponse(res, 'Page number must be greater than 0', 400);
    }

    if (limitNum < 1 || limitNum > 100) {
      return errorResponse(res, 'Limit must be between 1 and 100', 400);
    }

    const result = await getPositionByCompanyId(companyId, pageNum, limitNum);
    successResponse(res, result, 200);
  } catch (error: any) {
    errorResponse(res, 'Error retrieving positions by company ID', 500);
  }
};

export const getPositionByIdController = async (req: Request, res: Response) => {
  try {
    const { positionId } = req.params;
    const position = await getPositionById(positionId);
    successResponse(res, position, 200);
  } catch (error: any) {
    errorResponse(res, 'Error retrieving position by ID', 500);
  }
};

// ================= Notification Rule Controllers =================
export const listNotificationRulesController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const items = await listCompanyNotificationRules(companyId);
    successResponse(res, items, 200);
  } catch (error: any) {
    errorResponse(res, 'Error listing notification rules', 500);
  }
};

export const getNotificationRuleByIdController = async (req: Request, res: Response) => {
  try {
    const { ruleId } = req.params;
    const item = await getCompanyNotificationRuleById(ruleId);
    successResponse(res, item, 200);
  } catch (error: any) {
    errorResponse(res, 'Error retrieving notification rule', 500);
  }
};

export const addNotificationRuleController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const created = await createCompanyNotificationRule(companyId, req.body, req.user?.id || 'system');
    successResponse(res, created, 200);
  } catch (error: any) {
    errorResponse(res, 'Error creating notification rule', 500);
  }
};

export const updateNotificationRuleController = async (req: Request, res: Response) => {
  try {
    const { ruleId } = req.params;
    const updated = await updateCompanyNotificationRule(ruleId, req.body, req.user?.id || 'system');
    successResponse(res, updated, 200);
  } catch (error: any) {
    errorResponse(res, 'Error updating notification rule', 500);
  }
};

export const deleteNotificationRuleController = async (req: Request, res: Response) => {
  try {
    const { ruleId } = req.params;
    const deleted = await deleteCompanyNotificationRule(ruleId, req.user?.id || 'system');
    successResponse(res, deleted, 200);
  } catch (error: any) {
    errorResponse(res, 'Error deleting notification rule', 500);
  }
};

// ================= Invoice Template Controllers =================
export const listInvoiceTemplatesController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const result = await listInvoiceTemplates(companyId, page, limit);
    successResponse(res, result, 200);
  } catch (error: any) {
    errorResponse(res, 'Error listing invoice templates', 500);
  }
};

export const getInvoiceTemplateByIdController = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const item = await getInvoiceTemplateById(templateId);
    successResponse(res, item, 200);
  } catch (error: any) {
    errorResponse(res, 'Error retrieving invoice template', 500);
  }
};

export const addInvoiceTemplateController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const created = await createInvoiceTemplate(companyId, req.body, req.user?.id || 'system');
    successResponse(res, created, 200);
  } catch (error: any) {
    errorResponse(res, 'Error creating invoice template', 500);
  }
};

export const updateInvoiceTemplateController = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const updated = await updateInvoiceTemplate(templateId, req.body, req.user?.id || 'system');
    successResponse(res, updated, 200);
  } catch (error: any) {
    errorResponse(res, 'Error updating invoice template', 500);
  }
};

export const deleteInvoiceTemplateController = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const deleted = await deleteInvoiceTemplate(templateId, req.user?.id || 'system');
    successResponse(res, deleted, 200);
  } catch (error: any) {
    errorResponse(res, 'Error deleting invoice template', 500);
  }
};

// ================= Inventory Supplier Controllers =================
export const listInventorySuppliersController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const result = await listInventorySuppliers(companyId, page, limit);
    successResponse(res, result, 200);
  } catch (error: any) {
    errorResponse(res, 'Error listing inventory suppliers', 500);
  }
};

export const getInventorySupplierByIdController = async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;
    const item = await getInventorySupplierById(supplierId);
    successResponse(res, item, 200);
  } catch (error: any) {
    errorResponse(res, 'Error retrieving inventory supplier', 500);
  }
};

export const addInventorySupplierController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const created = await createInventorySupplier(companyId, req.body, req.user?.id || 'system');
    successResponse(res, created, 200);
  } catch (error: any) {
    errorResponse(res, 'Error creating inventory supplier', 500);
  }
};

export const updateInventorySupplierController = async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;
    const updated = await updateInventorySupplier(supplierId, req.body, req.user?.id || 'system');
    console.log("🚀 ~ updateInventorySupplierController ~ updated:", updated)
    successResponse(res, updated, 200);
  } catch (error: any) {
    console.log("🚀 ~ updateInventorySupplierController ~ error:", error)
    errorResponse(res, 'Error updating inventory supplier', 500);
  }
};

export const deleteInventorySupplierController = async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;
    const deleted = await deleteInventorySupplier(supplierId, req.user?.id || 'system');
    successResponse(res, deleted, 200);
  } catch (error: any) {
    errorResponse(res, 'Error deleting inventory supplier', 500);
  }
};

// ================= Inventory Categories Controllers =================
export const listInventoryCategoriesController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const result = await listInventoryCategories(companyId, page, limit);
    successResponse(res, result, 200);
  } catch (error: any) {
    errorResponse(res, 'Error listing inventory categories', 500);
  }
};

export const getInventoryCategoryByIdController = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const item = await getInventoryCategoryById(categoryId);
    successResponse(res, item, 200);
  } catch (error: any) {
    errorResponse(res, 'Error retrieving inventory category', 500);
  }
};

export const addInventoryCategoryController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const created = await createInventoryCategory(companyId, req.body, req.user?.id || 'system');
    successResponse(res, created, 200);
  } catch (error: any) {
    errorResponse(res, 'Error creating inventory category', 500);
  }
};

export const updateInventoryCategoryController = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const updated = await updateInventoryCategory(categoryId, req.body, req.user?.id || 'system');
    successResponse(res, updated, 200);
  } catch (error: any) {
    errorResponse(res, 'Error updating inventory category', 500);
  }
};

export const deleteInventoryCategoryController = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const deleted = await deleteInventoryCategory(categoryId, req.user?.id || 'system');
    successResponse(res, deleted, 200);
  } catch (error: any) {
    errorResponse(res, 'Error deleting inventory category', 500);
  }
};