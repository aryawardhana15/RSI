import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as adminService from '../services/adminService';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await adminService.getDashboardStats();

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

export const getPendingMentors = async (req: Request, res: Response): Promise<void> => {
  try {
    const mentors = await adminService.getPendingMentors();

    res.status(200).json({
      success: true,
      message: 'Pending mentors retrieved',
      data: mentors
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get pending mentors'
    });
  }
};

export const verifyMentor = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const mentorId = parseInt(req.params.id);
    const mentor = await adminService.verifyMentor(mentorId, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Mentor berhasil diverifikasi',
      data: mentor
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal memverifikasi mentor'
    });
  }
};

export const rejectMentor = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const mentorId = parseInt(req.params.id);
    const { reason } = req.body;
    
    await adminService.rejectMentor(mentorId, req.user.userId, reason);

    res.status(200).json({
      success: true,
      message: 'Mentor berhasil ditolak'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menolak mentor'
    });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      role: req.query.role as string,
      search: req.query.search as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await adminService.getAllUsers(filters);

    res.status(200).json({
      success: true,
      message: 'Users retrieved',
      data: result.users,
      pagination: result.pagination
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get users'
    });
  }
};

export const suspendUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const userId = parseInt(req.params.id);
    const { reason } = req.body;
    
    const user = await adminService.suspendUser(userId, req.user.userId, reason);

    res.status(200).json({
      success: true,
      message: user.is_suspended ? 'User berhasil di-suspend' : 'User berhasil di-unsuspend',
      data: user
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengubah status user'
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const userId = parseInt(req.params.id);
    await adminService.deleteUser(userId, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'User berhasil dihapus'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menghapus user'
    });
  }
};

export const getAllCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      search: req.query.search as string,
      is_published: req.query.is_published === 'true' ? true : req.query.is_published === 'false' ? false : undefined,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await adminService.getAllCourses(filters);

    res.status(200).json({
      success: true,
      message: 'Courses retrieved',
      data: result.courses,
      pagination: result.pagination
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get courses'
    });
  }
};

export const unpublishCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const courseId = parseInt(req.params.id);
    const { reason } = req.body;
    
    const course = await adminService.unpublishCourse(courseId, req.user.userId, reason);

    res.status(200).json({
      success: true,
      message: course.is_published ? 'Kursus berhasil dipublish' : 'Kursus berhasil di-unpublish',
      data: course
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengubah status kursus'
    });
  }
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const courseId = parseInt(req.params.id);
    await adminService.deleteCourse(courseId, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Kursus berhasil dihapus'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menghapus kursus'
    });
  }
};

export const getPendingReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await adminService.getPendingReports(page, limit);

    res.status(200).json({
      success: true,
      message: 'Reports retrieved',
      data: result.reports,
      pagination: result.pagination
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get reports'
    });
  }
};

export const resolveReport = async (req: Request, res: Response): Promise<void> => {
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

    const reportId = parseInt(req.params.id);
    const { action, reason } = req.body;
    
    await adminService.resolveReport(reportId, req.user.userId, action, reason);

    res.status(200).json({
      success: true,
      message: action === 'delete_content' ? 'Konten berhasil dihapus' : 'Laporan berhasil di-dismiss'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal memproses laporan'
    });
  }
};

export const getAdminLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await adminService.getAdminLogs(page, limit);

    res.status(200).json({
      success: true,
      message: 'Admin logs retrieved',
      data: result.logs,
      pagination: result.pagination
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get admin logs'
    });
  }
};

