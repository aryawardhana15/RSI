'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CreateForumInput } from '@/types/forum';

export default function CreateForumPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id;
  const { register, handleSubmit, formState: { errors } } = useForm<CreateForumInput>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: CreateForumInput) => {
    if (!courseId) return;

    setIsSubmitting(true);
    try {
      const response = await api.post(`/forums/course/${courseId}`, data);
      if (response.data.success) {
        toast.success(response.data.message);
        router.push(`/courses/${courseId}/forum`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membuat thread');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['pelajar', 'mentor']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <button
                onClick={() => router.push(`/courses/${courseId}/forum`)}
                className="text-gray-500 hover:text-gray-700 mb-4"
              >
                ← Kembali
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Buat Thread Baru</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Thread *
                </label>
                <input
                  {...register('title', { required: 'Judul wajib diisi' })}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan judul thread..."
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konten *
                </label>
                <textarea
                  {...register('content', { required: 'Konten wajib diisi' })}
                  rows={10}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tulis konten thread Anda di sini..."
                />
                {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (Opsional)
                </label>
                <input
                  {...register('tags')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: pertanyaan, diskusi, bantuan"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Pisahkan tags dengan koma
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push(`/courses/${courseId}/forum`)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Buat Thread'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

