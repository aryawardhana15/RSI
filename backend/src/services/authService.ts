import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import sequelize from '../config/database';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: 'pelajar' | 'mentor';
  cv_url?: string;
  expertise?: string;
  experience?: string;
}

interface RegisterResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    is_verified: boolean;
  };
  token: string;
}

export const register = async (input: RegisterInput): Promise<RegisterResponse> => {
  // Check if email already exists
  const existingUser = await User.findOne({ where: { email: input.email } });
  if (existingUser) {
    throw new Error('Email sudah terdaftar');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(input.password, 10);

  // Create user
  const user = await User.create({
    name: input.name,
    email: input.email,
    password: hashedPassword,
    role: input.role,
    cv_url: input.cv_url,
    expertise: input.expertise,
    experience: input.experience,
    is_verified: input.role === 'pelajar' ? true : false // Pelajar auto verified, Mentor need admin approval
  });

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified
    },
    token
  };
};

interface LoginInput {
  email: string;
  password: string;
}

export const login = async (input: LoginInput): Promise<RegisterResponse> => {
  // Find user by email
  const user = await User.findOne({ where: { email: input.email } });
  
  if (!user) {
    throw new Error('Email atau password salah');
  }

  // Check if user is suspended
  if (user.is_suspended) {
    throw new Error('Akun Anda telah dinonaktifkan. Hubungi admin untuk informasi lebih lanjut');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  
  if (!isPasswordValid) {
    throw new Error('Email atau password salah');
  }

  // Check if mentor is verified
  if (user.role === 'mentor' && !user.is_verified) {
    throw new Error('Akun Anda masih menunggu verifikasi admin');
  }

  // Track login mission for pelajar only (once per day)
  if (user.role === 'pelajar') {
    try {
      const { updateMissionProgress } = await import('./gamificationService');
      // Check if user already completed login mission today
      const [todayLogin] = await sequelize.query(
        `SELECT um.id FROM user_missions um
        JOIN missions m ON um.mission_id = m.id
        WHERE um.user_id = ? AND m.requirement_type = 'login'
        AND um.is_completed = TRUE
        AND DATE(um.completed_at) = CURDATE()`,
        { replacements: [user.id] }
      );
      
      // Only track if not completed today (mission will auto-complete when progress = 1)
      if (!todayLogin || (todayLogin as any[]).length === 0) {
        await updateMissionProgress(user.id, 'login', 1);
      }
    } catch (error) {
      // Silent fail - don't break login if gamification fails
      console.error('Error tracking login mission:', error);
    }
  }

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified
    },
    token
  };
};

export const getCurrentUser = async (userId: number) => {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'name', 'email', 'role', 'bio', 'photo_url', 'is_verified', 'is_suspended']
  });

  if (!user) {
    throw new Error('User tidak ditemukan');
  }

  if (user.is_suspended) {
    throw new Error('Akun Anda telah dinonaktifkan');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.bio,
    photo_url: user.photo_url,
    is_verified: user.is_verified
  };
};

