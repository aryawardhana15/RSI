'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Course } from '@/types/course';

export default function MyCoursesPage() {
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
      const response = await api.get('/courses/my/enrolled');
      
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
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
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

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900">
              Kursus Saya
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Lanjutkan pembelajaran Anda
            </p>
          </div>

          {/* Empty State */}
          {courses.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada kursus</h3>
              <p className="mt-1 text-sm text-gray-500">Mulai belajar dengan bergabung dengan kursus baru</p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/courses')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Jelajahi Kursus
                </button>
              </div>
            </div>
          )}

          {/* Courses List */}
          {courses.length > 0 && (
            <div className="px-4 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {courses.map((course: any) => {
                    const progress = course.materials_count > 0 
                      ? Math.round((course.completed_materials / course.materials_count) * 100)
                      : 0;

                    return (
                      <li key={course.id}>
                        <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-medium text-gray-900 truncate">
                                {course.title}
                              </h3>
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <span className="truncate">Mentor: {course.mentor_name}</span>
                              </div>
                              {/* Progress Bar */}
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                  <span>Progress</span>
                                  <span>{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                  {course.completed_materials || 0} / {course.materials_count || 0} materi selesai
                                </p>
                              </div>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <button
                                onClick={() => router.push(`/courses/${course.id}/learn`)}
                                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                {progress > 0 ? 'Lanjutkan' : 'Mulai'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

