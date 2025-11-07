import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import * as adminController from '../controllers/adminController';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard statistics
router.get('/stats', adminController.getDashboardStats);

// Mentor verification
router.get('/mentors/pending', adminController.getPendingMentors);
router.post('/mentors/:id/verify', adminController.verifyMentor);
router.post(
  '/mentors/:id/reject',
  [
    body('reason').optional().trim()
  ],
  adminController.rejectMentor
);

// User management
router.get('/users', adminController.getAllUsers);
router.post(
  '/users/:id/suspend',
  [
    body('reason').optional().trim()
  ],
  adminController.suspendUser
);
router.delete('/users/:id', adminController.deleteUser);

// Course management
router.get('/courses', adminController.getAllCourses);
router.put(
  '/courses/:id/unpublish',
  [
    body('reason').optional().trim()
  ],
  adminController.unpublishCourse
);
router.delete('/courses/:id', adminController.deleteCourse);

// Moderation
router.get('/reports', adminController.getPendingReports);
router.post(
  '/reports/:id/resolve',
  [
    body('action').isIn(['delete_content', 'dismiss']).withMessage('Action harus delete_content atau dismiss'),
    body('reason').optional().trim()
  ],
  adminController.resolveReport
);

// Admin logs
router.get('/logs', adminController.getAdminLogs);

export default router;

