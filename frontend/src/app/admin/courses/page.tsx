'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Course {
  id: number;
  title: string;
  mentor_id: number;
  mentor_name: string;
  category?: string;
  is_published: boolean;
  enrollment_count: number;
  materials_count: number;
  created_at: string;
}

export default function CoursesManagementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [publishedFilter, setPublishedFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const [unpublishReason, setUnpublishReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [currentPage, publishedFilter, searchQuery]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      if (publishedFilter !== '') {
        params.append('is_published', publishedFilter);
      }
      if (searchQuery) params.append('search', searchQuery);

      const response = await api.get(`/admin/courses?${params.toString()}`);
      
      if (response.data.success) {
        setCourses(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: any) {
      toast.error('Gagal memuat data courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!selectedCourse) return;

    setIsProcessing(true);
    try {
      const response = await api.put(`/admin/courses/${selectedCourse.id}/unpublish`, {
        reason: unpublishReason
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        setShowUnpublishModal(false);
        setUnpublishReason('');
        setSelectedCourse(null);
        fetchCourses();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengubah status course');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (courseId: number, courseTitle: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus course "${courseTitle}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await api.delete(`/admin/courses/${courseId}`);
      
      if (response.data.success) {
        toast.success('Course berhasil dihapus');
        fetchCourses();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus course');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
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
            <p className="mt-4 text-indigo-600 font-medium animate-pulse">Memuat courses...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="px-4 py-6 sm:px-0 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
            
            <div className="relative flex items-center justify-between mb-6">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white text-sm font-medium mb-3 shadow-lg">
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                  </svg>
                  Course Management
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Kelola Courses 🎓
                </h1>
                <p className="mt-2 text-gray-600 text-lg">
                  Monitor dan kelola semua courses
                </p>
              </div>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="group p-3 bg-white hover:bg-gray-50 rounded-xl shadow-lg transition-all"
              >
                <svg className="w-6 h-6 text-gray-600 group-hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filters */}
            <div className="relative flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Cari course..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  />
                </div>
              </div>
              <div className="relative">
                <select
                  value={publishedFilter}
                  onChange={(e) => {
                    setPublishedFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-48 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white appearance-none font-medium"
                >
                  <option value="">📚 Semua Status</option>
                  <option value="true">✅ Published</option>
                  <option value="false">⏸️ Unpublished</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Courses Cards */}
          <div className="px-4 sm:px-0 mt-6">
            {courses.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-gray-100">
                <div className="inline-block p-6 bg-gray-50 rounded-full mb-4">
                  <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak ada course ditemukan</h3>
                <p className="text-gray-600">Coba ubah filter pencarian Anda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course, index) => (
                  <div key={course.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border-2 border-indigo-100 transition-all duration-300">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Course Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                {course.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2">
                                {course.category && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-sm">
                                    📚 {course.category}
                                  </span>
                                )}
                                {course.is_published ? (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm">
                                    ✅ Published
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-400 text-white shadow-sm">
                                    ⏸️ Unpublished
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Mentor Info */}
                          <div className="mb-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold mr-3">
                                {course.mentor_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-medium">Mentor</p>
                                <p className="text-sm font-bold text-gray-900">{course.mentor_name}</p>
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                              <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-gray-900">{course.enrollment_count}</p>
                                  <p className="text-xs text-gray-600 font-medium">Enrollments</p>
                                </div>
                              </div>
                            </div>

                            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                              <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg mr-3">
                                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-gray-900">{course.materials_count}</p>
                                  <p className="text-xs text-gray-600 font-medium">Materials</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="ml-6 flex flex-col space-y-3">
                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setShowUnpublishModal(true);
                            }}
                            disabled={isProcessing}
                            className={`px-6 py-3 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none ${
                              course.is_published
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                            }`}
                          >
                            <span className="flex items-center">
                              {course.is_published ? (
                                <>
                                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Unpublish
                                </>
                              ) : (
                                <>
                                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Publish
                                </>
                              )}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDelete(course.id, course.title)}
                            disabled={isProcessing}
                            className="px-6 py-3 bg-white border-2 border-red-300 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all disabled:opacity-50"
                          >
                            <span className="flex items-center">
                              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 px-4 sm:px-0">
              <div className="bg-white rounded-2xl shadow-xl px-6 py-4 flex items-center justify-between border-2 border-indigo-100">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border-2 border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border-2 border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 font-medium">
                      Halaman <span className="font-bold text-indigo-600">{currentPage}</span> dari{' '}
                      <span className="font-bold text-indigo-600">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 rounded-l-xl border-2 border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-4 py-2 rounded-r-xl border-2 border-l-0 border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
                      >
                        Next →
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Unpublish/Publish Modal */}
        {showUnpublishModal && selectedCourse && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={() => setShowUnpublishModal(false)}></div>

              <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-2xl shadow-2xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="px-6 pt-6 pb-4 bg-white">
                  <div className="sm:flex sm:items-start">
                    <div className={`flex items-center justify-center flex-shrink-0 w-14 h-14 mx-auto rounded-full sm:mx-0 ${
                      selectedCourse.is_published ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      <svg className={`w-7 h-7 ${selectedCourse.is_published ? 'text-yellow-600' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                      <h3 className="text-xl font-bold leading-6 text-gray-900 mb-2">
                        {selectedCourse.is_published ? '⏸️ Unpublish Course' : '✅ Publish Course'}
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-4">
                          {selectedCourse.is_published
                            ? `Apakah Anda yakin ingin meng-unpublish course "${selectedCourse.title}"?`
                            : `Apakah Anda yakin ingin mempublish course "${selectedCourse.title}"?`
                          }
                        </p>
                        {selectedCourse.is_published && (
                          <>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Alasan (opsional):
                            </label>
                            <textarea
                              value={unpublishReason}
                              onChange={(e) => setUnpublishReason(e.target.value)}
                              rows={4}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none"
                              placeholder="Masukkan alasan..."
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="button"
                    onClick={handleUnpublish}
                    disabled={isProcessing}
                    className={`inline-flex justify-center w-full px-6 py-3 text-base font-bold text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all sm:w-auto disabled:opacity-50 disabled:transform-none ${
                      selectedCourse.is_published 
                        ? 'bg-gradient-to-r from-yellow-600 to-orange-600' 
                        : 'bg-gradient-to-r from-green-600 to-emerald-600'
                    }`}
                  >
                    {isProcessing ? 'Memproses...' : selectedCourse.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUnpublishModal(false);
                      setUnpublishReason('');
                      setSelectedCourse(null);
                    }}
                    disabled={isProcessing}
                    className="inline-flex justify-center w-full px-6 py-3 mt-3 text-base font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all sm:mt-0 sm:w-auto"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}