import express, { Router } from 'express';
const { acceptInvitationController, rejectInvitationController } = require('../controllers/invitationController');

const router: Router = express.Router();

router.post('/accept', acceptInvitationController);

router.post('/reject', rejectInvitationController);

module.exports = router;


