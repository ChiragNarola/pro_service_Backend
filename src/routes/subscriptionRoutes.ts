import express, { Router } from 'express';
import authenticate from '../logs/middlewares/authMiddleware';
import validate from '../logs/middlewares/validateRequest';
import { createSubscriptionSchema, updateSubscriptionSchema, createModuleSchema, updateModuleSchema } from '../dtos/subscription.dto';

const router: Router = express.Router();

const { fetchSubscription, createSubscription, updateSubscription, deleteSubscription, fetchModules, createModule, updateModule, getModuleById, fetchSubscriptionById, deleteModule, fetchCompanyPlanDetails } = require('../controllers/subscriptionController');

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Subscriptions APIs
 */

/**
 * @swagger
 * /subscription:
 *   get:
 *     summary: Get list of active subscriptions
 *     tags: [Subscriptions]
 *     responses:
 *       200:
 *         description: List of countries
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
router.get("/", fetchSubscription);

router.get('/modules', authenticate, fetchModules);

router.post('/modules', authenticate, validate(createModuleSchema), createModule);

router.put('/modules/:id', authenticate, validate(updateModuleSchema), updateModule);

router.get('/modules/:id', authenticate, getModuleById);

router.delete('/modules/:id', authenticate, deleteModule);

// CompanyPlanDetail - list with optional filters
router.get('/company-plan-details', authenticate, fetchCompanyPlanDetails);

router.post("/", authenticate, validate(createSubscriptionSchema), createSubscription);

router.put('/:id', authenticate, validate(updateSubscriptionSchema), updateSubscription);

router.get('/:id', authenticate, fetchSubscriptionById);

router.delete('/:id', authenticate, deleteSubscription);

module.exports = router;