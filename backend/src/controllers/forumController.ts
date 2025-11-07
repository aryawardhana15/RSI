import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as forumService from '../services/forumService';

export const createForumThread = async (req: Request, res: Response): Promise<void> => {
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

    const courseId = parseInt(req.params.courseId);
    const forum = await forumService.createForumThread(
      { ...req.body, course_id: courseId },
      req.user.userId
    );

    res.status(201).json({
      success: true,
      message: 'Thread berhasil dibuat. +5 XP!',
      data: forum
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal membuat thread'
    });
  }
};

export const getForumsByCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const courseId = parseInt(req.params.courseId);
    const filters = {
      tags: req.query.tags as string,
      user_id: req.query.user_id ? parseInt(req.query.user_id as string) : undefined,
      search: req.query.search as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await forumService.getForumsByCourse(courseId, req.user.userId, filters);

    res.status(200).json({
      success: true,
      message: 'Forums retrieved',
      data: result.forums,
      pagination: result.pagination
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get forums'
    });
  }
};

export const getForumById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const forumId = parseInt(req.params.id);
    const forum = await forumService.getForumById(forumId, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Forum retrieved',
      data: forum
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || 'Forum not found'
    });
  }
};

export const createReply = async (req: Request, res: Response): Promise<void> => {
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

    const forumId = parseInt(req.params.id);
    const reply = await forumService.createReply(forumId, req.user.userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Reply berhasil dibuat. +3 XP!',
      data: reply
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal membuat reply'
    });
  }
};

export const toggleLikeForum = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const forumId = parseInt(req.params.id);
    const result = await forumService.toggleLikeForum(forumId, req.user.userId);

    res.status(200).json({
      success: true,
      message: result.liked ? 'Thread liked' : 'Thread unliked',
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to toggle like'
    });
  }
};

export const toggleLikeReply = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const replyId = parseInt(req.params.id);
    const result = await forumService.toggleLikeReply(replyId, req.user.userId);

    res.status(200).json({
      success: true,
      message: result.liked ? 'Reply liked' : 'Reply unliked',
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to toggle like'
    });
  }
};

export const pinForumThread = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const forumId = parseInt(req.params.id);
    const forum = await forumService.pinForumThread(forumId, req.user.userId);

    res.status(200).json({
      success: true,
      message: forum.is_pinned ? 'Thread pinned' : 'Thread unpinned',
      data: forum
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to pin thread'
    });
  }
};

export const lockForumThread = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const forumId = parseInt(req.params.id);
    const forum = await forumService.lockForumThread(forumId, req.user.userId);

    res.status(200).json({
      success: true,
      message: forum.is_locked ? 'Thread locked' : 'Thread unlocked',
      data: forum
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to lock thread'
    });
  }
};

export const reportContent = async (req: Request, res: Response): Promise<void> => {
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

    const { type, content_id, reason } = req.body;
    const report = await forumService.reportContent(req.user.userId, type, content_id, reason);

    res.status(201).json({
      success: true,
      message: 'Laporan berhasil dikirim',
      data: report
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengirim laporan'
    });
  }
};

export const deleteForumThread = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const forumId = parseInt(req.params.id);
    const isAdmin = req.user.role === 'admin';
    
    await forumService.deleteForumThread(forumId, req.user.userId, isAdmin);

    res.status(200).json({
      success: true,
      message: 'Thread berhasil dihapus'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menghapus thread'
    });
  }
};

export const deleteReply = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const replyId = parseInt(req.params.id);
    const isAdmin = req.user.role === 'admin';
    
    await forumService.deleteReply(replyId, req.user.userId, isAdmin);

    res.status(200).json({
      success: true,
      message: 'Reply berhasil dihapus'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menghapus reply'
    });
  }
};

export const searchForums = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const query = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!query) {
      res.status(400).json({
        success: false,
        message: 'Query parameter required'
      });
      return;
    }

    const forums = await forumService.searchForums(req.user.userId, query, page, limit);

    res.status(200).json({
      success: true,
      message: 'Search results',
      data: forums
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Search failed'
    });
  }
};

