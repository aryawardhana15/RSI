import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as courseService from '../services/courseService';

export const createCourse = async (req: Request, res: Response): Promise<void> => {
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

    const courseData = {
      ...req.body,
      mentor_id: req.user.userId
    };

    const course = await courseService.createCourse(courseData);

    res.status(201).json({
      success: true,
      message: 'Kursus berhasil dibuat',
      data: course
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal membuat kursus'
    });
  }
};

export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = parseInt(req.params.id);
    const userId = req.user?.userId;

    const course = await courseService.getCourseById(courseId, userId);

    res.status(200).json({
      success: true,
      message: 'Course retrieved',
      data: course
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || 'Course not found'
    });
  }
};

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
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

    const courseId = parseInt(req.params.id);
    const course = await courseService.updateCourse(courseId, req.user.userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Kursus berhasil diupdate',
      data: course
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengupdate kursus'
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
    await courseService.deleteCourse(courseId, req.user.userId);

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

export const getMyCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const courses = await courseService.getMyCourses(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Courses retrieved',
      data: courses
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get courses'
    });
  }
};

export const getAllCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      category: req.query.category as string,
      difficulty: req.query.difficulty as string,
      education_level: req.query.education_level as string,
      search: req.query.search as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 12
    };

    const result = await courseService.getAllCourses(filters);

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

export const enrollCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const courseId = parseInt(req.params.id);
    const enrollment = await courseService.enrollCourse(req.user.userId, courseId);

    res.status(201).json({
      success: true,
      message: 'Berhasil bergabung dengan kursus',
      data: enrollment
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal bergabung dengan kursus'
    });
  }
};

export const getMyEnrolledCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const courses = await courseService.getMyEnrolledCourses(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Enrolled courses retrieved',
      data: courses
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get enrolled courses'
    });
  }
};

export const unenrollCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const courseId = parseInt(req.params.id);
    await courseService.unenrollCourse(req.user.userId, courseId);

    res.status(200).json({
      success: true,
      message: 'Berhasil keluar dari kursus'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal keluar dari kursus'
    });
  }
};

