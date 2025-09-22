
import express, { Router } from 'express';

const router: Router = express.Router();

const { fetchRole, createRole, fetchEmployeeRole, createEmployeeRole, fetchEmployeeDepartment, createEmployeeDepartment, fetchModules } = require('../controllers/masterController');

/**
 * @swagger
 * tags:
 *   name: Master
 *   description: Master APIs
 */

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get list of active roles
 *     tags: [Master]
 *     responses:
 *       200:
 *         description: List of roles
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
 */
router.get("/fetchRole", fetchRole);

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create Role
 *     tags: [Master]
 *     responses:
 *       200:
 *         description: Create roles
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
 */
router.post("/createRole", createRole);

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get list of active roles
 *     tags: [Master]
 *     responses:
 *       200:
 *         description: List of roles
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
 */
router.get("/fetchEmployeeRole", fetchEmployeeRole);

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create Role
 *     tags: [Master]
 *     responses:
 *       200:
 *         description: Create roles
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
 */
router.post("/createEmployeeRole", createEmployeeRole);

/**
 * @swagger
 * /fetchEmployeeDepartment:
 *   get:
 *     summary: Get list of active Department
 *     tags: [Master]
 *     responses:
 *       200:
 *         description: List of Department
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
 */
router.get("/fetchEmployeeDepartment", fetchEmployeeDepartment);

/**
 * @swagger
 * /Departments:
 *   post:
 *     summary: Create Department
 *     tags: [Master]
 *     responses:
 *       200:
 *         description: Create Departments
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
 */
router.post("/createEmployeeDepartment", createEmployeeDepartment);

module.exports = router;