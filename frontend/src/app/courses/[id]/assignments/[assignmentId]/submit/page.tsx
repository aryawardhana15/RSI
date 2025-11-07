'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Assignment, SubmitAssignmentInput } from '@/types/assignment';

export default function SubmitAssignmentPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id;
  const assignmentId = params?.assignmentId;
  const { register, handleSubmit, formState: { errors } } = useForm<SubmitAssignmentInput>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (assignmentId) {
      fetchAssignment();
    }
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/assignments/${assignmentId}`);
      if (response.data.success) {
        const data = response.data.data;
        if (data.type !== 'tugas') {
          toast.error('Ini bukan halaman untuk tugas');
          router.push(`/courses/${courseId}/assignments`);
          return;
        }
        if (data.submission) {
          toast.error('Anda sudah submit tugas ini');
          router.push(`/courses/${courseId}/assignments`);
          return;
        }
        setAssignment(data);
      }
    } catch (error: any) {
      toast.error('Gagal memuat data assignment');
      router.push(`/courses/${courseId}/assignments`);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SubmitAssignmentInput) => {
    if (!assignmentId) return;

    if (!data.answer_text && !data.file_url) {
      toast.error('Jawaban atau file wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post(`/assignments/${assignmentId}/submit`, data);
      if (response.data.success) {
        toast.success(response.data.message);
        router.push(`/courses/${courseId}/assignments`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal submit tugas');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['pelajar']}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['pelajar']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <button
                onClick={() => router.push(`/courses/${courseId}/assignments`)}
                className="text-gray-500 hover:text-gray-700 mb-4"
              >
                ← Kembali
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Submit Tugas: {assignment?.title}
              </h1>
              {assignment?.deadline && (
                <p className="mt-2 text-sm text-gray-600">
                  Deadline: {formatDate(assignment.deadline)}
                </p>
              )}
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Deskripsi Tugas</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {assignment?.description || 'Tidak ada deskripsi'}
              </p>
              <p className="mt-4 text-sm text-gray-600">
                Max Score: {assignment?.max_score}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jawaban (Text) *
                </label>
                <textarea
                  {...register('answer_text', { required: 'Jawaban atau file wajib diisi' })}
                  rows={10}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tulis jawaban Anda di sini..."
                />
                {errors.answer_text && <p className="mt-1 text-sm text-red-600">{errors.answer_text.message}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File URL (Opsional)
                </label>
                <input
                  {...register('file_url', {
                    validate: (value) => {
                      const answerText = (document.querySelector('textarea[name="answer_text"]') as HTMLTextAreaElement)?.value;
                      if (!value && !answerText) {
                        return 'Jawaban atau file wajib diisi';
                      }
                      if (value && !value.match(/^https?:\/\/.+/)) {
                        return 'File URL harus valid (http:// atau https://)';
                      }
                      return true;
                    }
                  })}
                  type="url"
                  placeholder="https://example.com/file.pdf"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.file_url && <p className="mt-1 text-sm text-red-600">{errors.file_url.message}</p>}
                <p className="mt-1 text-sm text-gray-500">
                  Upload file Anda ke Google Drive, Dropbox, atau layanan cloud lainnya, lalu paste URL di sini
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push(`/courses/${courseId}/assignments`)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Mengirim...' : 'Submit Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

