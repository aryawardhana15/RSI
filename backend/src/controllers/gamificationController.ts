import { Request, Response } from 'express';
import * as gamificationService from '../services/gamificationService';

export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const stats = await gamificationService.getUserStats(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'User stats retrieved',
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user stats'
    });
  }
};

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await gamificationService.getLeaderboard(page, limit);

    res.status(200).json({
      success: true,
      message: 'Leaderboard retrieved',
      data: result.leaderboard,
      pagination: result.pagination
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get leaderboard'
    });
  }
};

export const getAllBadges = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const badges = await gamificationService.getAllBadges(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Badges retrieved',
      data: badges
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get badges'
    });
  }
};

export const getUserMissions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const missions = await gamificationService.getUserMissions(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Missions retrieved',
      data: missions
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get missions'
    });
  }
};

export const getXPHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await gamificationService.getXPHistory(req.user.userId, page, limit);

    res.status(200).json({
      success: true,
      message: 'XP history retrieved',
      data: result.history,
      pagination: result.pagination
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get XP history'
    });
  }
};

