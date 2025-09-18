import express, { Router } from 'express';
import authenticate from '../logs/middlewares/authMiddleware';
import { getSettingsController, updateSettingsController } from '../controllers/systemSettingsController';
import validate from '../logs/middlewares/validateRequest';
import { updateSettingsSchema } from '../dtos/systemSettings.dto';

const router: Router = express.Router();

// GET /settings/:userId - fetch system settings by user
router.get('/', authenticate, getSettingsController);

// PUT /settings/:userId - upsert system settings for user
router.put('/:userId', authenticate, validate(updateSettingsSchema), updateSettingsController);

module.exports = router;