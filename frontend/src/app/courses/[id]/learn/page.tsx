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
      <div className="min-h-screen bg-gray-900">
        <Navbar />

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => router.push('/my-courses')}
                className="text-gray-300 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-1 ml-4">
                <h1 className="text-xl font-bold text-white">{course?.title}</h1>
                <div className="mt-2 flex items-center">
                  <div className="flex-1 bg-gray-700 rounded-full h-2 mr-3">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-300">
                    {completedCount}/{materials.length} selesai
                  </span>
                </div>
              </div>
              <div className="ml-4 flex space-x-2">
                <button
                  onClick={() => router.push(`/courses/${courseId}/assignments`)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                >
                  Assignments
                </button>
                <button
                  onClick={() => router.push(`/courses/${courseId}/forum`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  Forum
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar - Material List */}
              <div className="lg:col-span-1 bg-gray-800 rounded-lg p-4 max-h-screen overflow-y-auto">
                <h2 className="text-lg font-semibold text-white mb-4">Daftar Materi</h2>
                <div className="space-y-2">
                  {materials.map((material, index) => (
                    <button
                      key={material.id}
                      onClick={() => setCurrentMaterialIndex(index)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        index === currentMaterialIndex
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center text-xs mr-2">
                          {index + 1}
                        </span>
                        <span className="flex-1 text-sm truncate">{material.title}</span>
                        {!!material.is_completed && (
                          <svg className="w-5 h-5 text-green-400 ml-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {/* Material Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                    <h2 className="text-2xl font-bold text-white">{currentMaterial.title}</h2>
                    {currentMaterial.description && (
                      <p className="mt-2 text-blue-100">{currentMaterial.description}</p>
                    )}
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
                          className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                        >
                          {isMarkingComplete ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Memproses...
                            </>
                          ) : (
                            <>
                              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Tandai Selesai
                            </>
                          )}
                        </button>
                      </div>
                    ) : null}

                    {!!currentMaterial.is_completed && (
                      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm font-medium text-green-800">
                            Materi ini sudah selesai
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                    <button
                      onClick={handlePrevious}
                      disabled={currentMaterialIndex === 0}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Materi Sebelumnya
                    </button>
                    <span className="text-sm text-gray-600">
                      {currentMaterialIndex + 1} / {materials.length}
                    </span>
                    <button
                      onClick={handleNext}
                      disabled={currentMaterialIndex === materials.length - 1}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Materi Selanjutnya →
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

