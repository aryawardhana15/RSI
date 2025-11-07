import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import * as userController from '../controllers/userController';

const router = Router();

// Get all verified mentors (for pelajar to browse and chat)
router.get('/mentors', authenticate, authorize('pelajar'), userController.getVerifiedMentors);

export default router;

