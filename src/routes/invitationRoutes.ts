import express, { Router } from 'express';
const { acceptInvitationController, rejectInvitationController } = require('../controllers/invitationController');

const router: Router = express.Router();

// Accept invitation by token
router.post('/accept', acceptInvitationController);

// Reject invitation by token
router.post('/reject', rejectInvitationController);

module.exports = router;


