'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import ChatButton from '@/components/ChatButton';
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header - Fun Design */}
          <div className="px-4 py-6 sm:px-0 mb-6">
            <div className="relative overflow-hidden bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-3xl p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                      Kursus Saya
                    </h1>
                    <p className="text-xl text-white/90 font-medium">
                      Lanjutkan pembelajaranmu dan raih prestasi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State - Fun Design */}
          {courses.length === 0 && (
            <div className="text-center py-16">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">Belum ada kursus</h3>
              <p className="text-lg text-gray-600 mb-8">Yuk, mulai petualangan belajarmu dengan bergabung kursus baru!</p>
              <button
                onClick={() => router.push('/courses')}
                className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  Jelajahi Kursus
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          )}

          {/* Courses List - Colorful Cards */}
          {courses.length > 0 && (
            <div className="px-4 sm:px-0">
              <div className="grid grid-cols-1 gap-6">
                {courses.map((course: any, index: number) => {
                  const progress = course.materials_count > 0 
                    ? Math.round((course.completed_materials / course.materials_count) * 100)
                    : 0;

                  const gradientColors = [
                    'from-blue-500 to-cyan-500',
                    'from-green-500 to-emerald-500',
                    'from-purple-500 to-pink-500',
                    'from-yellow-500 to-orange-500',
                    'from-indigo-500 to-blue-500',
                    'from-red-500 to-pink-500'
                  ];
                  const gradient = gradientColors[index % gradientColors.length];

                  return (
                    <div
                      key={course.id}
                      className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden border-4 border-white/50 transform hover:-translate-y-2 transition-all duration-300"
                    >
                      {/* Decorative Background */}
                      <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${gradient} opacity-10 rounded-full -mr-32 -mt-32`}></div>
                      
                      <div className="relative z-10 p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Course Title */}
                            <div className="flex items-start gap-3 mb-3">
                              <div className="text-4xl flex-shrink-0">📚</div>
                              <div className="flex-1">
                                <h3 className="text-2xl font-black text-gray-900 mb-2">
                                  {course.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                  <span className="font-medium">👨‍🏫 Mentor:</span>
                                  <span className="font-bold text-gray-800">{course.mentor_name}</span>
                                </div>
                              </div>
                            </div>

                            {/* Progress Section */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border-2 border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                  <span className="text-lg">📊</span>
                                  Progress
                                </span>
                                <span className="text-lg font-black text-gray-900">{progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
                                <div
                                  className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500 relative`}
                                  style={{ width: `${progress}%` }}
                                >
                                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 font-medium">
                                {course.completed_materials || 0} / {course.materials_count || 0} materi selesai ✨
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col md:flex-row gap-3 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!course.id) {
                                  toast.error('Course ID tidak valid');
                                  return;
                                }
                                router.push(`/courses/${course.id}/learn`);
                              }}
                              className={`group relative overflow-hidden px-6 py-3 bg-gradient-to-r ${gradient} text-white font-black rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                              type="button"
                              disabled={!course.id}
                            >
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                {progress > 0 ? (
                                  <>
                                    <span>▶️</span>
                                    Lanjutkan
                                  </>
                                ) : (
                                  <>
                                    <span>🚀</span>
                                    Mulai
                                  </>
                                )}
                              </span>
                              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </button>
                            <ChatButton 
                              courseId={course.id} 
                              courseName={course.title}
                              size="md"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

