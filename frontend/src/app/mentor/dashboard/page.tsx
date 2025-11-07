'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import StatCard from '@/components/StatCard';
import ProtectedRoute from '@/components/ProtectedRoute';

interface MentorStats {
  totalCourses: number;
  totalPublished: number;
  totalStudents: number;
  totalMaterials: number;
}

export default function MentorDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<MentorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/mentor');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'mentor') {
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
    <ProtectedRoute allowedRoles={['mentor']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Mentor
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Selamat datang kembali, {user?.name}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="px-4 sm:px-0">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Kursus"
                value={stats?.totalCourses || 0}
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
                color="blue"
                description="Kursus yang Anda buat"
              />

              <StatCard
                title="Published"
                value={stats?.totalPublished || 0}
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="green"
                description="Kursus yang dipublikasi"
              />

              <StatCard
                title="Total Pelajar"
                value={stats?.totalStudents || 0}
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
                color="purple"
                description="Pelajar di semua kursus"
              />

              <StatCard
                title="Total Materi"
                value={stats?.totalMaterials || 0}
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                color="yellow"
                description="Materi pembelajaran"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 px-4 sm:px-0">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button
                onClick={() => router.push('/mentor/courses/create')}
                className="relative block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <h3 className="text-lg font-medium text-gray-900">Buat Kursus</h3>
                <p className="mt-2 text-sm text-gray-600">Buat kursus baru</p>
              </button>

              <button
                onClick={() => router.push('/mentor/courses')}
                className="relative block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <h3 className="text-lg font-medium text-gray-900">Kursus Saya</h3>
                <p className="mt-2 text-sm text-gray-600">Kelola kursus</p>
              </button>

              <button
                onClick={() => router.push('/mentor/students')}
                className="relative block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <h3 className="text-lg font-medium text-gray-900">Pelajar</h3>
                <p className="mt-2 text-sm text-gray-600">Lihat pelajar</p>
              </button>

              <button
                onClick={() => router.push('/mentor/chat')}
                className="relative block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <h3 className="text-lg font-medium text-gray-900">Chat</h3>
                <p className="mt-2 text-sm text-gray-600">Pesan pelajar</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

