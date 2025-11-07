'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import XPBar from '@/components/XPBar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { UserStats, XPHistory } from '@/types/gamification';
import Link from 'next/link';

export default function GamificationStatsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [xpHistory, setXpHistory] = useState<XPHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, historyResponse] = await Promise.all([
          api.get('/gamification/stats'),
          api.get('/gamification/xp-history?limit=10')
        ]);

        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        }
        if (historyResponse.data.success) {
          setXpHistory(historyResponse.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch gamification data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'pelajar') {
      fetchData();
    }
  }, [user]);

  const formatReason = (reason: string) => {
    const reasonMap: { [key: string]: string } = {
      'complete_material': 'Menyelesaikan Materi',
      'complete_course': 'Menyelesaikan Kursus',
      'submit_assignment': 'Submit Tugas',
      'forum_post': 'Post di Forum',
      'forum_reply': 'Reply di Forum',
      'perfect_quiz': 'Nilai Sempurna',
      'mission_completed': 'Misi Selesai',
      'graded_assignment': 'Tugas Dinilai'
    };
    return reasonMap[reason] || reason;
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
                <h1 className="text-3xl font-bold text-gray-900">Statistik Gamifikasi</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Lihat progress dan pencapaian Anda
                </p>
              </div>
              <div className="flex space-x-3">
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
          </div>

          {stats && (
            <>
              {/* XP and Level Card */}
              <div className="px-4 sm:px-0 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Level & XP</h2>
                    <XPBar
                      currentXP={stats.total_xp}
                      currentLevel={stats.current_level}
                      levelName={stats.level_name}
                      levelProgress={stats.level_progress}
                      nextLevelXP={stats.next_level_xp}
                      size="lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Total XP</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.total_xp.toLocaleString()}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Total Badges</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.total_badges}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Misi Selesai</p>
                      <p className="text-2xl font-bold text-green-600">{stats.completed_missions}</p>
                    </div>
                  </div>

                  {stats.rank > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Peringkat Global</span>
                        <span className="text-xl font-bold text-yellow-600">#{stats.rank}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent XP History */}
              <div className="px-4 sm:px-0">
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Riwayat XP Terbaru</h2>
                  </div>
                  <div className="divide-y">
                    {xpHistory.length > 0 ? (
                      xpHistory.map((entry) => (
                        <div key={entry.id} className="px-6 py-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatReason(entry.reason)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(entry.created_at).toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-green-600">
                              +{entry.xp_amount} XP
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-8 text-center text-gray-500">
                        Belum ada riwayat XP
                      </div>
                    )}
                  </div>
                  {xpHistory.length > 0 && (
                    <div className="px-6 py-4 border-t text-center">
                      <Link
                        href="/gamification/xp-history"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Lihat Semua Riwayat XP →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

