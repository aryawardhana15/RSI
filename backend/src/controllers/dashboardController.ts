import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboardService';

export const getPelajarDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const stats = await dashboardService.getPelajarStats(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved',
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get dashboard stats'
    });
  }
};

export const getMentorDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const stats = await dashboardService.getMentorStats(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved',
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get dashboard stats'
    });
  }
};

export const getAdminDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await dashboardService.getAdminStats();

    res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved',
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get dashboard stats'
    });
  }
};

export const getMentorStudentChartData = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const chartData = await dashboardService.getMentorStudentChartData(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Chart data retrieved',
      data: chartData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get chart data'
    });
  }
};

