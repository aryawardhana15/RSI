import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import * as materialController from '../controllers/materialController';

const router = Router();

// Get materials by course (accessible by enrolled students and course mentor)
router.get('/course/:courseId', authenticate, materialController.getMaterialsByCourse);

// Get material by ID
router.get('/:id', authenticate, materialController.getMaterialById);

// Mark material as complete (Pelajar only)
router.post('/:id/complete', authenticate, authorize('pelajar'), materialController.markMaterialComplete);

// Mentor routes
router.post(
  '/',
  authenticate,
  authorize('mentor'),
  [
    body('course_id').isInt().withMessage('Course ID wajib diisi'),
    body('title').trim().notEmpty().withMessage('Judul materi wajib diisi'),
    body('description').optional().trim(),
    body('content').optional().trim(),
    body('video_url').optional().trim(),
    body('file_url').optional().trim(),
    body('order_index').optional().isInt({ min: 0 }).withMessage('Order index harus angka positif')
  ],
  materialController.createMaterial
);

router.put(
  '/:id',
  authenticate,
  authorize('mentor'),
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('content').optional().trim(),
    body('video_url').optional().trim(),
    body('file_url').optional().trim(),
    body('order_index').optional().isInt({ min: 0 })
  ],
  materialController.updateMaterial
);

router.delete('/:id', authenticate, authorize('mentor'), materialController.deleteMaterial);

router.put(
  '/course/:courseId/reorder',
  authenticate,
  authorize('mentor'),
  materialController.reorderMaterials
);

export default router;

