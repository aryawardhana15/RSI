'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CreateCourseInput } from '@/types/course';

export default function CreateCoursePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateCourseInput>();

  const onSubmit = async (data: CreateCourseInput) => {
    setIsLoading(true);
    try {
      const response = await api.post('/courses', data);

      if (response.data.success) {
        toast.success('Kursus berhasil dibuat');
        router.push('/mentor/courses');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membuat kursus');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900">
              Buat Kursus Baru
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Bagikan pengetahuan Anda dengan membuat kursus baru
            </p>
          </div>

          <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Judul Kursus <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('title', { required: 'Judul kursus wajib diisi' })}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Matematika Dasar untuk Pemula"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Deskripsi
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Jelaskan tentang kursus ini..."
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Kategori
                </label>
                <select
                  {...register('category')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Matematika">Matematika</option>
                  <option value="Fisika">Fisika</option>
                  <option value="Kimia">Kimia</option>
                  <option value="Biologi">Biologi</option>
                  <option value="Bahasa Inggris">Bahasa Inggris</option>
                  <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                  <option value="Sejarah">Sejarah</option>
                  <option value="Geografi">Geografi</option>
                  <option value="Ekonomi">Ekonomi</option>
                  <option value="Programming">Programming</option>
                </select>
              </div>

              {/* Difficulty & Education Level */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                    Tingkat Kesulitan <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('difficulty', { required: 'Tingkat kesulitan wajib dipilih' })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="beginner">Pemula</option>
                    <option value="intermediate">Menengah</option>
                    <option value="advanced">Mahir</option>
                  </select>
                  {errors.difficulty && (
                    <p className="mt-1 text-sm text-red-600">{errors.difficulty.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="education_level" className="block text-sm font-medium text-gray-700">
                    Jenjang Pendidikan
                  </label>
                  <select
                    {...register('education_level')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Pilih Jenjang</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                    <option value="Kuliah">Kuliah</option>
                  </select>
                </div>
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Harga (Rp)
                </label>
                <input
                  {...register('price', { 
                    valueAsNumber: true,
                    min: { value: 0, message: 'Harga tidak boleh negatif' }
                  })}
                  type="number"
                  min="0"
                  step="1000"
                  defaultValue={0}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0 untuk gratis"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              {/* Thumbnail URL */}
              <div>
                <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-700">
                  Thumbnail URL
                </label>
                <input
                  {...register('thumbnail_url')}
                  type="url"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Publish Status */}
              <div className="flex items-center">
                <input
                  {...register('is_published')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
                  Publish kursus sekarang
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/mentor/courses')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Menyimpan...' : 'Buat Kursus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

