import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import * as gamificationController from '../controllers/gamificationController';

const router = Router();

// All routes require authentication and pelajar role (except leaderboard)
router.use(authenticate);

// Get user stats (XP, level, badges, missions) - pelajar only
router.get('/stats', authorize('pelajar'), gamificationController.getUserStats);

// Get leaderboard (accessible to all authenticated users)
router.get('/leaderboard', gamificationController.getLeaderboard);

// Get all badges with earned status - pelajar only
router.get('/badges', authorize('pelajar'), gamificationController.getAllBadges);

// Get user missions with progress - pelajar only
router.get('/missions', authorize('pelajar'), gamificationController.getUserMissions);

// Get XP history - pelajar only
router.get('/xp-history', authorize('pelajar'), gamificationController.getXPHistory);

export default router;

