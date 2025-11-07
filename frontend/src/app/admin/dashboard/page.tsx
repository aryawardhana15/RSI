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
  totalUsers: number;
  pendingMentors: number;
  totalCourses: number;
  totalEnrollments: number;
  pendingReports: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/admin');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Platform Management & Statistics
            </p>
          </div>

          {/* Stats Grid */}
          <div className="px-4 sm:px-0">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Users"
                value={stats?.totalUsers || 0}
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
                color="blue"
                description="Total registered users"
              />

              <StatCard
                title="Total Pelajar"
                value={stats?.totalPelajar || 0}
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                }
                color="green"
                description="Active students"
              />

              <StatCard
                title="Total Mentor"
                value={stats?.totalMentor || 0}
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
                color="purple"
                description="Verified mentors"
              />

              <StatCard
                title="Pending Mentors"
                value={stats?.pendingMentors || 0}
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="yellow"
                description="Awaiting verification"
              />

              <StatCard
                title="Total Courses"
                value={stats?.totalCourses || 0}
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
                color="blue"
                description="All courses"
              />

              <StatCard
                title="Total Enrollments"
                value={stats?.totalEnrollments || 0}
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                }
                color="green"
                description="Course enrollments"
              />

              <StatCard
                title="Pending Reports"
                value={stats?.pendingReports || 0}
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                }
                color="red"
                description="Need moderation"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 px-4 sm:px-0">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button
                onClick={() => router.push('/admin/mentors')}
                className="relative block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Verify Mentors</h3>
                  {stats && stats.pendingMentors > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {stats.pendingMentors}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-600">Review pending mentors</p>
              </button>

              <button
                onClick={() => router.push('/admin/users')}
                className="relative block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <h3 className="text-lg font-medium text-gray-900">Manage Users</h3>
                <p className="mt-2 text-sm text-gray-600">View all users</p>
              </button>

              <button
                onClick={() => router.push('/admin/courses')}
                className="relative block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <h3 className="text-lg font-medium text-gray-900">Manage Courses</h3>
                <p className="mt-2 text-sm text-gray-600">Monitor courses</p>
              </button>

              <button
                onClick={() => router.push('/admin/reports')}
                className="relative block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Moderation</h3>
                  {stats && stats.pendingReports > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {stats.pendingReports}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-600">Review reports</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

