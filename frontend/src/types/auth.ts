export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'pelajar' | 'mentor';
  cv_url?: string;
  expertise?: string;
  experience?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_verified: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

