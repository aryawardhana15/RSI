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

export default function LearnCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id;
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [currentMaterialIndex, setCurrentMaterialIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch course info
      const courseResponse = await api.get(`/courses/${courseId}`);
      if (courseResponse.data.success) {
        setCourse(courseResponse.data.data);
      }

      // Fetch materials
      const materialsResponse = await api.get(`/materials/course/${courseId}`);
      if (materialsResponse.data.success) {
        const mats = materialsResponse.data.data;
        setMaterials(mats);

        // Find first uncompleted material
        const firstUncompleted = mats.findIndex((m: Material) => !m.is_completed);
        if (firstUncompleted !== -1) {
          setCurrentMaterialIndex(firstUncompleted);
        }
      }
    } catch (error: any) {
      // If 401, ProtectedRoute will handle redirect
      if (error.response?.status === 401) {
        console.log('Unauthorized - ProtectedRoute will handle redirect');
        return;
      }
      toast.error('Gagal memuat data kursus');
      router.push('/my-courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    const currentMaterial = materials[currentMaterialIndex];
    
    if (!currentMaterial) return;
    
    if (currentMaterial.is_completed) {
      toast.info('Materi ini sudah ditandai selesai');
      return;
    }

    setIsMarkingComplete(true);
    try {
      const response = await api.post(`/materials/${currentMaterial.id}/complete`);
      
      if (response.data.success) {
        toast.success(response.data.message);
        
        // Update local state
        const updatedMaterials = [...materials];
        updatedMaterials[currentMaterialIndex].is_completed = true;
        updatedMaterials[currentMaterialIndex].completed_at = new Date().toISOString();
        setMaterials(updatedMaterials);

        // Auto navigate to next material if exists
        if (currentMaterialIndex < materials.length - 1) {
          setTimeout(() => {
            setCurrentMaterialIndex(currentMaterialIndex + 1);
          }, 1000);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menandai materi selesai');
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const handlePrevious = () => {
    if (currentMaterialIndex > 0) {
      setCurrentMaterialIndex(currentMaterialIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentMaterialIndex < materials.length - 1) {
      setCurrentMaterialIndex(currentMaterialIndex + 1);
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
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

  if (materials.length === 0) {
    return (
      <ProtectedRoute allowedRoles={['pelajar']}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">Belum ada materi</h3>
              <p className="mt-2 text-sm text-gray-500">Materi akan segera ditambahkan oleh mentor</p>
              <button
                onClick={() => router.push('/my-courses')}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Kembali ke Kursus Saya
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const currentMaterial = materials[currentMaterialIndex];
  if (!currentMaterial) {
    return null;
  }

  const completedCount = materials.filter(m => m.is_completed).length;
  const progressPercentage = Math.round((completedCount / materials.length) * 100);

  return (
    <ProtectedRoute allowedRoles={['pelajar']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {/* Header - Fun Design */}
            <div className="mb-6 relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-6 shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => router.push('/my-courses')}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all transform hover:scale-110"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-black text-white mb-2">{course?.title}</h1>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-full h-3 max-w-xs">
                          <div
                            className="bg-white h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                            style={{ width: `${progressPercentage}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-400 animate-pulse"></div>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          {completedCount}/{materials.length} selesai ✨
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push(`/courses/${courseId}/assignments`)}
                      className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white font-black rounded-xl hover:bg-white/30 transition-all transform hover:scale-105 border-2 border-white/30"
                    >
                      📝 Tugas
                    </button>
                    <button
                      onClick={() => router.push(`/courses/${courseId}/forum`)}
                      className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white font-black rounded-xl hover:bg-white/30 transition-all transform hover:scale-105 border-2 border-white/30"
                    >
                      💬 Forum
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar - Material List */}
              <div className="lg:col-span-1 bg-white rounded-3xl shadow-2xl p-6 border-4 border-white/50 max-h-screen overflow-y-auto">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-3xl">📋</span>
                  <h2 className="text-xl font-black text-gray-900">Daftar Materi</h2>
                </div>
                <div className="space-y-3">
                  {materials.map((material, index) => (
                    <button
                      key={material.id}
                      onClick={() => setCurrentMaterialIndex(index)}
                      className={`w-full text-left p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                        index === currentMaterialIndex
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl'
                          : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 hover:from-gray-100 hover:to-gray-200 border-2 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                          index === currentMaterialIndex ? 'bg-white/30 text-white' : 'bg-white text-gray-700 shadow-md'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="flex-1 text-sm font-bold truncate">{material.title}</span>
                        {!!material.is_completed && (
                          <span className="text-xl">✅</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white/50">
                  {/* Material Header */}
                  <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-8 py-6">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-4xl">📖</span>
                        <h2 className="text-3xl font-black text-white">{currentMaterial.title}</h2>
                      </div>
                      {currentMaterial.description && (
                        <p className="text-white/90 font-medium text-lg">{currentMaterial.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Material Content */}
                  <div className="p-6">
                    {/* Video */}
                    {currentMaterial.video_url && (
                      <div className="mb-6">
                        <div className="bg-black rounded-lg overflow-hidden">
                          {getYoutubeEmbedUrl(currentMaterial.video_url) ? (
                            <iframe
                              src={getYoutubeEmbedUrl(currentMaterial.video_url)!}
                              title={currentMaterial.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-96"
                            ></iframe>
                          ) : (
                            <div className="flex items-center justify-center h-96">
                              <p className="text-white">Invalid video URL</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Text Content */}
                    {currentMaterial.content && (
                      <div className="prose max-w-none mb-6">
                        <div className="whitespace-pre-wrap text-gray-700">
                          {currentMaterial.content}
                        </div>
                      </div>
                    )}

                    {/* File Attachment */}
                    {currentMaterial.file_url && (
                      <div className="mb-6">
                        <a
                          href={currentMaterial.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download File
                        </a>
                      </div>
                    )}

                    {/* Mark Complete Button */}
                    {!currentMaterial.is_completed ? (
                      <div className="mt-6">
                        <button
                          onClick={handleMarkComplete}
                          disabled={isMarkingComplete}
                          className="group relative w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-lg rounded-2xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <span className="relative z-10 flex items-center justify-center gap-3">
                            {isMarkingComplete ? (
                              <>
                                <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                                Memproses...
                              </>
                            ) : (
                              <>
                                <span className="text-2xl">✅</span>
                                Tandai Selesai
                              </>
                            )}
                          </span>
                        </button>
                      </div>
                    ) : null}

                    {!!currentMaterial.is_completed && (
                      <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-4 border-green-300 rounded-2xl p-6">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">🎉</span>
                          <div>
                            <p className="text-lg font-black text-green-800 mb-1">
                              Materi ini sudah selesai!
                            </p>
                            <p className="text-sm text-green-700">
                              Selamat! Kamu dapat XP untuk menyelesaikan materi ini ✨
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 flex justify-between items-center border-t-4 border-gray-200">
                    <button
                      onClick={handlePrevious}
                      disabled={currentMaterialIndex === 0}
                      className="group px-6 py-3 text-sm font-black text-gray-700 bg-white border-2 border-gray-300 rounded-2xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <span className="flex items-center gap-2">
                        <span>⬅️</span>
                        Sebelumnya
                      </span>
                    </button>
                    <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg">
                      <span className="text-lg font-black">
                        {currentMaterialIndex + 1} / {materials.length}
                      </span>
                    </div>
                    <button
                      onClick={handleNext}
                      disabled={currentMaterialIndex === materials.length - 1}
                      className="group px-6 py-3 text-sm font-black text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <span className="flex items-center gap-2">
                        Selanjutnya
                        <span>➡️</span>
                      </span>
                    </button>
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

