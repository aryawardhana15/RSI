import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import * as assignmentController from '../controllers/assignmentController';

const router = Router();

// Get assignments by course (accessible by enrolled students and course mentor)
router.get('/course/:courseId', authenticate, assignmentController.getAssignmentsByCourse);

// Get assignment by ID
router.get('/:id', authenticate, assignmentController.getAssignmentById);

// Submit assignment (Pelajar only)
router.post(
  '/:id/submit',
  authenticate,
  authorize('pelajar'),
  [
    body('answer_text').optional().trim(),
    body('file_url').optional().isURL().withMessage('File URL tidak valid')
  ],
  assignmentController.submitAssignment
);

// Submit quiz (Pelajar only)
router.post(
  '/:id/submit-quiz',
  authenticate,
  authorize('pelajar'),
  [
    body('answers').isArray().withMessage('Answers wajib diisi'),
    body('answers.*.question_id').isInt().withMessage('Question ID harus angka'),
    body('answers.*.selected_answer').isIn(['a', 'b', 'c', 'd']).withMessage('Selected answer harus a, b, c, atau d')
  ],
  assignmentController.submitQuiz
);

// Mentor routes
router.post(
  '/',
  authenticate,
  authorize('mentor'),
  [
    body('course_id').isInt().withMessage('Course ID wajib diisi'),
    body('title').trim().notEmpty().withMessage('Judul assignment wajib diisi'),
    body('description').optional().trim(),
    body('type').isIn(['tugas', 'kuis']).withMessage('Type harus tugas atau kuis'),
    body('deadline').optional().isISO8601().withMessage('Deadline harus format tanggal valid'),
    body('max_score').optional().isInt({ min: 1 }).withMessage('Max score harus angka positif'),
    body('questions').optional().isArray(),
    body('questions.*.question_text').optional().trim().notEmpty(),
    body('questions.*.option_a').optional().trim().notEmpty(),
    body('questions.*.option_b').optional().trim().notEmpty(),
    body('questions.*.option_c').optional().trim().notEmpty(),
    body('questions.*.option_d').optional().trim().notEmpty(),
    body('questions.*.correct_answer').optional().isIn(['a', 'b', 'c', 'd'])
  ],
  assignmentController.createAssignment
);

router.put(
  '/:id',
  authenticate,
  authorize('mentor'),
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('deadline').optional().isISO8601(),
    body('max_score').optional().isInt({ min: 1 }),
    body('questions').optional().isArray()
  ],
  assignmentController.updateAssignment
);

router.delete('/:id', authenticate, authorize('mentor'), assignmentController.deleteAssignment);

// Get submissions for an assignment (Mentor only)
router.get('/:id/submissions', authenticate, authorize('mentor'), assignmentController.getSubmissionsByAssignment);

// Grade submission (Mentor only)
router.post(
  '/submissions/:id/grade',
  authenticate,
  authorize('mentor'),
  [
    body('score').isInt({ min: 0 }).withMessage('Score wajib diisi dan harus angka positif'),
    body('feedback').optional().trim()
  ],
  assignmentController.gradeSubmission
);

export default router;

