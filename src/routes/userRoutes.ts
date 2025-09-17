import express, { Router } from 'express';
import authenticate from '../logs/middlewares/authMiddleware';
import { getUserByIdController } from '../controllers/userController';

const router: Router = express.Router();

// GET /user/:id - fetch user detail by id
router.get('/:id', authenticate, getUserByIdController);

module.exports = router;


