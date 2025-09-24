import express, { Router } from 'express';
import authenticate from '../logs/middlewares/authMiddleware';
import { getSettingsController, updateSettingsController, uploadBrandLogoController } from '../controllers/systemSettingsController';
import validate from '../logs/middlewares/validateRequest';
import { updateSettingsSchema } from '../dtos/systemSettings.dto';
import { uploadBrandLogo } from '../middlewares/uploadMiddleware';

const router: Router = express.Router();

router.get('/', authenticate, getSettingsController);

router.put('/:userId', authenticate, validate(updateSettingsSchema), updateSettingsController);

// Upload branding logo
router.post('/:userId/branding/logo', authenticate, uploadBrandLogo, uploadBrandLogoController);

module.exports = router;