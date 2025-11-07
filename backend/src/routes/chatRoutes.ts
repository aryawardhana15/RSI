import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import * as chatController from '../controllers/chatController';

const router = Router();

// Get all chat rooms for user
router.get('/', authenticate, chatController.getChatRooms);

// Get total unread messages count
router.get('/unread-count', authenticate, chatController.getTotalUnreadCount);

// Get chat by course (for pelajar to check if chat exists with mentor)
router.get('/course/:courseId', authenticate, chatController.getChatByCourse);

// Initiate chat (Pelajar only) - with course or mentor
router.post(
  '/',
  authenticate,
  authorize('pelajar'),
  [
    body('course_id').optional().isInt().withMessage('Course ID harus berupa angka'),
    body('mentor_id').optional().isInt().withMessage('Mentor ID harus berupa angka')
  ],
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    
    // Check if course_id or mentor_id is provided
    if (!req.body.course_id && !req.body.mentor_id) {
      return res.status(400).json({
        success: false,
        message: 'Course ID atau Mentor ID wajib diisi'
      });
    }
    
    // Route to appropriate controller based on what's provided
    if (req.body.mentor_id) {
      return chatController.initiateChatWithMentor(req, res);
    } else {
      return chatController.initiateChat(req, res);
    }
  }
);

// Get messages in a chat room
router.get('/:chatId/messages', authenticate, chatController.getChatMessages);

// Send message
router.post(
  '/:chatId/messages',
  authenticate,
  [
    body('content').trim().notEmpty().withMessage('Pesan tidak boleh kosong'),
    body('file_url').optional().isURL().withMessage('File URL tidak valid')
  ],
  chatController.sendMessage
);

// Mark messages as read
router.put('/:chatId/read', authenticate, chatController.markMessagesAsRead);

// Update message
router.put(
  '/messages/:messageId',
  authenticate,
  [
    body('content').trim().notEmpty().withMessage('Pesan tidak boleh kosong')
  ],
  chatController.updateMessage
);

// Delete message
router.delete('/messages/:messageId', authenticate, chatController.deleteMessage);

export default router;


