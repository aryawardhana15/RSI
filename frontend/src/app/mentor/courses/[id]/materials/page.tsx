'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Material } from '@/types/material';
import { Course } from '@/types/course';

export default function CourseMaterialsPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id;
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchMaterials();
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

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/materials/course/${courseId}`);
      if (response.data.success) {
        setMaterials(response.data.data);
      }
    } catch (error: any) {
      // If 401, ProtectedRoute will handle redirect
      if (error.response?.status === 401) {
        console.log('Unauthorized - ProtectedRoute will handle redirect');
        return;
      }
      toast.error('Gagal memuat materi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (materialId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus materi ini?')) {
      return;
    }

    try {
      const response = await api.delete(`/materials/${materialId}`);
      if (response.data.success) {
        toast.success('Materi berhasil dihapus');
        fetchMaterials();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus materi');
    }
  };

  const getMaterialTypeInfo = (material: Material) => {
    if (material.video_url) return { icon: '🎥', label: 'Video', color: 'from-red-500 to-pink-600' };
    if (material.file_url) return { icon: '📄', label: 'File', color: 'from-blue-500 to-cyan-600' };
    if (material.content) return { icon: '📝', label: 'Text', color: 'from-purple-500 to-pink-600' };
    return { icon: '📚', label: 'Material', color: 'from-gray-500 to-gray-600' };
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-indigo-600 font-medium animate-pulse">Memuat materi...</p>
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
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white text-sm font-medium mb-3 shadow-lg">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Materials
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                    {course?.title} 📚
                  </h1>
                  <p className="text-lg text-gray-700">
                    Kelola materi pembelajaran dalam kursus ini
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center px-3 py-1 bg-white rounded-full shadow-sm">
                      📖 {materials.length} Materi
                    </span>
                    <span className="inline-flex items-center px-3 py-1 bg-white rounded-full shadow-sm">
                      🎥 {materials.filter(m => m.video_url).length} Video
                    </span>
                    <span className="inline-flex items-center px-3 py-1 bg-white rounded-full shadow-sm">
                      📄 {materials.filter(m => m.file_url).length} File
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/mentor/courses/${courseId}/materials/create`)}
                  className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <svg className="relative mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="relative">Tambah Materi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {materials.length === 0 && (
            <div className="px-4 sm:px-0 mt-8">
              <div className="relative bg-white rounded-3xl shadow-xl p-12 text-center overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full filter blur-3xl opacity-30"></div>
                
                <div className="relative">
                  <div className="inline-block p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-6">
                    <svg className="h-20 w-20 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Materi 📚</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Yuk mulai menambahkan materi pembelajaran pertama untuk kursus ini!
                  </p>
                  <button
                    onClick={() => router.push(`/mentor/courses/${courseId}/materials/create`)}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <svg className="mr-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Materi Pertama
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Materials List */}
          {materials.length > 0 && (
            <div className="px-4 sm:px-0 mt-8">
              <div className="space-y-4">
                {materials.map((material, index) => {
                  const typeInfo = getMaterialTypeInfo(material);
                  
                  return (
                    <div
                      key={material.id}
                      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-green-200"
                    >
                      {/* Order Number Badge */}
                      <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg z-10">
                        <span className="text-white font-bold text-lg">{index + 1}</span>
                      </div>

                      <div className="p-6 pl-12">
                        <div className="flex items-start justify-between">
                          {/* Material Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${typeInfo.color} shadow-sm`}>
                                {typeInfo.icon} {typeInfo.label}
                              </span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                              {material.title}
                            </h3>
                            
                            {material.description && (
                              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {material.description}
                              </p>
                            )}

                            {/* Content Type Icons */}
                            <div className="flex items-center gap-4">
                              {material.video_url && (
                                <div className="flex items-center px-3 py-2 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg">
                                  <svg className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-sm font-medium text-red-700">Video tersedia</span>
                                </div>
                              )}
                              {material.file_url && (
                                <div className="flex items-center px-3 py-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                                  <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-sm font-medium text-blue-700">File lampiran</span>
                                </div>
                              )}
                              {material.content && (
                                <div className="flex items-center px-3 py-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                                  <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-sm font-medium text-purple-700">Konten text</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2 ml-4">
                            <button
                              onClick={() => router.push(`/mentor/courses/${courseId}/materials/${material.id}/edit`)}
                              className="flex items-center justify-center px-4 py-2 bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-xl transition-all"
                            >
                              <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span className="text-sm font-semibold text-indigo-700">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(material.id)}
                              className="flex items-center justify-center px-4 py-2 bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 rounded-xl transition-all"
                            >
                              <svg className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span className="text-sm font-semibold text-red-700">Hapus</span>
                            </button>
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