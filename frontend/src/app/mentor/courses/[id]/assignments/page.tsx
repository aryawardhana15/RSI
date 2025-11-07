'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Assignment } from '@/types/assignment';
import { Course } from '@/types/course';

export default function CourseAssignmentsPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id;
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchAssignments();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      if (response.data.success) {
        setCourse(response.data.data);
      }
    } catch (error: any) {
      toast.error('Gagal memuat data kursus');
    }
  };

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/assignments/course/${courseId}`);
      if (response.data.success) {
        setAssignments(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        return;
      }
      toast.error('Gagal memuat assignments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (assignmentId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus assignment ini?')) {
      return;
    }

    try {
      const response = await api.delete(`/assignments/${assignmentId}`);
      if (response.data.success) {
        toast.success('Assignment berhasil dihapus');
        fetchAssignments();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus assignment');
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

  const isDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
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
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-indigo-600 font-medium animate-pulse">Memuat assignments...</p>
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
          {/* Header */}
          <div className="px-4 py-6 sm:px-0 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            <div className="relative">
              <button
                onClick={() => router.push('/mentor/courses')}
                className="group inline-flex items-center text-gray-600 hover:text-indigo-600 mb-4 transition-colors"
              >
                <svg className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Kursus
              </button>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full text-white text-sm font-medium mb-3 shadow-lg">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Assignments
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-2">
                    {course?.title} 📋
                  </h1>
                  <p className="text-lg text-gray-700">
                    Kelola tugas dan kuis dalam kursus ini
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center px-3 py-1 bg-white rounded-full shadow-sm">
                      📝 {assignments.filter(a => a.type === 'tugas').length} Tugas
                    </span>
                    <span className="inline-flex items-center px-3 py-1 bg-white rounded-full shadow-sm">
                      🎯 {assignments.filter(a => a.type === 'kuis').length} Kuis
                    </span>
                    <span className="inline-flex items-center px-3 py-1 bg-white rounded-full shadow-sm">
                      📊 {assignments.length} Total
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/mentor/courses/${courseId}/assignments/create`)}
                  className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <svg className="relative mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="relative">Tambah Assignment</span>
                </button>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {assignments.length === 0 && (
            <div className="px-4 sm:px-0 mt-8">
              <div className="relative bg-white rounded-3xl shadow-xl p-12 text-center overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full filter blur-3xl opacity-30"></div>
                
                <div className="relative">
                  <div className="inline-block p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-6">
                    <svg className="h-20 w-20 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Assignment 📭</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Yuk mulai menambahkan tugas atau kuis pertama untuk kursus ini!
                  </p>
                  <button
                    onClick={() => router.push(`/mentor/courses/${courseId}/assignments/create`)}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <svg className="mr-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Assignment Pertama
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Assignments Grid */}
          {assignments.length > 0 && (
            <div className="px-4 sm:px-0 mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {assignments.map((assignment, index) => {
                  const isTugas = assignment.type === 'tugas';
                  const isPassed = isDeadlinePassed(assignment.deadline);
                  
                  return (
                    <div
                      key={assignment.id}
                      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-indigo-200"
                    >
                      {/* Header with gradient */}
                      <div className={`h-2 bg-gradient-to-r ${
                        isTugas 
                          ? 'from-green-500 to-emerald-600' 
                          : 'from-purple-500 to-pink-600'
                      }`}></div>

                      <div className="p-6">
                        {/* Title & Type Badge */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                                isTugas 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                                  : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                              }`}>
                                {isTugas ? '📄 Tugas' : '🎯 Kuis'}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                              {assignment.title}
                            </h3>
                          </div>
                        </div>

                        {/* Description */}
                        {assignment.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {assignment.description}
                          </p>
                        )}

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {/* Max Score */}
                          <div className="flex items-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                            <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
                              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 font-medium">Max Score</p>
                              <p className="text-lg font-bold text-gray-900">{assignment.max_score}</p>
                            </div>
                          </div>

                          {/* Deadline */}
                          <div className={`flex items-center p-3 rounded-xl ${
                            isPassed 
                              ? 'bg-gradient-to-br from-red-50 to-pink-50' 
                              : 'bg-gradient-to-br from-purple-50 to-pink-50'
                          }`}>
                            <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
                              <svg className={`h-5 w-5 ${isPassed ? 'text-red-600' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600 font-medium">Deadline</p>
                              {assignment.deadline ? (
                                <p className={`text-xs font-bold truncate ${isPassed ? 'text-red-600' : 'text-gray-900'}`}>
                                  {formatDate(assignment.deadline)}
                                </p>
                              ) : (
                                <p className="text-xs font-bold text-gray-500">Tidak ada</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Deadline Warning */}
                        {isPassed && assignment.deadline && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center">
                            <svg className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs font-medium text-red-700">Deadline telah lewat</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => router.push(`/mentor/courses/${courseId}/assignments/${assignment.id}/submissions`)}
                            className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-xl transition-all group/btn"
                          >
                            <svg className="h-5 w-5 text-indigo-600 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-xs font-semibold text-indigo-700">Submissions</span>
                          </button>

                          <button
                            onClick={() => router.push(`/mentor/courses/${courseId}/assignments/${assignment.id}/edit`)}
                            className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl transition-all group/btn"
                          >
                            <svg className="h-5 w-5 text-blue-600 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="text-xs font-semibold text-blue-700">Edit</span>
                          </button>

                          <button
                            onClick={() => handleDelete(assignment.id)}
                            className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 rounded-xl transition-all group/btn"
                          >
                            <svg className="h-5 w-5 text-red-600 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="text-xs font-semibold text-red-700">Hapus</span>
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