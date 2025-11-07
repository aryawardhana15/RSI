'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { XPHistory } from '@/types/gamification';
import Link from 'next/link';

export default function XPHistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [xpHistory, setXpHistory] = useState<XPHistory[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    const fetchXPHistory = async () => {
      try {
        const [historyResponse, statsResponse] = await Promise.all([
          api.get(`/gamification/xp-history?page=${currentPage}&limit=20`),
          api.get('/gamification/stats')
        ]);

        if (historyResponse.data.success) {
          setXpHistory(historyResponse.data.data);
          if (historyResponse.data.pagination) {
            setTotalPages(historyResponse.data.pagination.totalPages);
          }
        }
        if (statsResponse.data.success) {
          setTotalXP(statsResponse.data.data.total_xp);
        }
      } catch (error) {
        console.error('Failed to fetch XP history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'pelajar') {
      fetchXPHistory();
    }
  }, [user, currentPage]);

  const formatReason = (reason: string) => {
    const reasonMap: { [key: string]: string } = {
      'complete_material': 'Menyelesaikan Materi',
      'complete_course': 'Menyelesaikan Kursus',
      'submit_assignment': 'Submit Tugas',
      'forum_post': 'Post di Forum',
      'forum_reply': 'Reply di Forum',
      'perfect_quiz': 'Nilai Sempurna pada Kuis',
      'perfect_score': 'Nilai Sempurna',
      'mission_completed': 'Misi Selesai',
      'graded_assignment': 'Tugas Dinilai',
      'earn_xp': 'Mendapatkan XP'
    };
    return reasonMap[reason] || reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getReasonIcon = (reason: string) => {
    if (reason.includes('material') || reason.includes('course')) {
      return (
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    }
    if (reason.includes('assignment') || reason.includes('quiz')) {
      return (
        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    if (reason.includes('forum')) {
      return (
        <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    }
    if (reason.includes('mission')) {
      return (
        <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['pelajar']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Riwayat XP</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Lihat semua aktivitas yang memberikan XP
                </p>
              </div>
              <div className="flex space-x-3">
                <Link
                  href="/gamification/stats"
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Stats
                </Link>
                <Link
                  href="/gamification/badges"
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Badges
                </Link>
                <Link
                  href="/gamification/missions"
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Missions
                </Link>
                <Link
                  href="/gamification/leaderboard"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Leaderboard
                </Link>
              </div>
            </div>

            {/* Total XP Summary */}
            <div className="mt-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total XP Anda</p>
                    <p className="text-3xl font-bold mt-1">{totalXP.toLocaleString()} XP</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* XP History List */}
          <div className="px-4 sm:px-0">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Riwayat Aktivitas</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {xpHistory.length > 0 ? (
                  xpHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {getReasonIcon(entry.reason)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatReason(entry.reason)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(entry.created_at).toLocaleString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-green-600">
                            +{entry.xp_amount} XP
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-12 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada riwayat</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Mulai belajar untuk mendapatkan XP!
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Halaman <span className="font-medium">{currentPage}</span> dari{' '}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

