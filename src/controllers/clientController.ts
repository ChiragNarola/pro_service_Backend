import { Request, Response } from 'express';
import {
  createClient,
  updateClient,
  getClientById,
  getAllClients,
  createService,
  updateService,
  getServiceById,
  getAllServices,
  deleteService,
  getClientServices,
  getServiceClients,
  getClientStatistics,
  getServiceStatistics,
  CreateClientInput,
  UpdateClientInput,
  CreateServiceInput,
  UpdateServiceInput,
  getClientByCompanyId,
} from '../services/clientService';
import { successResponseMessage, errorResponse, successResponse } from '../utils/responseHelper';
import { sendEmail } from '../utils/mailer';

// Get All Services Controller
export const getServicesController = async (req: Request, res: Response) => {
  try {
    const services = await getAllServices();
    successResponseMessage(res, 'Services retrieved successfully', services, 200);
  } catch (error: any) {
    errorResponse(res, 'Error retrieving services', 500);
  }
};

// Client Management Controllers
export const createClientController = async (req: Request, res: Response) => {
  try {
    const input: CreateClientInput = {
      ...req.body,
      createdBy: req.user?.id || 'system',
    };

    const client = await createClient(input);

    // Best-effort: send invitation email if newly created as Invited
    try {
      const user = (client as any)?.user;
      if (req.body?.status === 'Invited' && user?.invitationToken && user?.email) {
        const baseUrl = process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 4000}`;
        const inviteLink = `${baseUrl}/invite.html?token=${encodeURIComponent(user.invitationToken)}`;
        const acceptLink = `${inviteLink}&action=accept`;
        const rejectLink = `${inviteLink}&action=reject`;
        await sendEmail({
          to: user.email,
          subject: 'You are invited to Pro Service Control',
          html: `
            <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111">
              <h2 style="margin:0 0 12px">You're invited</h2>
              <p>Hello ${user.name || ''},</p>
              <p>You have been invited to join Pro Service Control. Please confirm below.</p>
              <p>
                <a href="${acceptLink}" style="display:inline-block;background:#16a34a;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;margin-right:8px">Accept Invitation</a>
                <a href="${rejectLink}" style="display:inline-block;background:#ef4444;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none">Reject Invitation</a>
              </p>
              <p style="margin-top:8px"><a href="${inviteLink}" style="color:#2563eb;text-decoration:underline">Open invitation page</a></p>
              <p style="color:#555">If you did not expect this, you can ignore this email.</p>
            </div>
          `,
          text: `You're invited to Pro Service Control. Accept: ${acceptLink}  |  Reject: ${rejectLink}  |  Page: ${inviteLink}`,
        });
      }
    } catch (e) {
      console.error('Invitation email failed:', (e as any)?.message || e);
    }

    successResponseMessage(res, 'Client created successfully', client, 201);
  } catch (error: any) {
    errorResponse(res, 'Error creating client', 500);
  }
};

export const updateClientController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const input: UpdateClientInput = {
      ...req.body,
      modifiedBy: req.user?.id || 'system',
    };

    const client = await updateClient(id, input);
    successResponse(res, client, 200);
  } catch (error: any) {
    errorResponse(res, 'Error updating client', 500);
  }
};

export const getClientByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = await getClientById(id);

    if (!client) {
      return errorResponse(res, 'Client not found', 404);
    }

    successResponse(res, client, 200);
  } catch (error: any) {
    errorResponse(res, 'Error retrieving client', 500);
  }
};

export const getAllClientsController = async (req: Request, res: Response) => {
  try {
    const { companyId, status } = req.query;
    const clients = await getAllClients(
      companyId as string,
      status as string
    );

    successResponse(res, clients, 200);
  } catch (error: any) {
    errorResponse(res, 'Error retrieving clients', 500);
  }
};

// Services Management Controllers
export const createServiceController = async (req: Request, res: Response) => {
  try {
    const input: CreateServiceInput = {
      ...req.body,
      createdBy: req.user?.id || 'system',
    };

    const service = await createService(input);
    successResponse(res, service, 201);
  } catch (error: any) {
    errorResponse(res, 'Error creating service', 500);
  }
};

export const updateServiceController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const input: UpdateServiceInput = {
      ...req.body,
      modifiedBy: req.user?.id || 'system',
    };

    const service = await updateService(id, input);
    successResponse(res, service, 200);
  } catch (error: any) {
    errorResponse(res, 'Error updating service', 500);
  }
};

export const getServiceByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = await getServiceById(id);

    if (!service) {
      return errorResponse(res, 'Service not found', 404);
    }

    successResponse(res, service, 200);
  } catch (error: any) {
    errorResponse(res, 'Error retrieving service', 500);
  }
};

export const getAllServicesController = async (req: Request, res: Response) => {
  try {
    const services = await getAllServices();
    successResponse(res, services, 200);
  } catch (error: any) {
    errorResponse(res, 'Error retrieving services', 500);
  }
};

export const deleteServiceController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = await deleteService(id);
    successResponse(res, service, 200);
  } catch (error: any) {
    errorResponse(res, 'Error deleting service', 500);
  }
};

export const getClientServicesController = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { status } = req.query;
    const services = await getClientServices(clientId, status as any);

    successResponse(res, services, 200);
  } catch (error: any) {
    errorResponse(res, 'Error retrieving client services', 500);
  }
};

export const getServiceClientsController = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    const { status } = req.query;
    const clients = await getServiceClients(serviceId, status as any);

    successResponse(res, clients, 200);
  } catch (error: any) {
    errorResponse(res, 'Error retrieving service clients', 500);
  }
};

// Dashboard/Statistics Controllers
export const getClientStatisticsController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.query;
    const statistics = await getClientStatistics(companyId as string);

    successResponse(res, statistics, 200);
  } catch (error: any) {
    errorResponse(res, 'Error retrieving client statistics', 500);
  }
};

export const getServiceStatisticsController = async (req: Request, res: Response) => {
  try {
    const statistics = await getServiceStatistics();
    successResponse(res, statistics, 200);
  } catch (error: any) {
    errorResponse(res, 'Error retrieving service statistics', 500);
  }
};

export const getClientByCompanyIdController = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const clients = await getClientByCompanyId(companyId as string);
    successResponse(res, clients, 200);
  } catch (error: any) {
    errorResponse(res, 'Error retrieving clients', 500);
  }
};