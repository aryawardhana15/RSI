'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Course } from '@/types/course';

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const courseId = parseInt(params.id as string);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/courses/${courseId}`);
      if (response.data.success) {
        setCourse(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memuat detail kursus');
      router.push('/courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      router.push('/login');
      return;
    }

    if (user.role !== 'pelajar') {
      toast.error('Hanya pelajar yang dapat bergabung dengan kursus');
      return;
    }

    try {
      const response = await api.post(`/courses/${courseId}/enroll`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchCourse(); // Refresh to update enrollment status
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal bergabung dengan kursus');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!course) {
    return null;
  }

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  const difficultyText = {
    beginner: 'Pemula',
    intermediate: 'Menengah',
    advanced: 'Mahir'
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="mb-4 text-blue-600 hover:text-blue-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali
            </button>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              {/* Course Header */}
              <div className="px-4 py-5 sm:px-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                    <div className="mt-2 flex items-center gap-2">
                      {course.category && (
                        <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                          {course.category}
                        </span>
                      )}
                      <span className={`px-3 py-1 text-sm rounded-full ${difficultyColors[course.difficulty]}`}>
                        {difficultyText[course.difficulty]}
                      </span>
                      {course.education_level && (
                        <span className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">
                          {course.education_level}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    {course.price > 0 ? (
                      <div className="text-2xl font-bold text-gray-900">
                        Rp {Number(course.price).toLocaleString('id-ID')}
                      </div>
                    ) : (
                      <div className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold">
                        GRATIS
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Content */}
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Deskripsi Kursus</h2>
                    <p className="text-gray-700 whitespace-pre-line">
                      {course.description || 'Tidak ada deskripsi tersedia.'}
                    </p>

                    {/* Course Stats */}
                    <div className="mt-6 grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{course.enrollment_count || 0}</div>
                        <div className="text-sm text-gray-500">Pelajar</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{course.materials_count || 0}</div>
                        <div className="text-sm text-gray-500">Materi</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {course.difficulty === 'beginner' ? '⭐' : course.difficulty === 'intermediate' ? '⭐⭐' : '⭐⭐⭐'}
                        </div>
                        <div className="text-sm text-gray-500">Level</div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-lg p-6">
                      {/* Mentor Info */}
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Mentor</h3>
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                            {course.mentor?.photo_url ? (
                              <img src={course.mentor.photo_url} alt={course.mentor.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <span className="text-lg font-medium text-gray-600">
                                {course.mentor?.name?.charAt(0).toUpperCase() || 'M'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{course.mentor?.name || course.mentor_name || 'Unknown'}</p>
                            {course.mentor?.expertise && (
                              <p className="text-sm text-gray-500">{course.mentor.expertise}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        {course.isEnrolled ? (
                          <>
                            <button
                              onClick={() => router.push(`/courses/${course.id}/learn`)}
                              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                            >
                              Lanjutkan Belajar
                            </button>
                            <button
                              onClick={() => router.push('/my-courses')}
                              className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                            >
                              Lihat di Kursus Saya
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={handleEnroll}
                            disabled={user?.role !== 'pelajar'}
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {user?.role === 'pelajar' ? 'Gabung Kursus' : 'Hanya untuk Pelajar'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

