import express, { Router } from 'express';
import { createCheckoutSession, createCheckoutSessionForExisting, stripeWebhook, finalizeBySessionId } from '../controllers/paymentController';

const router: Router = express.Router();

router.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

router.post('/stripe/create-checkout-session', express.json(), createCheckoutSession);

router.post('/stripe/create-checkout-session-existing', express.json(), createCheckoutSessionForExisting);

router.get('/stripe/finalize', finalizeBySessionId);

module.exports = router;