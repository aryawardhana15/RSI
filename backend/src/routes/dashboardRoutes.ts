import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import * as dashboardController from '../controllers/dashboardController';

const router = Router();

// Protected routes - require authentication
router.get('/pelajar', authenticate, authorize('pelajar'), dashboardController.getPelajarDashboard);
router.get('/mentor', authenticate, authorize('mentor'), dashboardController.getMentorDashboard);
router.get('/mentor/students/chart', authenticate, authorize('mentor'), dashboardController.getMentorStudentChartData);
router.get('/admin', authenticate, authorize('admin'), dashboardController.getAdminDashboard);

export default router;

