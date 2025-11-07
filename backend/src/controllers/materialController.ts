import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as materialService from '../services/materialService';

export const createMaterial = async (req: Request, res: Response): Promise<void> => {
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

    const material = await materialService.createMaterial(req.body, req.user.userId);

    res.status(201).json({
      success: true,
      message: 'Materi berhasil dibuat',
      data: material
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal membuat materi'
    });
  }
};

export const getMaterialsByCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = parseInt(req.params.courseId);
    const userId = req.user?.userId;

    const materials = await materialService.getMaterialsByCourse(courseId, userId);

    res.status(200).json({
      success: true,
      message: 'Materials retrieved',
      data: materials
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get materials'
    });
  }
};

export const getMaterialById = async (req: Request, res: Response): Promise<void> => {
  try {
    const materialId = parseInt(req.params.id);
    const userId = req.user?.userId;

    const material = await materialService.getMaterialById(materialId, userId);

    res.status(200).json({
      success: true,
      message: 'Material retrieved',
      data: material
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || 'Material not found'
    });
  }
};

export const updateMaterial = async (req: Request, res: Response): Promise<void> => {
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

    const materialId = parseInt(req.params.id);
    const material = await materialService.updateMaterial(materialId, req.user.userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Materi berhasil diupdate',
      data: material
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengupdate materi'
    });
  }
};

export const deleteMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const materialId = parseInt(req.params.id);
    await materialService.deleteMaterial(materialId, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Materi berhasil dihapus'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menghapus materi'
    });
  }
};

export const markMaterialComplete = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const materialId = parseInt(req.params.id);
    const progress = await materialService.markMaterialComplete(materialId, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Materi ditandai selesai. +10 XP!',
      data: progress
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menandai materi selesai'
    });
  }
};

export const reorderMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const courseId = parseInt(req.params.courseId);
    const { materialOrders } = req.body;

    await materialService.reorderMaterials(courseId, req.user.userId, materialOrders);

    res.status(200).json({
      success: true,
      message: 'Urutan materi berhasil diupdate'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengupdate urutan materi'
    });
  }
};

