'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { RegisterInput } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'pelajar' | 'mentor'>('pelajar');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterInput>();
  const password = watch('password');

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        role: role,
        cv_url: data.cv_url,
        expertise: data.expertise,
        experience: data.experience
      });

      if (response.data.success) {
        toast.success(response.data.message);
        
        // Save to context (yang juga save ke localStorage)
        login(response.data.data.user, response.data.data.token);

        // Redirect based on role
        if (role === 'mentor' && !response.data.data.user.is_verified) {
          router.push('/waiting-verification');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registrasi gagal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Buat Akun Baru
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sudah punya akun?{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Login di sini
            </a>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Role Selection */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setRole('pelajar')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium ${
                role === 'pelajar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pelajar
            </button>
            <button
              type="button"
              onClick={() => setRole('mentor')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium ${
                role === 'mentor'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Mentor
            </button>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nama Lengkap
            </label>
            <input
              {...register('name', { required: 'Nama wajib diisi' })}
              type="text"
              autoComplete="name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              {...register('email', { 
                required: 'Email wajib diisi',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email tidak valid'
                }
              })}
              type="email"
              autoComplete="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              {...register('password', { 
                required: 'Password wajib diisi',
                minLength: {
                  value: 8,
                  message: 'Password minimal 8 karakter'
                }
              })}
              type="password"
              autoComplete="new-password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Konfirmasi Password
            </label>
            <input
              {...register('confirmPassword', { 
                required: 'Konfirmasi password wajib diisi',
                validate: value => value === password || 'Password tidak cocok'
              })}
              type="password"
              autoComplete="new-password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Mentor Fields */}
          {role === 'mentor' && (
            <>
              <div>
                <label htmlFor="cv_url" className="block text-sm font-medium text-gray-700">
                  Link CV/Portfolio (Google Drive, Dropbox, dll)
                </label>
                <input
                  {...register('cv_url')}
                  type="url"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div>
                <label htmlFor="expertise" className="block text-sm font-medium text-gray-700">
                  Keahlian (pisahkan dengan koma)
                </label>
                <input
                  {...register('expertise')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="JavaScript, React, Node.js"
                />
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                  Pengalaman
                </label>
                <textarea
                  {...register('experience')}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5 tahun pengalaman sebagai Full Stack Developer..."
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Memproses...' : 'Daftar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

