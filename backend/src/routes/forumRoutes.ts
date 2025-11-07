import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import * as forumController from '../controllers/forumController';

const router = Router();

// Public search (requires authentication but accessible to all enrolled users)
router.get('/search', authenticate, forumController.searchForums);

// Get forums by course
router.get('/course/:courseId', authenticate, forumController.getForumsByCourse);

// Get forum by ID with all replies
router.get('/:id', authenticate, forumController.getForumById);

// Create forum thread
router.post(
  '/course/:courseId',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Judul thread wajib diisi'),
    body('content').trim().notEmpty().withMessage('Konten thread wajib diisi'),
    body('tags').optional().trim()
  ],
  forumController.createForumThread
);

// Create reply
router.post(
  '/:id/replies',
  authenticate,
  [
    body('content').trim().notEmpty().withMessage('Konten reply wajib diisi')
  ],
  forumController.createReply
);

// Like/Unlike forum thread
router.post('/:id/like', authenticate, forumController.toggleLikeForum);

// Like/Unlike reply
router.post('/replies/:id/like', authenticate, forumController.toggleLikeReply);

// Pin thread (Mentor only)
router.put('/:id/pin', authenticate, forumController.pinForumThread);

// Lock thread (Mentor only)
router.put('/:id/lock', authenticate, forumController.lockForumThread);

// Report content
router.post(
  '/report',
  authenticate,
  [
    body('type').isIn(['forum', 'reply']).withMessage('Type harus forum atau reply'),
    body('content_id').isInt().withMessage('Content ID wajib diisi'),
    body('reason').trim().notEmpty().withMessage('Alasan laporan wajib diisi')
  ],
  forumController.reportContent
);

// Delete forum thread (owner, mentor, or admin)
router.delete('/:id', authenticate, forumController.deleteForumThread);

// Delete reply (owner, mentor, or admin)
router.delete('/replies/:id', authenticate, forumController.deleteReply);

export default router;

