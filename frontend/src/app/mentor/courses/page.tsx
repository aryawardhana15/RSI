'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Course } from '@/types/course';

export default function MentorCoursesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/courses/my/created');
      
      if (response.data.success) {
        setCourses(response.data.data);
      }
    } catch (error: any) {
      // If 401, ProtectedRoute will handle redirect
      if (error.response?.status === 401) {
        console.log('Unauthorized - ProtectedRoute will handle redirect');
        return;
      }
      toast.error(error.response?.data?.message || 'Gagal memuat kursus');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (courseId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kursus ini?')) {
      return;
    }

    try {
      const response = await api.delete(`/courses/${courseId}`);
      
      if (response.data.success) {
        toast.success('Kursus berhasil dihapus');
        fetchMyCourses(); // Refresh list
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus kursus');
    }
  };

  const handleTogglePublish = async (courseId: number, currentStatus: boolean) => {
    try {
      const response = await api.put(`/courses/${courseId}`, {
        is_published: !currentStatus
      });
      
      if (response.data.success) {
        toast.success(currentStatus ? 'Kursus unpublished' : 'Kursus published');
        fetchMyCourses(); // Refresh list
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengupdate status kursus');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['mentor']}>
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
    <ProtectedRoute allowedRoles={['mentor']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="px-4 py-6 sm:px-0 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Kursus Saya
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Kelola semua kursus yang Anda buat
              </p>
            </div>
            <button
              onClick={() => router.push('/mentor/courses/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Buat Kursus Baru
            </button>
          </div>

          {/* Empty State */}
          {courses.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada kursus</h3>
              <p className="mt-1 text-sm text-gray-500">Mulai berbagi pengetahuan dengan membuat kursus pertama Anda</p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/mentor/courses/create')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Buat Kursus Baru
                </button>
              </div>
            </div>
          )}

          {/* Courses Table */}
          {courses.length > 0 && (
            <div className="px-4 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kursus
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pelajar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Materi
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courses.map((course: any) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {course.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {course.category || 'No category'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {course.is_published ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Published
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {course.enrollmentCount || 0} pelajar
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {course.materialsCount || 0} materi
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => router.push(`/courses/${course.id}`)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Detail
                          </button>
                          <button
                            onClick={() => router.push(`/mentor/courses/${course.id}/edit`)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleTogglePublish(course.id, course.is_published)}
                            className="text-yellow-600 hover:text-yellow-900 mr-4"
                          >
                            {course.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

