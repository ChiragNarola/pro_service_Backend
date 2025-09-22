import express, { Router } from 'express';
import authenticate from '../logs/middlewares/authMiddleware';
import { getSettingsController, updateSettingsController } from '../controllers/systemSettingsController';
import validate from '../logs/middlewares/validateRequest';
import { updateSettingsSchema } from '../dtos/systemSettings.dto';

const router: Router = express.Router();

router.get('/', authenticate, getSettingsController);

router.put('/:userId', authenticate, validate(updateSettingsSchema), updateSettingsController);

module.exports = router;