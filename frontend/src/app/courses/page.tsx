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
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900">
              Jelajahi Kursus
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Temukan kursus yang sesuai dengan minat dan tujuan belajar Anda
            </p>
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

          {/* Empty State */}
          {!isLoading && courses.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada kursus</h3>
              <p className="mt-1 text-sm text-gray-500">Coba ubah filter pencarian Anda</p>
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

