import express, { Router } from 'express';

const router: Router = express.Router();
import authenticate from '../logs/middlewares/authMiddleware';
import validate from '../logs/middlewares/validateRequest';
import { employeeSchema, fetchCompanySchema, updateEmployeeSchema } from '../dtos/employee.dto';
import { updateEmployeeStatusById } from '../controllers/employeeController';

const { fetchEmployee, createEmployee, fetchCompany, updateEmployeeById } = require('../controllers/employeeController');

/**
 * @swagger
 * tags:
 *   name: Employee
 *   description: Employee APIs
 */

/**
 * @swagger
 * /Employee:
 *   post:
 *     summary: Get list of active Employee
 *     tags: [Employee]
 *     responses:
 *       200:
 *         description: List of Employee
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   code:
 *                     type: string
 */
router.post("/fetchEmployee", authenticate, fetchEmployee);

/**
 * @swagger
 * /EmployeeCreate:
 *   post:
 *     summary: Create Employee
 *     tags: [Employee]
 *     responses:
 *       200:
 *         description: Create Employee
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   code:
 *                     type: string
 */
router.post("/createEmployee", authenticate, validate(employeeSchema), createEmployee);

/**
 * @swagger
 * /EmployeeCreate:
 *   post:
 *     summary: Create Employee
 *     tags: [Employee]
 *     responses:
 *       200:
 *         description: Create Employee
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   code:
 *                     type: string
 */
router.post("/fetchCompanyById", authenticate, validate(fetchCompanySchema), fetchCompany);

/**
 * @swagger
 * /EmployeeUpdate:
 *   patch:
 *     summary: Update Employee
 *     tags: [Employee]
 *     responses:
 *       200:
 *         description: Update Employee
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   code:
 *                     type: string
 */
router.patch("/updateEmployeeStatusById", authenticate, updateEmployeeStatusById);

/**
 * @swagger
 * /EmployeeUpdate:
 *   patch:
 *     summary: Update Employee
 *     tags: [Employee]
 *     responses:
 *       200:
 *         description: Update Employee
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   code:
 *                     type: string
 */
router.put("/updateEmployeeById", authenticate, validate(updateEmployeeSchema), updateEmployeeById);

module.exports = router;