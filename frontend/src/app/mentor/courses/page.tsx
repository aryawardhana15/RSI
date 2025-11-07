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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Navbar />
          <div className="flex flex-col justify-center items-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <svg className="h-6 w-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
              </div>
            </div>
            <p className="mt-4 text-indigo-600 font-medium animate-pulse">Memuat kursus...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          {/* Header with Fun Design */}
          <div className="px-4 py-6 sm:px-0 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full text-white text-sm font-medium mb-3 shadow-lg">
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                  </svg>
                  My Courses
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-2">
                  Kursus Saya ✨
                </h1>
                <p className="text-lg text-gray-700">
                  Kelola semua kursus yang Anda buat dengan mudah
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <span className="inline-flex items-center px-3 py-1 bg-white rounded-full shadow-sm">
                    📚 {courses.length} Kursus
                  </span>
                  <span className="inline-flex items-center px-3 py-1 bg-white rounded-full shadow-sm">
                    ✅ {courses.filter((c: any) => c.is_published).length} Published
                  </span>
                </div>
              </div>
              <button
                onClick={() => router.push('/mentor/courses/create')}
                className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <svg className="relative mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="relative">Buat Kursus Baru</span>
              </button>
            </div>
          </div>

          {/* Empty State - Fun Design */}
          {courses.length === 0 && (
            <div className="px-4 sm:px-0 mt-8">
              <div className="relative bg-white rounded-3xl shadow-xl p-12 text-center overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full filter blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full filter blur-3xl opacity-30"></div>
                
                <div className="relative">
                  <div className="inline-block p-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-6">
                    <svg className="h-20 w-20 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Kursus 📚</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Yuk mulai berbagi ilmu! Buat kursus pertama Anda dan inspirasi ribuan pelajar di luar sana
                  </p>
                  <button
                    onClick={() => router.push('/mentor/courses/create')}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <svg className="mr-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Buat Kursus Pertama
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Courses Grid - Card Based Design */}
          {courses.length > 0 && (
            <div className="px-4 sm:px-0 mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course: any, index: number) => {
                  const colors = [
                    { from: 'from-blue-500', to: 'to-cyan-600', badge: 'bg-blue-100 text-blue-700' },
                    { from: 'from-purple-500', to: 'to-pink-600', badge: 'bg-purple-100 text-purple-700' },
                    { from: 'from-green-500', to: 'to-emerald-600', badge: 'bg-green-100 text-green-700' },
                    { from: 'from-orange-500', to: 'to-red-600', badge: 'bg-orange-100 text-orange-700' },
                    { from: 'from-indigo-500', to: 'to-purple-600', badge: 'bg-indigo-100 text-indigo-700' },
                    { from: 'from-pink-500', to: 'to-rose-600', badge: 'bg-pink-100 text-pink-700' },
                  ];
                  const color = colors[index % colors.length];

                  return (
                    <div
                      key={course.id}
                      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                    >
                      {/* Gradient Header */}
                      <div className={`h-32 bg-gradient-to-br ${color.from} ${color.to} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black opacity-10"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full filter blur-2xl opacity-20"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full filter blur-2xl opacity-20"></div>
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                          {course.is_published ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white text-green-600 shadow-lg">
                              ✅ Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white text-gray-600 shadow-lg">
                              📝 Draft
                            </span>
                          )}
                        </div>

                        {/* Book Icon */}
                        <div className="absolute bottom-4 left-4">
                          <div className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl">
                            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="mb-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${color.badge}`}>
                            {course.category || '📂 No Category'}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                          {course.title}
                        </h3>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <svg className="h-4 w-4 mr-1 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                            </svg>
                            <span className="font-medium">{course.enrollmentCount || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <svg className="h-4 w-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                            </svg>
                            <span className="font-medium">{course.materialsCount || 0} materi</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <button
                            onClick={() => router.push(`/courses/${course.id}`)}
                            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Detail
                          </button>
                          <button
                            onClick={() => router.push(`/mentor/courses/${course.id}/materials`)}
                            className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Materi
                          </button>
                          <button
                            onClick={() => router.push(`/mentor/courses/${course.id}/assignments`)}
                            className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Tugas
                          </button>
                          <button
                            onClick={() => router.push(`/mentor/courses/${course.id}/edit`)}
                            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                        </div>

                        {/* Toggle & Delete */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTogglePublish(course.id, course.is_published)}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              course.is_published 
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' 
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {course.is_published ? '🔽 Unpublish' : '🚀 Publish'}
                          </button>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            🗑️
                          </button>
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