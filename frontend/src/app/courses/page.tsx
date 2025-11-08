'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import CourseCard from '@/components/CourseCard';
import CourseFilters from '@/components/CourseFilters';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Course, CourseFilters as Filters, Pagination } from '@/types/course';

export default function CoursesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.education_level) params.append('education_level', filters.education_level);
      params.append('page', page.toString());
      params.append('limit', '12');

      const response = await api.get(`/courses?${params.toString()}`);
      
      if (response.data.success) {
        setCourses(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error: any) {
      // Don't show error toast for network errors, just log
      if (error.response) {
        toast.error(error.response?.data?.message || 'Gagal memuat kursus');
      } else {
        console.error('Network error:', error);
        // Set empty courses instead of showing error
        setCourses([]);
        setPagination(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (courseId: number) => {
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
        // Refresh courses to update enrollment status
        fetchCourses(pagination?.currentPage || 1);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal bergabung dengan kursus');
    }
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    fetchCourses(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ProtectedRoute allowedRoles={['pelajar']}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header - Fun Design */}
          <div className="px-4 py-6 sm:px-0 mb-6">
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 rounded-3xl p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="text-5xl animate-bounce">🔍</div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                      Jelajahi Kursus
                    </h1>
                    <p className="text-xl text-white/90 font-medium">
                      Temukan kursus yang sesuai dengan minat dan tujuan belajarmu! 🎯
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 sm:px-0">
            <CourseFilters onFilterChange={handleFilterChange} />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Empty State - Fun Design */}
          {!isLoading && courses.length === 0 && (
            <div className="text-center py-16">
              <div className="relative inline-block mb-6">
                <div className="text-8xl animate-bounce">🔍</div>
                <div className="absolute -top-2 -right-2 text-4xl animate-pulse">✨</div>
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">Tidak ada kursus ditemukan 😊</h3>
              <p className="text-lg text-gray-600 mb-8">Coba ubah filter pencarianmu atau cek lagi nanti!</p>
            </div>
          )}

          {/* Courses Grid */}
          {!isLoading && courses.length > 0 && (
            <>
              <div className="px-4 sm:px-0">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onEnroll={handleEnroll}
                    />
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="text-sm text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

