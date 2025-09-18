import express, { Router } from 'express';
import authenticate from '../logs/middlewares/authMiddleware';
import { getUserByIdController, updateUserByIdController } from '../controllers/userController';
import validate from '../logs/middlewares/validateRequest';
import { updateUserSchema } from '../dtos/user.dto';
const router: Router = express.Router();

// GET /user/:id - fetch user detail by id
router.get('/:id', authenticate, getUserByIdController);

router.put('/:id', authenticate, validate(updateUserSchema), updateUserByIdController);

module.exports = router;