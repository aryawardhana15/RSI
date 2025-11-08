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
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header - Fun Design */}
          <div className="px-4 py-6 sm:px-0 mb-6">
            <div className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-3xl p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-5xl animate-bounce">🎮</span>
                      <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                        Statistik Gamifikasi
                      </h1>
                    </div>
                    <p className="text-xl text-white/90 font-medium">
                      Lihat progress dan pencapaianmu! 🏆
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/gamification/badges"
                      className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white font-black rounded-xl hover:bg-white/30 transition-all transform hover:scale-105 border-2 border-white/30"
                    >
                      🏆 Badges
                    </Link>
                    <Link
                      href="/gamification/missions"
                      className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white font-black rounded-xl hover:bg-white/30 transition-all transform hover:scale-105 border-2 border-white/30"
                    >
                      ✅ Missions
                    </Link>
                    <Link
                      href="/gamification/leaderboard"
                      className="px-5 py-2.5 bg-white text-orange-600 font-black rounded-xl hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg"
                    >
                      🥇 Leaderboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {stats && (
            <>
              {/* XP and Level Card - Fun Design */}
              <div className="px-4 sm:px-0 mb-6">
                <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl p-8 border-4 border-white/50 overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-4xl">⭐</span>
                      <h2 className="text-3xl font-black text-white">Level & XP</h2>
                    </div>
                    <XPBar
                      currentXP={stats.total_xp}
                      currentLevel={stats.current_level}
                      levelName={stats.level_name}
                      levelProgress={stats.level_progress}
                      nextLevelXP={stats.next_level_xp}
                      size="lg"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 border-2 border-white/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-3xl">⚡</span>
                          <p className="text-sm text-white/90 font-medium">Total XP</p>
                        </div>
                        <p className="text-3xl font-black text-white">{stats.total_xp.toLocaleString()}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 border-2 border-white/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-3xl">🏆</span>
                          <p className="text-sm text-white/90 font-medium">Total Badges</p>
                        </div>
                        <p className="text-3xl font-black text-white">{stats.total_badges}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 border-2 border-white/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-3xl">✅</span>
                          <p className="text-sm text-white/90 font-medium">Misi Selesai</p>
                        </div>
                        <p className="text-3xl font-black text-white">{stats.completed_missions}</p>
                      </div>
                    </div>

                    {stats.rank > 0 && (
                      <div className="mt-6 pt-6 border-t-2 border-white/30">
                        <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/30">
                          <div className="flex items-center gap-2">
                            <span className="text-3xl">🥇</span>
                            <span className="text-lg text-white/90 font-bold">Peringkat Global</span>
                          </div>
                          <span className="text-3xl font-black text-white">#{stats.rank}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent XP History - Fun Design */}
              <div className="px-4 sm:px-0">
                <div className="bg-white rounded-3xl shadow-2xl border-4 border-white/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">📜</span>
                      <h2 className="text-2xl font-black text-white">Riwayat XP Terbaru</h2>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {xpHistory.length > 0 ? (
                      xpHistory.map((entry, index) => (
                        <div key={entry.id} className="px-8 py-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-black shadow-lg">
                                <span className="text-xl">+</span>
                              </div>
                              <div>
                                <p className="text-base font-black text-gray-900">
                                  {formatReason(entry.reason)}
                                </p>
                                <p className="text-xs text-gray-500 font-medium mt-1">
                                  {new Date(entry.created_at).toLocaleString('id-ID')}
                                </p>
                              </div>
                            </div>
                            <div className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                              <span className="text-xl font-black text-white">
                                +{entry.xp_amount} XP
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-8 py-12 text-center">
                        <div className="text-6xl mb-4">📝</div>
                        <p className="text-lg text-gray-600 font-medium">Belum ada riwayat XP</p>
                        <p className="text-sm text-gray-500 mt-2">Mulai belajar untuk dapatkan XP!</p>
                      </div>
                    )}
                  </div>
                  {xpHistory.length > 0 && (
                    <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200 text-center">
                      <Link
                        href="/gamification/xp-history"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-black rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                      >
                        <span>📚</span>
                        Lihat Semua Riwayat XP
                        <span>→</span>
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

