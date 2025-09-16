import express, { Router } from 'express';
import authenticate from '../logs/middlewares/authMiddleware';
import validate from '../logs/middlewares/validateRequest';
import {
  createClientController,
  updateClientController,
  getClientByIdController,
  getAllClientsController,
  createServiceController,
  updateServiceController,
  getServiceByIdController,
  deleteServiceController,
  getServicesController,
  getClientServicesController,
  getServiceClientsController,
  getClientStatisticsController,
  getServiceStatisticsController,
  getClientByCompanyIdController
} from '../controllers/clientController';
import {
  createClientSchema,
  updateClientSchema,
  createServiceSchema,
  updateServiceSchema,
} from '../dtos/client.dto';

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Client Management
 *     description: Client management operations
 *   - name: Services
 *     description: Service management operations
 *   - name: Service Assignments
 *     description: Service assignment operations
 *   - name: Statistics
 *     description: Dashboard statistics
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       required:
 *         - clientName
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the client
 *         userId:
 *           type: string
 *           format: uuid
 *           description: Associated user ID
 *         companyId:
 *           type: string
 *           format: uuid
 *           description: Associated company ID
 *         clientName:
 *           type: string
 *           maxLength: 100
 *           description: Name of the client
 *         clientEmail:
 *           type: string
 *           format: email
 *           description: Email address of the client
 *         clientPhone:
 *           type: string
 *           maxLength: 20
 *           description: Phone number of the client
 *         clientStatus:
 *           type: string
 *           enum: [Active, InActive, Invited, Deactivate]
 *           description: Current status of the client
 *         address:
 *           type: string
 *           maxLength: 255
 *           description: Address of the client
 *         city:
 *           type: string
 *           maxLength: 255
 *           description: City of the client
 *         state:
 *           type: string
 *           maxLength: 255
 *           description: State of the client
 *         notes:
 *           type: string
 *           maxLength: 255
 *           description: Additional notes about the client
 *         inviteDate:
 *           type: string
 *           format: date-time
 *           description: Date when client was invited
 *         joinDate:
 *           type: string
 *           format: date-time
 *           description: Date when client joined
 *         createdBy:
 *           type: string
 *           description: User who created the client
 *         createdDate:
 *           type: string
 *           format: date-time
 *           description: Date when client was created
 *         modifiedBy:
 *           type: string
 *           description: User who last modified the client
 *         modifiedDate:
 *           type: string
 *           format: date-time
 *           description: Date when client was last modified
 *     
 *     Service:
 *       type: object
 *       required:
 *         - serviceName
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the service
 *         serviceName:
 *           type: string
 *           maxLength: 100
 *           description: Name of the service
 *         createdBy:
 *           type: string
 *           description: User who created the service
 *         createdDate:
 *           type: string
 *           format: date-time
 *           description: Date when service was created
 *         modifiedBy:
 *           type: string
 *           description: User who last modified the service
 *         modifiedDate:
 *           type: string
 *           format: date-time
 *           description: Date when service was last modified
 *     
 *     ClientService:
 *       type: object
 *       required:
 *         - clientId
 *         - serviceId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the service assignment
 *         clientId:
 *           type: string
 *           format: uuid
 *           description: ID of the client
 *         serviceId:
 *           type: string
 *           format: uuid
 *           description: ID of the service
 *         status:
 *           type: string
 *           enum: [Scheduled, InProgress, Completed, Cancelled, OnHold, Pending]
 *           description: Current status of the service assignment
 *         assignedDate:
 *           type: string
 *           format: date-time
 *           description: Date when service was assigned
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Date when service started
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Date when service ended
 *         notes:
 *           type: string
 *           maxLength: 1000
 *           description: Additional notes about the service assignment
 *         createdBy:
 *           type: string
 *           description: User who created the assignment
 *         createdDate:
 *           type: string
 *           format: date-time
 *           description: Date when assignment was created
 *         modifiedBy:
 *           type: string
 *           description: User who last modified the assignment
 *         modifiedDate:
 *           type: string
 *           format: date-time
 *           description: Date when assignment was last modified
 *     
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           description: HTTP status code
 *         message:
 *           type: string
 *           description: Error message
 *         error:
 *           type: string
 *           description: Detailed error information
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token for authentication
 */

