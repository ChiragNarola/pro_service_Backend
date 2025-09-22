import express, { Router } from 'express';
import authenticate from '../logs/middlewares/authMiddleware';
import { uploadProfileImage } from '../middlewares/uploadMiddleware';
import uploadProfileImageController from '../controllers/uploadController';

const router: Router = express.Router();

router.post('/profile-image', authenticate, uploadProfileImage, uploadProfileImageController);

module.exports = router;
