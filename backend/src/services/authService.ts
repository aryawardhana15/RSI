import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generateToken } from '../utils/jwt';

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

