import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as chatService from '../services/chatService';

export const initiateChat = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'pelajar') {
      res.status(403).json({
        success: false,
        message: 'Hanya pelajar yang dapat memulai chat'
      });
      return;
    }

    const { course_id } = req.body;
    const chat = await chatService.initiateChat(req.user.userId, course_id);

    res.status(201).json({
      success: true,
      message: 'Chat room created',
      data: chat
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to initiate chat'
    });
  }
};

export const getChatRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const chats = await chatService.getChatRoomsByUser(req.user.userId, req.user.role);

    res.status(200).json({
      success: true,
      message: 'Chat rooms retrieved',
      data: chats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get chat rooms'
    });
  }
};

export const getChatMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const chatId = parseInt(req.params.chatId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const messages = await chatService.getChatMessages(chatId, req.user.userId, req.user.role, page, limit);

    res.status(200).json({
      success: true,
      message: 'Messages retrieved',
      data: messages
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get messages'
    });
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const chatId = parseInt(req.params.chatId);
    const message = await chatService.sendMessage(chatId, req.user.userId, req.user.role, req.body);

    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: message
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to send message'
    });
  }
};

export const markMessagesAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const chatId = parseInt(req.params.chatId);
    await chatService.markMessagesAsRead(chatId, req.user.userId, req.user.role);

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to mark messages as read'
    });
  }
};

export const getTotalUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const count = await chatService.getTotalUnreadCount(req.user.userId, req.user.role);

    res.status(200).json({
      success: true,
      message: 'Unread count retrieved',
      data: { count }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get unread count'
    });
  }
};

export const getChatByCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const courseId = parseInt(req.params.courseId);
    const chat = await chatService.getChatByCourse(req.user.userId, courseId, req.user.role);

    res.status(200).json({
      success: true,
      message: chat ? 'Chat found' : 'No chat found',
      data: chat
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get chat'
    });
  }
};

export const initiateChatWithMentor = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'pelajar') {
      res.status(403).json({
        success: false,
        message: 'Hanya pelajar yang dapat memulai chat'
      });
      return;
    }

    const { mentor_id } = req.body;
    
    if (!mentor_id) {
      res.status(400).json({
        success: false,
        message: 'Mentor ID wajib diisi'
      });
      return;
    }

    const chat = await chatService.initiateChatWithMentor(req.user.userId, mentor_id);

    res.status(201).json({
      success: true,
      message: 'Chat room created',
      data: chat
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to initiate chat'
    });
  }
};

export const updateMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const messageId = parseInt(req.params.messageId);
    const { content } = req.body;

    const message = await chatService.updateMessage(
      messageId,
      req.user.userId,
      req.user.role,
      content
    );

    res.status(200).json({
      success: true,
      message: 'Message updated',
      data: message
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update message'
    });
  }
};

export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const messageId = parseInt(req.params.messageId);

    await chatService.deleteMessage(
      messageId,
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete message'
    });
  }
};


