import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Nama wajib diisi'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 8 }).withMessage('Password minimal 8 karakter'),
    body('role').isIn(['pelajar', 'mentor']).withMessage('Role harus pelajar atau mentor'),
    body('cv_url').optional().isURL().withMessage('CV URL tidak valid'),
    body('expertise').optional().trim(),
    body('experience').optional().trim()
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').notEmpty().withMessage('Password wajib diisi')
  ],
  authController.login
);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/logout', authenticate, authController.logout);

export default router;

