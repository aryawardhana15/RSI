'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import StatCard from '@/components/StatCard';
import ProtectedRoute from '@/components/ProtectedRoute';

interface AdminStats {
  totalPelajar: number;
  totalMentor: number;
  totalMentorVerified: number;
  totalMentorPending: number;
  totalUsers: number;
  totalCourses: number;
  totalCoursesPublished: number;
  totalEnrollments: number;
  totalForumPosts: number;
  pendingReports: number;
  newUsersLast30Days: number;
  newCoursesLast30Days: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-slate-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const userGrowthPercentage = stats?.totalUsers ? ((stats.newUsersLast30Days / stats.totalUsers) * 100).toFixed(1) : '0';
  const mentorVerificationRate = stats?.totalMentor ? ((stats.totalMentorVerified / stats.totalMentor) * 100).toFixed(1) : '0';
  const coursePublishRate = stats?.totalCourses ? ((stats.totalCoursesPublished / stats.totalCourses) * 100).toFixed(1) : '0';

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Modern Header with Glassmorphism */}
          <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl"></div>
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/20 blur-3xl"></div>
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-purple-400/30 blur-2xl"></div>
            
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-blue-100 text-sm mt-1">Welcome back, {user?.name || 'Admin'}</p>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="text-right">
                  <p className="text-blue-100 text-sm">Current Date</p>
                  <p className="text-white font-semibold text-lg">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid Layout - Mixed Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Left Column - Key Metrics */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Top Stats Bar - Horizontal Layout */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{stats?.totalUsers || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Total Users</p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{stats?.totalPelajar || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Students</p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                      <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{stats?.totalMentor || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Mentors</p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{stats?.totalCourses || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Courses</p>
                </div>
              </div>

              {/* Platform Overview - Table Style */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-800">Platform Overview</h2>
                  <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Live Data</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Published Courses</p>
                        <p className="text-xs text-slate-500">Active learning materials</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-800">{stats?.totalCoursesPublished || 0}</p>
                      <p className="text-xs text-green-600 font-medium">{coursePublishRate}% of total</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Total Enrollments</p>
                        <p className="text-xs text-slate-500">Student registrations</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-800">{stats?.totalEnrollments || 0}</p>
                      <p className="text-xs text-slate-500">Course registrations</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Verified Mentors</p>
                        <p className="text-xs text-slate-500">Approved instructors</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-800">{stats?.totalMentorVerified || 0}</p>
                      <p className="text-xs text-purple-600 font-medium">{mentorVerificationRate}% verified</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Growth Metrics - Progress Bars */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 mb-6">Growth Metrics</h2>
                
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">New Users (30 days)</span>
                      <span className="text-sm font-bold text-blue-600">{stats?.newUsersLast30Days || 0}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(Number(userGrowthPercentage) * 5, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{userGrowthPercentage}% of total users</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">New Courses (30 days)</span>
                      <span className="text-sm font-bold text-green-600">{stats?.newCoursesLast30Days || 0}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats?.totalCourses ? Math.min((stats.newCoursesLast30Days / stats.totalCourses) * 500, 100) : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Recent additions</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Course Publish Rate</span>
                      <span className="text-sm font-bold text-purple-600">{coursePublishRate}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${coursePublishRate}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Published vs Total courses</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Actions & Alerts */}
            <div className="space-y-6">
              
              {/* Alert Cards - Stacked Vertical */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-md border border-amber-200">
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 mb-1">Pending Mentor Verification</h3>
                    <p className="text-sm text-amber-700 mb-3">{stats?.totalMentorPending || 0} mentors waiting for approval</p>
                    <button
                      onClick={() => router.push('/admin/mentors')}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Review Mentors
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 shadow-md border border-red-200">
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-1">Pending Reports</h3>
                    <p className="text-sm text-red-700 mb-3">{stats?.pendingReports || 0} reports need moderation</p>
                    <button
                      onClick={() => router.push('/admin/reports')}
                      className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Review Reports
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions List */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push('/admin/users')}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 text-sm">Manage Users</p>
                      <p className="text-xs text-slate-500">{stats?.totalUsers || 0} users</p>
                    </div>
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => router.push('/admin/courses')}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 text-sm">Manage Courses</p>
                      <p className="text-xs text-slate-500">{stats?.totalCourses || 0} courses</p>
                    </div>
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => router.push('/admin/logs')}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                      <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 text-sm">Admin Logs</p>
                      <p className="text-xs text-slate-500">View activity</p>
                    </div>
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-md border border-emerald-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <h3 className="font-semibold text-emerald-900">System Status</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-emerald-700">Platform</span>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-emerald-700">Database</span>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-emerald-700">API Services</span>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats - Minimal Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800">{stats?.totalForumPosts || 0}</p>
                  <p className="text-xs text-slate-500">Forum Posts</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800">{stats?.totalMentorPending || 0}</p>
                  <p className="text-xs text-slate-500">Pending</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800">{stats?.totalMentorVerified || 0}</p>
                  <p className="text-xs text-slate-500">Verified</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800">{userGrowthPercentage}%</p>
                  <p className="text-xs text-slate-500">Growth</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}