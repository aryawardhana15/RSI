import { Request, Response } from 'express';
import * as userService from '../services/userService';

export const getVerifiedMentors = async (req: Request, res: Response): Promise<void> => {
  try {
    const mentors = await userService.getVerifiedMentors();

    res.status(200).json({
      success: true,
      message: 'Verified mentors retrieved',
      data: mentors
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get mentors'
    });
  }
};

