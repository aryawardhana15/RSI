'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import MissionCard from '@/components/MissionCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Mission } from '@/types/gamification';
import Link from 'next/link';

export default function MissionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'achievement'>('all');

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await api.get('/gamification/missions');
        if (response.data.success) {
          setMissions(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch missions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'pelajar') {
      fetchMissions();
    }
  }, [user]);

  const filteredMissions = missions.filter(m => filter === 'all' || m.type === filter);
  const dailyMissions = missions.filter(m => m.type === 'daily');
  const weeklyMissions = missions.filter(m => m.type === 'weekly');
  const achievementMissions = missions.filter(m => m.type === 'achievement');

  const completedDaily = dailyMissions.filter(m => m.is_completed).length;
  const completedWeekly = weeklyMissions.filter(m => m.is_completed).length;
  const completedAchievement = achievementMissions.filter(m => m.is_completed).length;

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
                <h1 className="text-3xl font-bold text-gray-900">Missions</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Selesaikan missions untuk mendapatkan XP dan badges
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
                  href="/gamification/leaderboard"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Leaderboard
                </Link>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mt-4 flex space-x-2 border-b">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 font-medium text-sm border-b-2 ${
                  filter === 'all'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Semua ({missions.length})
              </button>
              <button
                onClick={() => setFilter('daily')}
                className={`px-4 py-2 font-medium text-sm border-b-2 ${
                  filter === 'daily'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Harian ({completedDaily}/{dailyMissions.length})
              </button>
              <button
                onClick={() => setFilter('weekly')}
                className={`px-4 py-2 font-medium text-sm border-b-2 ${
                  filter === 'weekly'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Mingguan ({completedWeekly}/{weeklyMissions.length})
              </button>
              <button
                onClick={() => setFilter('achievement')}
                className={`px-4 py-2 font-medium text-sm border-b-2 ${
                  filter === 'achievement'
                    ? 'border-yellow-600 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Pencapaian ({completedAchievement}/{achievementMissions.length})
              </button>
            </div>
          </div>

          {/* Missions Grid */}
          <div className="px-4 sm:px-0">
            {filteredMissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMissions.map((mission) => (
                  <MissionCard key={mission.mission_id} mission={mission} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">Tidak ada missions untuk ditampilkan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

