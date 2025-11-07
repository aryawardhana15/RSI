'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import StatCard from '@/components/StatCard';
import ProtectedRoute from '@/components/ProtectedRoute';

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

    // Fetch pelajar stats
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/pelajar');
        if (response.data.success) {
          setStats(response.data.data);
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
            <h1 className="text-3xl font-bold text-gray-900">
              Selamat Datang, {user?.name}! 👋
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Berikut adalah ringkasan progress belajar Anda
            </p>
          </div>

          {/* Stats Grid */}
          <div className="px-4 sm:px-0">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Kursus Diikuti"
                value={stats?.totalEnrolled || 0}
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
                color="blue"
                description="Total kursus yang Anda ikuti"
              />

              <StatCard
                title="Kursus Selesai"
                value={stats?.totalCompleted || 0}
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="green"
                description={`${stats?.progressPercentage || 0}% dari total kursus`}
              />

              <StatCard
                title="Total XP"
                value={stats?.totalXP || 0}
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
                color="yellow"
                description={`Level ${stats?.currentLevel || 1}`}
              />

              <StatCard
                title="Level"
                value={stats?.currentLevel || 1}
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                }
                color="purple"
                description={`${stats?.totalXP || 0} XP earned`}
              />

              <StatCard
                title="Badges"
                value={stats?.totalBadges || 0}
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                }
                color="red"
                description="Achievement badges"
              />

              <StatCard
                title="Progress"
                value={`${stats?.progressPercentage || 0}%`}
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                color="blue"
                description="Overall completion"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 px-4 sm:px-0">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button
                onClick={() => router.push('/courses')}
                className="relative block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <h3 className="text-lg font-medium text-gray-900">Jelajahi Kursus</h3>
                <p className="mt-2 text-sm text-gray-600">Temukan kursus baru</p>
              </button>

              <button
                onClick={() => router.push('/my-courses')}
                className="relative block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <h3 className="text-lg font-medium text-gray-900">Kursus Saya</h3>
                <p className="mt-2 text-sm text-gray-600">Lanjutkan belajar</p>
              </button>

              <button
                onClick={() => router.push('/leaderboard')}
                className="relative block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <h3 className="text-lg font-medium text-gray-900">Leaderboard</h3>
                <p className="mt-2 text-sm text-gray-600">Lihat ranking</p>
              </button>

              <button
                onClick={() => router.push('/profile')}
                className="relative block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <h3 className="text-lg font-medium text-gray-900">Profile</h3>
                <p className="mt-2 text-sm text-gray-600">Edit profil Anda</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
