'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Forum, Pagination } from '@/types/forum';
import { Course } from '@/types/course';

export default function CourseForumPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id;
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [forums, setForums] = useState<Forum[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    tags: '',
    page: 1
  });

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchForums();
    }
  }, [courseId, filters.page]);

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

  const fetchForums = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.tags) params.append('tags', filters.tags);
      params.append('page', filters.page.toString());
      params.append('limit', '20');

      const response = await api.get(`/forums/course/${courseId}?${params.toString()}`);
      if (response.data.success) {
        setForums(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        return;
      }
      toast.error('Gagal memuat forum');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
    fetchForums();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['pelajar', 'mentor']}>
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
    <ProtectedRoute allowedRoles={['pelajar', 'mentor']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <button
                onClick={() => router.push(`/courses/${courseId}/learn`)}
                className="text-gray-500 hover:text-gray-700 mb-4"
              >
                ← Kembali ke Learning Page
              </button>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Forum Diskusi: {course?.title}
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Diskusikan materi dan ajukan pertanyaan
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/courses/${courseId}/forum/create`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Buat Thread
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Cari thread..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Filter by tags..."
                  value={filters.tags}
                  onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Cari
                </button>
              </div>
            </div>

            {/* Empty State */}
            {forums.length === 0 && !isLoading && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada thread</h3>
                <p className="mt-1 text-sm text-gray-500">Mulai diskusi dengan membuat thread pertama</p>
                <div className="mt-6">
                  <button
                    onClick={() => router.push(`/courses/${courseId}/forum/create`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Buat Thread
                  </button>
                </div>
              </div>
            )}

            {/* Forums List */}
            {forums.length > 0 && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <ul className="divide-y divide-gray-200">
                  {forums.map((forum) => (
                    <li key={forum.id} className="hover:bg-gray-50">
                      <div className="px-6 py-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              {forum.is_pinned && (
                                <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M5.5 16a3.5 3.5 0 01-1.41-6.705 3.5 3.5 0 016.705-1.41 3.5 3.5 0 016.705 1.41 3.5 3.5 0 01-1.41 6.705L5.5 16z" />
                                </svg>
                              )}
                              <h3 className="text-lg font-medium text-gray-900">
                                {forum.title}
                              </h3>
                              {forum.is_locked && (
                                <svg className="w-5 h-5 text-gray-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                              {forum.content}
                            </p>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <span className="mr-4">Oleh: {forum.author_name}</span>
                              <span className="mr-4">{formatDate(forum.created_at)}</span>
                              {forum.tags && (
                                <span className="mr-4 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {forum.tags}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <span className="mr-4 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a1 1 0 001.707.707l3.546-3.547a1 1 0 00.293-.707V10.333a1 1 0 00-1-1h-3.333a1 1 0 00-1 1zM15.818 3.482a1.5 1.5 0 010 2.828L11.177 10.9a1.5 1.5 0 01-2.121 0l-.707-.707a1.5 1.5 0 012.121-2.121l.354.353 5.657-5.657a1.5 1.5 0 012.121 0zm-6.364 5.657L4.879 7.879a1.5 1.5 0 00-2.121 2.121l6.364 6.364a1.5 1.5 0 002.121 0l6.364-6.364a1.5 1.5 0 00-2.121-2.121l-5.657 5.657z" />
                                </svg>
                                {forum.likes_count} likes
                              </span>
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                </svg>
                                {forum.replies_count} replies
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => router.push(`/courses/${courseId}/forum/${forum.id}`)}
                            className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-900"
                          >
                            Buka →
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={filters.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    disabled={filters.page === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

