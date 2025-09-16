
import express, { Router } from 'express';
// import authenticate from '../middlewares/authMiddleware';

const router: Router = express.Router();

const { fetchSubscription } = require('../controllers/subscriptionController');
// const { loginSchema } = require("../dtos/auth.dto");

// import validate from '../middlewares/validateRequest';

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

module.exports = router;