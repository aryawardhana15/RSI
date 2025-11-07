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
            <p className="mt-4 text-indigo-600 font-medium animate-pulse">Memuat detail kursus...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!course) {
    return null;
  }

  const difficultyConfig = {
    beginner: { 
      gradient: 'from-green-500 to-emerald-600', 
      bg: 'from-green-50 to-emerald-50',
      text: '🌱 Pemula',
      stars: '⭐'
    },
    intermediate: { 
      gradient: 'from-yellow-500 to-orange-600', 
      bg: 'from-yellow-50 to-orange-50',
      text: '🌿 Menengah',
      stars: '⭐⭐'
    },
    advanced: { 
      gradient: 'from-red-500 to-pink-600', 
      bg: 'from-red-50 to-pink-50',
      text: '🌳 Mahir',
      stars: '⭐⭐⭐'
    }
  };

  const config = difficultyConfig[course.difficulty];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="group mb-6 inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Kembali</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Course Header Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-indigo-100">
                  {/* Thumbnail */}
                  {course.thumbnail_url && (
                    <div className="relative h-64 bg-gradient-to-br from-indigo-500 to-purple-600">
                      <img 
                        src={course.thumbnail_url} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                  )}

                  <div className="p-8">
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {course.category && (
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg">
                          📚 {course.category}
                        </span>
                      )}
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r ${config.gradient} text-white shadow-lg`}>
                        {config.text}
                      </span>
                      {course.education_level && (
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg">
                          🎓 {course.education_level}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                      {course.title}
                    </h1>

                    {/* Price */}
                    <div className="mb-6">
                      {course.price > 0 ? (
                        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                          <span className="text-sm font-medium text-white mr-2">Harga:</span>
                          <span className="text-2xl font-bold text-white">
                            Rp {Number(course.price).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                          <svg className="h-6 w-6 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-2xl font-bold text-white">GRATIS</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-100">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="ml-3 text-2xl font-bold text-gray-900">Deskripsi Kursus</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {course.description || 'Tidak ada deskripsi tersedia.'}
                  </p>
                </div>

                {/* Stats Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-100">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full mb-3">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{course.enrollment_count || 0}</div>
                      <div className="text-sm font-medium text-gray-600">Pelajar</div>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-3">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{course.materials_count || 0}</div>
                      <div className="text-sm font-medium text-gray-600">Materi</div>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br ${config.bg} rounded-2xl border-2 ${config.gradient.replace('from-', 'border-').split(' ')[0].replace('to-', '')}">
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${config.gradient} rounded-full mb-3`}>
                        <span className="text-2xl">{config.stars.split('')[0]}</span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{config.stars}</div>
                      <div className="text-sm font-medium text-gray-600">Level</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                  {/* Mentor Card */}
                  <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-indigo-100">
                    <div className="flex items-center mb-6">
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="ml-2 text-lg font-bold text-gray-900">Mentor</h3>
                    </div>

                    <div className="flex items-center">
                      <div className="relative">
                        {course.mentor?.photo_url ? (
                          <img 
                            src={course.mentor.photo_url} 
                            alt={course.mentor.name} 
                            className="w-16 h-16 rounded-full object-cover border-4 border-indigo-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-indigo-200">
                            <span className="text-2xl font-bold text-white">
                              {(course.mentor?.name || course.mentor_name || 'M').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="ml-4">
                        <p className="font-bold text-gray-900">{course.mentor?.name || course.mentor_name || 'Unknown'}</p>
                        {course.mentor?.expertise && (
                          <p className="text-sm text-gray-600 mt-1">{course.mentor.expertise}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Card */}
                  <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-100">
                    <div className="space-y-3">
                      {course.isEnrolled ? (
                        <>
                          <button
                            onClick={() => router.push(`/courses/${course.id}/learn`)}
                            className="w-full group relative px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
                            <span className="relative flex items-center justify-center">
                              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Lanjutkan Belajar
                            </span>
                          </button>
                          <button
                            onClick={() => router.push('/my-courses')}
                            className="w-full px-6 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all"
                          >
                            Lihat di Kursus Saya
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleEnroll}
                            disabled={user?.role !== 'pelajar'}
                            className="w-full group relative px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
                            <span className="relative flex items-center justify-center">
                              {user?.role === 'pelajar' ? (
                                <>
                                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  Gabung Kursus
                                </>
                              ) : (
                                <>
                                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  Hanya untuk Pelajar
                                </>
                              )}
                            </span>
                          </button>
                          {user?.role !== 'pelajar' && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                              <p className="text-xs text-yellow-800 text-center">
                                💡 Login sebagai pelajar untuk bergabung
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Info Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border-2 border-blue-200">
                    <div className="flex items-start">
                      <svg className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="ml-3">
                        <h4 className="text-sm font-bold text-gray-900 mb-1">Yang Akan Anda Pelajari</h4>
                        <p className="text-xs text-gray-700">
                          Akses ke semua materi pembelajaran dan dapat berkomunikasi dengan mentor
                        </p>
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