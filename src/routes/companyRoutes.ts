import express, { Router } from 'express';
import authenticate from '../logs/middlewares/authMiddleware';
import { getCompanyStatisticsController, updateCompanyController, getCompanyByIdController, getAllCompaniesController, getCompanyByCompanyIdController } from '../controllers/companyController';

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Company Management
 *     description: Company management operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CompanyStatistics:
 *       type: object
 *       properties:
 *         totalEmployees:
 *           type: integer
 *           description: Total number of employees in the company
 *         activeEmployees:
 *           type: integer
 *           description: Number of active employees in the company
 *         totalClients:
 *           type: integer
 *           description: Total number of clients in the company
 *         activeClients:
 *           type: integer
 *           description: Number of active clients in the company
 *         totalServiceAssignments:
 *           type: integer
 *           description: Total number of service assignments
 *         activeServiceAssignments:
 *           type: integer
 *           description: Number of active service assignments
 *         companyId:
 *           type: string
 *           format: uuid
 *           description: Company ID
 *     UpdateCompanyRequest:
 *       type: object
 *       properties:
 *         companyName:
 *           type: string
 *           maxLength: 100
 *           description: Company name
 *         companyEmail:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           description: Company email address
 *         industry:
 *           type: string
 *           maxLength: 255
 *           description: Industry type
 *         companyMobileNumber:
 *           type: string
 *           maxLength: 20
 *           description: Company mobile number
 *         address:
 *           type: string
 *           maxLength: 255
 *           description: Company address
 *         city:
 *           type: string
 *           maxLength: 255
 *           description: City
 *         state:
 *           type: string
 *           maxLength: 255
 *           description: State
 *         planId:
 *           type: string
 *           format: uuid
 *           description: Subscription plan ID
 *         isActive:
 *           type: boolean
 *           description: Company active status
 *         paymentMethod:
 *           type: string
 *           maxLength: 20
 *           description: Payment method
 *     CompanyDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         companyName:
 *           type: string
 *         companyEmail:
 *           type: string
 *         industry:
 *           type: string
 *           nullable: true
 *         companyMobileNumber:
 *           type: string
 *           nullable: true
 *         address:
 *           type: string
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         planId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         isActive:
 *           type: boolean
 *         paymentDateTime:
 *           type: string
 *           format: date-time
 *         startDateTime:
 *           type: string
 *           format: date-time
 *         paymentMethod:
 *           type: string
 *           nullable: true
 *         endDateTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdBy:
 *           type: string
 *         createdDate:
 *           type: string
 *           format: date-time
 *         modifiedBy:
 *           type: string
 *           nullable: true
 *         modifiedDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 */

/**
* @swagger
* /company:
*   get:
*     summary: Get all companies
*     tags: [Company Management]
*     security:
*       - bearerAuth: []
*     description: Retrieve a paginated list of all companies with optional search functionality
*     parameters:
*       - in: query
*         name: page
*         schema:
*           type: integer
*           minimum: 1
*           default: 1
*         description: Page number for pagination
*       - in: query
*         name: limit
*         schema:
*           type: integer
*           minimum: 1
*           maximum: 100
*           default: 10
*         description: Number of companies per page
*       - in: query
*         name: search
*         schema:
*           type: string
*         description: Search term to filter companies by name, email, industry, city, or state
*     responses:
*       200:
*         description: Companies retrieved successfully
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 isSuccess:
*                   type: boolean
*                   example: true
*                 data:
*                   type: object
*                   properties:
*                     companies:
*                       type: array
*                       items:
*                         $ref: '#/components/schemas/CompanyDetail'
*                     pagination:
*                       type: object
*                       properties:
*                         page:
*                           type: integer
*                           example: 1
*                         limit:
*                           type: integer
*                           example: 10
*                         totalCount:
*                           type: integer
*                           example: 25
*                         totalPages:
*                           type: integer
*                           example: 3
*                         hasNextPage:
*                           type: boolean
*                           example: true
*                         hasPrevPage:
*                           type: boolean
*                           example: false
*       400:
*         description: Bad request - Invalid pagination parameters
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 isSuccess:
*                   type: boolean
*                   example: false
*                 message:
*                   type: string
*                   example: Page number must be greater than 0
*       500:
*         description: Internal server error
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 isSuccess:
*                   type: boolean
*                   example: false
*                 message:
*                   type: string
*                   example: Error retrieving companies
*/

/**
 * @swagger
 * /company/{companyId}/statistics:
 *   get:
 *     summary: Get company statistics
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve company statistics including employee and client counts
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CompanyStatistics'
 *       400:
 *         description: Bad request - Company ID is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Company ID is required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error retrieving company statistics
 */

/**
 * @swagger
 * /company/{companyId}:
 *   get:
 *     summary: Get company by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve company details by company ID
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CompanyDetail'
 *       400:
 *         description: Bad request - Company ID is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Company ID is required
 *       404:
 *         description: Company not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Company not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error retrieving company
 *   put:
 *     summary: Update company
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     description: Update company details
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCompanyRequest'
 *     responses:
 *       200:
 *         description: Company updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CompanyDetail'
 *       400:
 *         description: Bad request - Company ID is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Company ID is required
 *       404:
 *         description: Company not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Company not found
 *       409:
 *         description: Company email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Company email already exists
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error updating company
 */

// Company Statistics Route
router.get("/:companyId/statistics", authenticate, getCompanyStatisticsController);

// Get Company by ID Route
router.get("/:companyId", authenticate, getCompanyByIdController);

// Update Company Route
router.put("/:companyId", authenticate, updateCompanyController);

// Get All Companies Route
router.post("/", authenticate, getAllCompaniesController);

// Get Company by Company ID Route
router.get("/:companyId", authenticate, getCompanyByCompanyIdController);

module.exports = router;
