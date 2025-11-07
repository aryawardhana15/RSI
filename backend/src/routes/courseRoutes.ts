import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import * as courseController from '../controllers/courseController';

const router = Router();

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Pelajar routes
router.post('/:id/enroll', authenticate, authorize('pelajar'), courseController.enrollCourse);
router.delete('/:id/unenroll', authenticate, authorize('pelajar'), courseController.unenrollCourse);
router.get('/my/enrolled', authenticate, authorize('pelajar'), courseController.getMyEnrolledCourses);

// Mentor routes
router.get('/my/created', authenticate, authorize('mentor'), courseController.getMyCourses);
router.post(
  '/',
  authenticate,
  authorize('mentor'),
  [
    body('title').trim().notEmpty().withMessage('Judul kursus wajib diisi'),
    body('description').optional().trim(),
    body('category').optional().trim(),
    body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Difficulty harus beginner, intermediate, atau advanced'),
    body('education_level').optional().isIn(['SD', 'SMP', 'SMA', 'Kuliah']),
    body('price').optional().isFloat({ min: 0 }).withMessage('Harga harus angka positif'),
    body('is_published').optional().isBoolean()
  ],
  courseController.createCourse
);
router.put(
  '/:id',
  authenticate,
  authorize('mentor'),
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('category').optional().trim(),
    body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
    body('education_level').optional().isIn(['SD', 'SMP', 'SMA', 'Kuliah']),
    body('price').optional().isFloat({ min: 0 }),
    body('is_published').optional().isBoolean()
  ],
  courseController.updateCourse
);
router.delete('/:id', authenticate, authorize('mentor'), courseController.deleteCourse);

export default router;

