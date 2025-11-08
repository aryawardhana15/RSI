'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import XPBar from '@/components/XPBar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { UserStats } from '@/types/gamification';
import Link from 'next/link';

interface PelajarStats {
  totalEnrolled: number;
  totalCompleted: number;
  totalXP: number;
  currentLevel: number;
  totalBadges: number;
  progressPercentage: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<PelajarStats | null>(null);
  const [gamificationStats, setGamificationStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect based on role
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
        return;
      } else if (user.role === 'mentor') {
        router.push('/mentor/dashboard');
        return;
      }
    }

    // Fetch pelajar stats and gamification stats
    const fetchStats = async () => {
      try {
        const [dashboardResponse, gamificationResponse] = await Promise.all([
          api.get('/dashboard/pelajar'),
          api.get('/gamification/stats').catch(() => ({ data: { success: false } }))
        ]);

        if (dashboardResponse.data.success) {
          setStats(dashboardResponse.data.data);
        }
        if (gamificationResponse.data.success) {
          setGamificationStats(gamificationResponse.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'pelajar') {
      fetchStats();
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['pelajar']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Welcome Header - Super Fun Design */}
          <div className="mb-8">
            <div className="relative bg-white rounded-xl shadow-md p-6 border border-gray-100 overflow-hidden">
              {/* Fun decorative elements */}
              <div className="absolute top-2 right-2 text-3xl opacity-10 animate-bounce">✨</div>
              <div className="absolute bottom-2 left-2 text-2xl opacity-10 animate-pulse">⭐</div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl shadow-lg animate-pulse">
                      👋
                    </div>
                    <div className="absolute -top-1 -right-1 text-xs bg-yellow-400 rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                      ✨
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                      Halo, {user?.name}! 🎉
                    </h1>
                    <p className="text-gray-600">
                      Siap belajar hari ini? Mari tingkatkan skill kamu! ✨🚀
                    </p>
                  </div>
                </div>
                {gamificationStats && (
                  <div className="hidden md:flex items-center gap-6">
                    <div className="text-right bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span>📊</span> Level
                      </p>
                      <p className="text-2xl font-bold text-indigo-600">{gamificationStats.current_level}</p>
                    </div>
                    <div className="w-px h-12 bg-gray-200"></div>
                    <div className="text-right bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span>⚡</span> Total XP
                      </p>
                      <p className="text-2xl font-bold text-amber-600">{gamificationStats.total_xp.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Varied Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column - Wide (2 columns) */}
            <div className="lg:col-span-2 space-y-6">
              {/* XP Progress Card - Super Fun Design */}
              {gamificationStats && (
                <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white overflow-hidden">
                  {/* Fun decorative elements */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 animate-pulse delay-300"></div>
                  <div className="absolute top-4 right-4 text-3xl opacity-20 animate-bounce">⭐</div>
                  <div className="absolute bottom-4 left-4 text-2xl opacity-20 animate-bounce delay-300">✨</div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl animate-bounce">🎮</div>
                        <div>
                          <h2 className="text-xl font-semibold mb-1">Progress Belajar</h2>
                          <p className="text-indigo-100 text-sm">Tingkatkan level dan kumpulkan XP! 🚀</p>
                        </div>
                      </div>
                      <Link
                        href="/gamification/stats"
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all backdrop-blur-sm hover:scale-105 transform"
                      >
                        Detail → ✨
                      </Link>
                    </div>
                    <XPBar
                      currentXP={gamificationStats.total_xp}
                      currentLevel={gamificationStats.current_level}
                      levelName={gamificationStats.level_name}
                      levelProgress={gamificationStats.level_progress}
                      nextLevelXP={gamificationStats.next_level_xp}
                      size="lg"
                    />
                  </div>
                </div>
              )}

              {/* Learning Stats - Fun Horizontal Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="group bg-white rounded-lg shadow-sm p-5 border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform text-2xl">
                      📚
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalEnrolled || 0}</p>
                      <p className="text-sm text-gray-500">Kursus Diikuti</p>
                    </div>
                  </div>
                </div>

                <div className="group bg-white rounded-lg shadow-sm p-5 border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform text-2xl">
                      ✅
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalCompleted || 0}</p>
                      <p className="text-sm text-gray-500">Kursus Selesai</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Overview - Fun Design */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl animate-pulse">📊</span>
                  <h3 className="text-lg font-semibold text-gray-900">Progress Keseluruhan</h3>
                  <span className="ml-auto text-lg font-bold text-indigo-600">{stats?.progressPercentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                    style={{ width: `${stats?.progressPercentage || 0}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/40"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-gray-500 flex items-center gap-1 mb-1">
                      <span>📚</span> Kursus Diikuti
                    </p>
                    <p className="text-xl font-semibold text-gray-900">{stats?.totalEnrolled || 0}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <p className="text-gray-500 flex items-center gap-1 mb-1">
                      <span>✅</span> Kursus Selesai
                    </p>
                    <p className="text-xl font-semibold text-green-600">{stats?.totalCompleted || 0}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions - Super Fun Button Grid */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl animate-bounce">🚀</span>
                  <h3 className="text-lg font-semibold text-gray-900">Aksi Cepat</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => router.push('/courses')}
                    className="group p-4 text-left rounded-lg border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all hover:scale-105 transform"
                  >
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-indigo-200 group-hover:rotate-12 transition-all text-xl">
                      🔍
                    </div>
                    <p className="font-medium text-gray-900 text-sm">Jelajahi Kursus</p>
                    <p className="text-xs text-gray-500 mt-1">Temukan kursus baru! ✨</p>
                  </button>

                  <button
                    onClick={() => router.push('/my-courses')}
                    className="group p-4 text-left rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all hover:scale-105 transform"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-green-200 group-hover:rotate-12 transition-all text-xl">
                      📖
                    </div>
                    <p className="font-medium text-gray-900 text-sm">Kursus Saya</p>
                    <p className="text-xs text-gray-500 mt-1">Lanjutkan belajar! 🎯</p>
                  </button>

                  <button
                    onClick={() => router.push('/gamification/leaderboard')}
                    className="group p-4 text-left rounded-lg border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all hover:scale-105 transform"
                  >
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-amber-200 group-hover:rotate-12 transition-all text-xl">
                      🥇
                    </div>
                    <p className="font-medium text-gray-900 text-sm">Leaderboard</p>
                    <p className="text-xs text-gray-500 mt-1">Lihat ranking! 🏆</p>
                  </button>

                  <button
                    onClick={() => router.push('/gamification/stats')}
                    className="group p-4 text-left rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all hover:scale-105 transform"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-purple-200 group-hover:rotate-12 transition-all text-xl">
                      🎯
                    </div>
                    <p className="font-medium text-gray-900 text-sm">Gamifikasi</p>
                    <p className="text-xs text-gray-500 mt-1">XP & badges! ⭐</p>
                  </button>

                  <button
                    onClick={() => router.push('/chat/mentors')}
                    className="group p-4 text-left rounded-lg border-2 border-gray-200 hover:border-cyan-300 hover:bg-cyan-50 transition-all hover:scale-105 transform"
                  >
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-cyan-200 group-hover:rotate-12 transition-all text-xl">
                      💬
                    </div>
                    <p className="font-medium text-gray-900 text-sm">Chat Mentor</p>
                    <p className="text-xs text-gray-500 mt-1">Tanya jawab! 💡</p>
                  </button>

                  <button
                    onClick={() => router.push('/profile')}
                    className="group p-4 text-left rounded-lg border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all hover:scale-105 transform"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-gray-200 group-hover:rotate-12 transition-all text-xl">
                      👤
                    </div>
                    <p className="font-medium text-gray-900 text-sm">Profile</p>
                    <p className="text-xs text-gray-500 mt-1">Edit profil! ✏️</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Achievements and Stats */}
            <div className="space-y-6">
              {/* Achievement Summary - Polished Design */}
              {gamificationStats && (
                <div className="bg-gradient-to-br from-white via-purple-50/40 to-indigo-50/30 rounded-xl shadow-lg p-5 border border-purple-100/60">
                  {/* Header */}
                  <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-purple-100/50">
                    <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-base">🏆</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900">Pencapaian</h3>
                  </div>
                  
                  {/* Badges - Circular Progress Design */}
                  <div className="mb-4">
                    <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-xl p-5 border-2 border-amber-200/50 shadow-inner">
                      <div className="flex items-center justify-center">
                        <div className="relative w-32 h-32">
                          {/* Outer ring background */}
                          <svg className="transform -rotate-90 w-32 h-32 absolute inset-0">
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="currentColor"
                              strokeWidth="7"
                              fill="none"
                              className="text-amber-200/80"
                            />
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="currentColor"
                              strokeWidth="7"
                              fill="none"
                              strokeDasharray={`${Math.min((gamificationStats.total_badges / 20) * 351.86, 351.86)} 351.86`}
                              className="text-amber-500 transition-all duration-1000"
                              strokeLinecap="round"
                            />
                          </svg>
                          {/* Center content */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg border-2 border-amber-300/50">
                              <span className="text-2xl">⭐</span>
                            </div>
                            <p className="mt-2 text-2xl font-bold text-gray-900">
                              {gamificationStats.total_badges}
                            </p>
                            <p className="text-[11px] text-gray-600 font-semibold uppercase tracking-widest">Badges</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Missions - Gradient Card */}
                  <div className="mb-4">
                    <div className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative border border-emerald-400/30">
                      {/* Subtle pattern overlay */}
                      <div className="absolute inset-0 opacity-[0.08]">
                        <div className="absolute top-0 left-0 w-full h-full" style={{
                          backgroundImage: 'radial-gradient(circle at 3px 3px, white 1.5px, transparent 0)',
                          backgroundSize: '24px 24px'
                        }}></div>
                      </div>
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-[11px] font-bold text-emerald-50 mb-1.5 uppercase tracking-wider">Missions</p>
                          <p className="text-3xl font-bold text-white leading-none mb-1">{gamificationStats.completed_missions}</p>
                          <p className="text-xs text-emerald-100 font-medium">Completed</p>
                        </div>
                        <div className="w-14 h-14 bg-white/30 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg border border-white/20">
                          <span className="text-2xl">✅</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ranking - Trophy Design */}
                  {gamificationStats.rank > 0 && (
                    <div className="mb-4">
                      <div className="bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative border border-indigo-400/30">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/8 rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/8 rounded-full -ml-14 -mb-14"></div>
                        
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-[11px] font-bold text-indigo-50 mb-1.5 uppercase tracking-wider">Ranking</p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold text-white leading-none">#{gamificationStats.rank}</span>
                              <span className="text-xs text-indigo-100 font-medium">Global</span>
                            </div>
                          </div>
                          <div className="w-14 h-14 bg-white/30 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg border border-white/20">
                            <span className="text-2xl">🥇</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Link */}
                  <div className="mt-5 pt-4 border-t border-purple-100/60">
                    <Link
                      href="/gamification/stats"
                      className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 font-semibold transition-all shadow-md hover:shadow-lg text-sm"
                    >
                      Lihat Detail →
                    </Link>
                  </div>
                </div>
              )}

              {/* Additional Stats - Clean Design */}
              <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 rounded-xl shadow-lg p-5 border border-blue-100/60">
                <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-blue-100/50">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-base">📈</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Statistik</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200/50 shadow-sm">
                    <span className="text-sm font-medium text-gray-700">Total XP</span>
                    <span className="text-lg font-bold text-amber-600">{stats?.totalXP || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200/50 shadow-sm">
                    <span className="text-sm font-medium text-gray-700">Level Saat Ini</span>
                    <span className="text-lg font-bold text-indigo-600">{stats?.currentLevel || 1}</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200/50 shadow-sm">
                    <span className="text-sm font-medium text-gray-700">Total Badges</span>
                    <span className="text-lg font-bold text-amber-600">{stats?.totalBadges || 0}</span>
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

