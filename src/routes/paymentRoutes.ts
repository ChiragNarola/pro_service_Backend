import express, { Router } from 'express';
import { createCheckoutSession, stripeWebhook, finalizeBySessionId } from '../controllers/paymentController';

const router: Router = express.Router();

// Stripe requires raw body for webhook signature verification
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// For normal JSON posts, ensure body is parsed
router.post('/stripe/create-checkout-session', express.json(), createCheckoutSession);

router.get('/stripe/finalize', finalizeBySessionId);

module.exports = router;