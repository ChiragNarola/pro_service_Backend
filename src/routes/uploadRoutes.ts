import express, { Router } from 'express';
import authenticate from '../logs/middlewares/authMiddleware';
import { uploadProfileImage } from '../middlewares/uploadMiddleware';
import uploadProfileImageController, { uploadSignatureController } from '../controllers/uploadController';

const router: Router = express.Router();

router.post('/profile-image', authenticate, uploadProfileImage, uploadProfileImageController);

// Accept base64 data URL for signature image
router.post('/signature/:id', authenticate, uploadSignatureController);

module.exports = router;