/**
 * @swagger
 * /client/services:
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     description: Retrieve all available services
 *     responses:
 *       200:
 *         description: List of services retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Services retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Service'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/services", getServicesController);

/**
 * @swagger
 * /client/services/{id}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Services]
 *     description: Retrieve a specific service by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Service retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/services/:id", getServiceByIdController);

/**
 * @swagger
 * /client/clients:
 *   post:
 *     summary: Create a new client
 *     tags: [Client Management]
 *     security:
 *       - bearerAuth: []
 *     description: Create a new client with the provided information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       201:
 *         description: Client created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Client created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   
 *   get:
 *     summary: Get all clients
 *     tags: [Client Management]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve all clients with optional filtering
 *     parameters:
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by company ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, InActive, Invited, Deactivate]
 *         description: Filter by client status
 *     responses:
 *       200:
 *         description: Clients retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Clients retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Client'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/clients", authenticate, validate(createClientSchema), createClientController);
router.get("/clients", authenticate, getAllClientsController);
router.get("/:companyId/clients", authenticate, getClientByCompanyIdController);

/**
 * @swagger
 * /client/clients/{id}:
 *   get:
 *     summary: Get client by ID
 *     tags: [Client Management]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve a specific client by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Client retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       404:
 *         description: Client not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   
 *   put:
 *     summary: Update client
 *     tags: [Client Management]
 *     security:
 *       - bearerAuth: []
 *     description: Update an existing client's information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       200:
 *         description: Client updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Client updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   
 *   delete:
 *     summary: Delete client
 *     tags: [Client Management]
 *     security:
 *       - bearerAuth: []
 *     description: Delete a client by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Client deleted successfully
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/clients/:id", authenticate, getClientByIdController);
router.put("/clients/:id", authenticate, validate(updateClientSchema), updateClientController);

/**
 * @swagger
 * /client/services:
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     description: Create a new service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       201:
 *         description: Service created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Service created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /client/services/{id}:
 *   put:
 *     summary: Update service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     description: Update an existing service
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       200:
 *         description: Service updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Service updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   
 *   delete:
 *     summary: Delete service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     description: Delete a service by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Service deleted successfully
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/services", authenticate, validate(createServiceSchema), createServiceController);
router.put("/services/:id", authenticate, validate(updateServiceSchema), updateServiceController);
router.delete("/services/:id", authenticate, deleteServiceController);

/**
 * @swagger
 * /client/clients/{clientId}/services:
 *   get:
 *     summary: Get services for a client
 *     tags: [Service Assignments]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve all services assigned to a specific client
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Scheduled, InProgress, Completed, Cancelled, OnHold, Pending]
 *         description: Filter by service status
 *     responses:
 *       200:
 *         description: Client services retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Client services retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ClientService'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /client/services/{serviceId}/clients:
 *   get:
 *     summary: Get clients for a service
 *     tags: [Service Assignments]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve all clients assigned to a specific service
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Service ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Scheduled, InProgress, Completed, Cancelled, OnHold, Pending]
 *         description: Filter by service status
 *     responses:
 *       200:
 *         description: Service clients retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Service clients retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ClientService'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/clients/:clientId/services", authenticate, getClientServicesController);
router.get("/services/:serviceId/clients", authenticate, getServiceClientsController);

/**
 * @swagger
 * /client/statistics/clients:
 *   get:
 *     summary: Get client statistics
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve client-related statistics
 *     parameters:
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by company ID
 *     responses:
 *       200:
 *         description: Client statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Client statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalClients:
 *                       type: integer
 *                       description: Total number of clients
 *                     activeClients:
 *                       type: integer
 *                       description: Number of active clients
 *                     totalServiceAssignments:
 *                       type: integer
 *                       description: Total number of service assignments
 *                     activeServiceAssignments:
 *                       type: integer
 *                       description: Number of active service assignments
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /client/statistics/services:
 *   get:
 *     summary: Get service statistics
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve service-related statistics
 *     responses:
 *       200:
 *         description: Service statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Service statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalServices:
 *                       type: integer
 *                       description: Total number of services
 *                     serviceAssignments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           serviceId:
 *                             type: string
 *                             format: uuid
 *                           _count:
 *                             type: object
 *                             properties:
 *                               serviceId:
 *                                 type: integer
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/statistics/clients", authenticate, getClientStatisticsController);
router.get("/statistics/services", authenticate, getServiceStatisticsController);

module.exports = router; 