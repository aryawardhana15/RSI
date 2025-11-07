import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as assignmentService from '../services/assignmentService';

export const createAssignment = async (req: Request, res: Response): Promise<void> => {
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

    const assignment = await assignmentService.createAssignment(req.body, req.user.userId);

    res.status(201).json({
      success: true,
      message: 'Assignment berhasil dibuat',
      data: assignment
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal membuat assignment'
    });
  }
};

export const getAssignmentsByCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = parseInt(req.params.courseId);
    const userId = req.user?.userId;

    const assignments = await assignmentService.getAssignmentsByCourse(courseId, userId);

    res.status(200).json({
      success: true,
      message: 'Assignments retrieved',
      data: assignments
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get assignments'
    });
  }
};

export const getAssignmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignmentId = parseInt(req.params.id);
    const userId = req.user?.userId;

    const assignment = await assignmentService.getAssignmentById(assignmentId, userId);

    res.status(200).json({
      success: true,
      message: 'Assignment retrieved',
      data: assignment
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || 'Assignment not found'
    });
  }
};

export const updateAssignment = async (req: Request, res: Response): Promise<void> => {
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

    const assignmentId = parseInt(req.params.id);
    const assignment = await assignmentService.updateAssignment(assignmentId, req.user.userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Assignment berhasil diupdate',
      data: assignment
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengupdate assignment'
    });
  }
};

export const deleteAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const assignmentId = parseInt(req.params.id);
    await assignmentService.deleteAssignment(assignmentId, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Assignment berhasil dihapus'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menghapus assignment'
    });
  }
};

export const submitAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const assignmentId = parseInt(req.params.id);
    const submission = await assignmentService.submitAssignment(assignmentId, req.user.userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Tugas berhasil di-submit. +20 XP!',
      data: submission
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal submit tugas'
    });
  }
};

export const submitQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const assignmentId = parseInt(req.params.id);
    const result = await assignmentService.submitQuiz(assignmentId, req.user.userId, req.body);

    res.status(201).json({
      success: true,
      message: `Kuis selesai! Nilai: ${result.score}/${result.totalQuestions * 10}. +${result.score === 100 ? '50' : '20'} XP!`,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal submit kuis'
    });
  }
};

export const getSubmissionsByAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const assignmentId = parseInt(req.params.id);
    const submissions = await assignmentService.getSubmissionsByAssignment(assignmentId, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Submissions retrieved',
      data: submissions
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get submissions'
    });
  }
};

export const gradeSubmission = async (req: Request, res: Response): Promise<void> => {
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

    const submissionId = parseInt(req.params.id);
    const { score, feedback } = req.body;
    
    const submission = await assignmentService.gradeSubmission(submissionId, req.user.userId, score, feedback);

    res.status(200).json({
      success: true,
      message: 'Submission berhasil dinilai',
      data: submission
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menilai submission'
    });
  }
};

