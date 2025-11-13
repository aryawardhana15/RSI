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
import ChatButton from '@/components/ChatButton';

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
  const [courses, setCourses] = useState<any[]>([]);
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
        const [dashboardResponse, gamificationResponse, coursesResponse] = await Promise.all([
          api.get('/dashboard/pelajar'),
          api.get('/gamification/stats').catch(() => ({ data: { success: false } })),
          api.get('/courses/my/enrolled').catch(() => ({ data: { success: false } }))
        ]);

        if (dashboardResponse.data.success) {
          setStats(dashboardResponse.data.data);
        }
        if (gamificationResponse.data.success) {
          setGamificationStats(gamificationResponse.data.data);
        }
        if (coursesResponse.data.success) {
          setCourses(coursesResponse.data.data || []);
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

        <div className="max-w-6xl mx-auto py-8 px-8 sm:px-6 lg:px-8">
          {/* Main Content - Varied Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* Left Column - Wide (8 out of 12 columns) */}
            <div className="lg:col-span-8 space-y-6">
          {/* Welcome Header - Clean Design */}
          <div className="mb-8">
            <div className="relative bg-[#1758E6] rounded-xl p-12 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                      Halo, {user?.name}! 👋
                    </h1>
                    <p className="text-white">
                      Siap belajar hari ini? Mari tingkatkan skill kamu!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
              {/* Kursus Saya section - visually distinct */}
              {courses && courses.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-300 mb-8 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[#222C7B]">Kursus Saya</h2>
                    {courses.length > 3 && (
                      <Link href="/my-courses" className="text-indigo-600 font-semibold hover:underline text-sm">Lihat Semua →</Link>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.slice(0, 2).map((course: any, index: number) => {
                      const progress = course.materials_count > 0
                        ? Math.round((course.completed_materials / course.materials_count) * 100)
                        : 0;

                      const gradientColors = [
                        'from-blue-500 to-cyan-500',
                        'from-green-500 to-emerald-500',
                        'from-purple-500 to-pink-500',
                        'from-yellow-500 to-orange-500',
                        'from-indigo-500 to-blue-500',
                        'from-red-500 to-pink-500'
                      ];
                      const gradient = gradientColors[index % gradientColors.length];

                      return (
                        <div
                          key={course.id}
                          className="group relative bg-white rounded-3xl border border-gray-300 hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300"
                        >
                          {/* Decorative Background */}
                          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${gradient} opacity-10 rounded-full -mr-32 -mt-32`}></div>
                          <div className="relative z-10 p-6">
                            {/* Course Title */}
                            <div className="flex items-start gap-3 mb-3">
                              <div className="flex-1">
                                <h3 className="text-xl font-black text-[#222C7B]">{course.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                  <span className="font-medium">Mentor:</span>
                                  <span className="font-bold text-[#1758E6]">{course.mentor_name}</span>
                                </div>
                              </div>
                            </div>
                            {/* Progress Section */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-300 mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                  Progress:
                                </span>
                                <span className="text-lg font-black text-[#222C7B]">{progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
                                <div
                                  className={`h-full bg-[#319BFF] rounded-full transition-all duration-500 relative`}
                                  style={{ width: `${progress}%` }}
                                >
                                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 font-medium">
                                {course.completed_materials || 0} / {course.materials_count || 0} materi selesai ✨
                              </p>
                            </div>
                            {/* Action Buttons - now below progress */}
                            <div className="flex flex-col md:flex-row gap-3 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (!course.id) return;
                                  router.push(`/courses/${course.id}/learn`);
                                }}
                                className={`group relative overflow-hidden px-6 py-3 bg-gradient-to-r ${gradient} text-white font-black rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                                type="button"
                                disabled={!course.id}
                              >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                  {progress > 0 ? (
                                    <>
                                      Lanjutkan
                                    </>
                                  ) : (
                                    <>
                                      Mulai
                                    </>
                                  )}
                                </span>
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              </button>
                              <ChatButton courseId={course.id} courseName={course.title} size="md" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Empty state if no courses (shouldn't happen here, but for safety) */}
                  {courses.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Belum ada kursus diikuti. <Link href="/courses" className="text-indigo-600 font-semibold hover:underline">Jelajahi Kursus</Link>
                    </div>
                  )}
                </div>
              )}

              {/* XP Progress Card - Clean Design */}
              {gamificationStats && (
                <div className="relative bg-white border border-gray-300 rounded-xl p-6 overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl text-[#222C7B] font-semibold mb-1">Progress Belajar</h2>
                        {/* <p className="text-[#222C7B] text-sm">Level {gamificationStats.current_level} - {gamificationStats.level_name}</p> */}
                      </div>
                      <Link
                        href="/gamification/stats"
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-[#222C7B] text-sm font-medium transition-all backdrop-blur-sm"
                      >
                        Detail →
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

              {/* Learning Stats - Enhanced Design */}
              <div className="grid grid-cols-2 gap-4">
                <div className="group relative bg-white rounded-xl p-6 border border-gray-300 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/30 rounded-full -mr-12 -mt-12"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stats?.totalEnrolled || 0}</p>
                    <p className="text-sm font-medium text-gray-600">Kursus Diikuti</p>
                  </div>
                </div>

                <div className="group relative bg-white rounded-xl p-6 border border-gray-300 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-200/30 rounded-full -mr-12 -mt-12"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stats?.totalCompleted || 0}</p>
                    <p className="text-sm font-medium text-gray-600">Kursus Selesai</p>
                  </div>
                </div>
              </div>

              {/* Progress Overview - Enhanced Design */}
              <div className="bg-white rounded-xl p-6 border border-gray-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Progress Keseluruhan</h3>
                  <div className="ml-auto">
                    <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {stats?.progressPercentage || 0}%
                    </span>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-2 shadow-inner">
                    <div
                      className="bg-[#1758E6] h-4 rounded-full transition-all duration-700 relative overflow-hidden"
                      style={{ width: `${stats?.progressPercentage || 0}%` }}
                    >
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span className="font-medium">Target: 100%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {/* <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200/50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <p className="text-xs font-medium text-gray-600">Kursus Diikuti</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalEnrolled || 0}</p>
                  </div> */}
                  {/* <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200/50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-xs font-medium text-gray-600">Kursus Selesai</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{stats?.totalCompleted || 0}</p>
                  </div> */}
                </div>
              </div>

              {/* Quick Actions - Enhanced Design */}
              {false && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Aksi Cepat</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => router.push('/courses')}
                    className="group relative p-5 text-left rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:shadow-lg bg-white hover:bg-gradient-to-br hover:from-indigo-50 hover:to-blue-50 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-100 rounded-full -mr-10 -mt-10 group-hover:bg-indigo-200 transition-colors"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <p className="font-bold text-gray-900 text-sm mb-1">Jelajahi Kursus</p>
                      <p className="text-xs text-gray-500">Temukan kursus baru</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/my-courses')}
                    className="group relative p-5 text-left rounded-xl border-2 border-gray-200 hover:border-green-400 hover:shadow-lg bg-white hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full -mr-10 -mt-10 group-hover:bg-green-200 transition-colors"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <p className="font-bold text-gray-900 text-sm mb-1">Kursus Saya</p>
                      <p className="text-xs text-gray-500">Lanjutkan belajar</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/gamification/leaderboard')}
                    className="group relative p-5 text-left rounded-xl border-2 border-gray-200 hover:border-amber-400 hover:shadow-lg bg-white hover:bg-gradient-to-br hover:from-amber-50 hover:to-yellow-50 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-100 rounded-full -mr-10 -mt-10 group-hover:bg-amber-200 transition-colors"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <p className="font-bold text-gray-900 text-sm mb-1">Leaderboard</p>
                      <p className="text-xs text-gray-500">Lihat ranking</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/gamification/stats')}
                    className="group relative p-5 text-left rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-full -mr-10 -mt-10 group-hover:bg-purple-200 transition-colors"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.539 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <p className="font-bold text-gray-900 text-sm mb-1">Gamifikasi</p>
                      <p className="text-xs text-gray-500">XP & badges</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/chat/mentors')}
                    className="group relative p-5 text-left rounded-xl border-2 border-gray-200 hover:border-cyan-400 hover:shadow-lg bg-white hover:bg-gradient-to-br hover:from-cyan-50 hover:to-blue-50 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-100 rounded-full -mr-10 -mt-10 group-hover:bg-cyan-200 transition-colors"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="font-bold text-gray-900 text-sm mb-1">Chat Mentor</p>
                      <p className="text-xs text-gray-500">Tanya jawab</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/profile')}
                    className="group relative p-5 text-left rounded-xl border-2 border-gray-200 hover:border-gray-400 hover:shadow-lg bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-slate-50 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gray-100 rounded-full -mr-10 -mt-10 group-hover:bg-gray-200 transition-colors"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p className="font-bold text-gray-900 text-sm mb-1">Profile</p>
                      <p className="text-xs text-gray-500">Edit profil</p>
                    </div>
                  </button>
                </div>
              </div>
              )}
            </div>

            {/* Right Sidebar - Achievements and Stats */}
            <div className="lg:col-span-4 space-y-6">
              {/* Achievement Summary - Polished Design */}
              {gamificationStats && (
                <div className="bg-gradient-to-br from-white via-purple-50/40 to-indigo-50/30 rounded-xl p-5 border border-gray-300">
                  {/* Header */}
                  <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-purple-100/50">
                    <h3 className="text-base font-bold text-[#222C7B]">Pencapaian</h3>
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
                    <div className="bg-emerald-500 rounded-xl p-4 hover:shadow-xl transition-all duration-300 overflow-hidden relative border border-emerald-400/30">
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
                      <div className="bg-[#1758E6] rounded-xl p-4 hover:shadow-xl transition-all duration-300 overflow-hidden relative border border-indigo-400/30">
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
                      className="block w-full text-center px-4 py-2.5 bg-[#1758E6] text-white rounded-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 font-semibold transition-all hover:shadow-lg text-sm"
                    >
                      Lihat Detail →
                    </Link>
                  </div>
                </div>
              )}

              {/* Additional Stats - Enhanced Design */}
              <div className="bg-white rounded-xl p-6 border border-gray-300">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-100/50">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Statistik</h3>
                </div>
                <div className="space-y-4">
                  <div className="group relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200/50 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-200/30 rounded-full -mr-8 -mt-8"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total XP</p>
                          <p className="text-xl font-bold text-amber-700">{stats?.totalXP?.toLocaleString() || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-200/50 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-200/30 rounded-full -mr-8 -mt-8"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Level Saat Ini</p>
                          <p className="text-xl font-bold text-indigo-700">{stats?.currentLevel || 1}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-xl p-4 border-2 border-emerald-200/50 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-200/30 rounded-full -mr-8 -mt-8"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Badges</p>
                          <p className="text-xl font-bold text-emerald-700">{stats?.totalBadges || 0}</p>
                        </div>
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

