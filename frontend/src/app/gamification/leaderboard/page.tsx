'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LeaderboardEntry } from '@/types/gamification';
import Link from 'next/link';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get(`/gamification/leaderboard?page=${currentPage}&limit=20`);
        if (response.data.success) {
          setLeaderboard(response.data.data);
          setTotalPages(response.data.pagination.totalPages);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchLeaderboard();
    }
  }, [user, currentPage]);

  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Memuat leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['pelajar', 'mentor', 'admin']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🏆 Leaderboard</h1>
            <p className="text-gray-600">Kompetisi pelajar terbaik berdasarkan total XP</p>
          </div>

          {/* Navigation Buttons */}
          {user?.role === 'pelajar' && (
            <div className="flex justify-center space-x-3 mb-8">
              <Link
                href="/gamification/stats"
                className="px-6 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                📊 Stats
              </Link>
              <Link
                href="/gamification/badges"
                className="px-6 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                🎖️ Badges
              </Link>
              <Link
                href="/gamification/missions"
                className="px-6 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                🎯 Missions
              </Link>
            </div>
          )}

          {/* Podium - Top 3 */}
          {topThree.length > 0 && (
            <div className="mb-12">
              <div className="flex items-end justify-center gap-4 max-w-4xl mx-auto">
                {/* Second Place */}
                {topThree[1] && (
                  <div className="flex-1 max-w-xs">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-2xl p-6 text-center transform hover:scale-105 transition-transform duration-300 shadow-xl border-4 border-gray-300">
                      <div className="text-5xl mb-3">🥈</div>
                      <div className="relative inline-block mb-4">
                        {topThree[1].photo_url ? (
                          <img
                            className="h-20 w-20 rounded-full border-4 border-white shadow-lg"
                            src={topThree[1].photo_url}
                            alt={topThree[1].name}
                          />
                        ) : (
                          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center border-4 border-white shadow-lg">
                            <span className="text-white font-bold text-2xl">
                              {topThree[1].name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full px-2.5 py-1 shadow-md border-2 border-gray-300">
                          <span className="text-xs font-bold text-gray-700">#{topThree[1].rank}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
                        {topThree[1].name}
                      </h3>
                      <div className="text-sm text-gray-600 mb-3">Level {topThree[1].current_level}</div>
                      <div className="bg-white rounded-lg p-3 shadow-inner">
                        <div className="text-2xl font-bold text-gray-800">
                          {topThree[1].total_xp.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">XP</div>
                      </div>
                      <div className="flex justify-center gap-4 mt-4 text-xs text-gray-600">
                        <div>
                          <div className="font-semibold text-gray-800">{topThree[1].total_badges}</div>
                          <div>Badges</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{topThree[1].courses_completed}</div>
                          <div>Kursus</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-b from-gray-300 to-gray-400 h-32 rounded-b-2xl shadow-lg"></div>
                  </div>
                )}

                {/* First Place */}
                {topThree[0] && (
                  <div className="flex-1 max-w-xs">
                    <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-t-2xl p-6 text-center transform hover:scale-105 transition-transform duration-300 shadow-2xl border-4 border-yellow-400 relative">
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full p-3 shadow-lg animate-pulse">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-6xl mb-3 mt-2">🥇</div>
                      <div className="relative inline-block mb-4">
                        {topThree[0].photo_url ? (
                          <img
                            className="h-24 w-24 rounded-full border-4 border-white shadow-xl ring-4 ring-yellow-300"
                            src={topThree[0].photo_url}
                            alt={topThree[0].name}
                          />
                        ) : (
                          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center border-4 border-white shadow-xl ring-4 ring-yellow-300">
                            <span className="text-white font-bold text-3xl">
                              {topThree[0].name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full px-3 py-1 shadow-lg">
                          <span className="text-sm font-bold text-white">#{topThree[0].rank}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-xl text-gray-900 mb-1 truncate">
                        {topThree[0].name}
                      </h3>
                      <div className="text-sm text-gray-700 mb-3 font-medium">Level {topThree[0].current_level}</div>
                      <div className="bg-white rounded-lg p-4 shadow-inner">
                        <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                          {topThree[0].total_xp.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">XP</div>
                      </div>
                      <div className="flex justify-center gap-6 mt-4 text-xs text-gray-700">
                        <div>
                          <div className="font-bold text-lg text-gray-900">{topThree[0].total_badges}</div>
                          <div>Badges</div>
                        </div>
                        <div>
                          <div className="font-bold text-lg text-gray-900">{topThree[0].courses_completed}</div>
                          <div>Kursus</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-b from-yellow-400 to-yellow-500 h-48 rounded-b-2xl shadow-xl"></div>
                  </div>
                )}

                {/* Third Place */}
                {topThree[2] && (
                  <div className="flex-1 max-w-xs">
                    <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-t-2xl p-6 text-center transform hover:scale-105 transition-transform duration-300 shadow-xl border-4 border-orange-300">
                      <div className="text-5xl mb-3">🥉</div>
                      <div className="relative inline-block mb-4">
                        {topThree[2].photo_url ? (
                          <img
                            className="h-20 w-20 rounded-full border-4 border-white shadow-lg"
                            src={topThree[2].photo_url}
                            alt={topThree[2].name}
                          />
                        ) : (
                          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center border-4 border-white shadow-lg">
                            <span className="text-white font-bold text-2xl">
                              {topThree[2].name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full px-2.5 py-1 shadow-md border-2 border-orange-300">
                          <span className="text-xs font-bold text-orange-700">#{topThree[2].rank}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
                        {topThree[2].name}
                      </h3>
                      <div className="text-sm text-gray-600 mb-3">Level {topThree[2].current_level}</div>
                      <div className="bg-white rounded-lg p-3 shadow-inner">
                        <div className="text-2xl font-bold text-gray-800">
                          {topThree[2].total_xp.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">XP</div>
                      </div>
                      <div className="flex justify-center gap-4 mt-4 text-xs text-gray-600">
                        <div>
                          <div className="font-semibold text-gray-800">{topThree[2].total_badges}</div>
                          <div>Badges</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{topThree[2].courses_completed}</div>
                          <div>Kursus</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-b from-orange-300 to-orange-400 h-24 rounded-b-2xl shadow-lg"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Players List */}
          {leaderboard.length > 0 && (
            <div className="max-w-6xl mx-auto mt-12">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 border-b border-indigo-700">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Daftar Peringkat Lengkap
                  </h2>
                </div>

                {/* Table Header */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 text-sm">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-4">Nama Player</div>
                  <div className="col-span-2 text-center">Level</div>
                  <div className="col-span-2 text-right">Total XP</div>
                  <div className="col-span-1 text-center">Badges</div>
                  <div className="col-span-1 text-center">Kursus</div>
                  <div className="col-span-1 text-center">Status</div>
                </div>

                {/* Player List */}
                <div className="divide-y divide-gray-200">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${
                        entry.id === user?.id 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : ''
                      }`}
                    >
                      {/* Rank - Mobile & Desktop */}
                      <div className="col-span-1 flex items-center justify-center md:justify-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${
                          entry.rank === 1 
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' 
                            : entry.rank === 2
                            ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                            : entry.rank === 3
                            ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white'
                            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'
                        }`}>
                          {entry.rank}
                        </div>
                      </div>

                      {/* Name & Avatar - Mobile & Desktop */}
                      <div className="col-span-4 flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {entry.photo_url ? (
                            <img
                              className="h-12 w-12 rounded-full border-2 border-white shadow-md"
                              src={entry.photo_url}
                              alt={entry.name}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-lg">
                                {entry.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 truncate text-base">
                              {entry.name}
                            </h3>
                            {entry.id === user?.id && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">
                                Anda
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{entry.level_name}</p>
                        </div>
                      </div>

                      {/* Level - Mobile & Desktop */}
                      <div className="col-span-2 flex items-center justify-center md:justify-center">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">Level {entry.current_level}</div>
                          <div className="text-xs text-gray-500 hidden md:block">{entry.level_name}</div>
                        </div>
                      </div>

                      {/* Total XP - Mobile & Desktop */}
                      <div className="col-span-2 flex items-center justify-end md:justify-end">
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {entry.total_xp.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">XP</div>
                        </div>
                      </div>

                      {/* Badges - Mobile & Desktop */}
                      <div className="col-span-1 flex items-center justify-center md:justify-center">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-semibold text-gray-900">{entry.total_badges}</span>
                          </div>
                        </div>
                      </div>

                      {/* Courses - Mobile & Desktop */}
                      <div className="col-span-1 flex items-center justify-center md:justify-center">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{entry.courses_completed}</div>
                          <div className="text-xs text-gray-500 hidden md:block">Selesai</div>
                        </div>
                      </div>

                      {/* Status Badge - Mobile & Desktop */}
                      <div className="col-span-1 flex items-center justify-center md:justify-center">
                        {entry.rank === 1 && (
                          <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold rounded-full">
                            🥇 Juara
                          </span>
                        )}
                        {entry.rank === 2 && (
                          <span className="px-2 py-1 bg-gradient-to-r from-gray-300 to-gray-400 text-white text-xs font-bold rounded-full">
                            🥈 Runner-up
                          </span>
                        )}
                        {entry.rank === 3 && (
                          <span className="px-2 py-1 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-bold rounded-full">
                            🥉 3rd
                          </span>
                        )}
                        {entry.rank > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            Aktif
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-xl shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-3 rounded-l-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <div className="relative inline-flex items-center px-6 py-3 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Halaman <span className="mx-2 font-bold text-blue-600">{currentPage}</span> dari <span className="ml-2 font-bold">{totalPages}</span>
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-4 py-3 rounded-r-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}