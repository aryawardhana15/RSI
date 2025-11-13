import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as authService from '../services/authService';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
      return;
    }

    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: result.user.role === 'mentor' 
        ? 'Registrasi berhasil. Menunggu verifikasi admin.' 
        : 'Registrasi berhasil',
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Registrasi gagal'
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
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

    const result = await authService.login(req.body);

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: result
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || 'Login gagal'
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const user = await authService.getCurrentUser(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'User data retrieved',
      data: user
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get user data'
    });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
      return;
    }

    const updatedUser = await authService.updateProfile(req.user.userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Profile berhasil diperbarui',
      data: updatedUser
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal memperbarui profile'
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  // Logout hanya perlu di frontend (clear localStorage)
  // Tapi bisa tambahkan logic blacklist token jika diperlukan
  res.status(200).json({
    success: true,
    message: 'Logout berhasil'
  });
};

