'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import BadgeCard from '@/components/BadgeCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Badge } from '@/types/gamification';
import Link from 'next/link';

export default function BadgesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await api.get('/gamification/badges');
        if (response.data.success) {
          setBadges(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch badges:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'pelajar') {
      fetchBadges();
    }
  }, [user]);

  const earnedBadges = badges.filter(b => b.earned);
  const lockedBadges = badges.filter(b => !b.earned);

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
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                        Badges
                      </h1>
                    </div>
                    <p className="text-xl text-white/90 font-medium">
                      Koleksi semua badge dan buktikan pencapaianmu! 🎯
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/gamification/stats"
                      className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white font-black rounded-xl hover:bg-white/30 transition-all transform hover:scale-105 border-2 border-white/30"
                    >
                      📊 Stats
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

                {/* Stats - Fun Design */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border-2 border-white/30">
                    <span className="text-sm text-white/90 font-medium">Total: </span>
                    <span className="text-2xl font-black text-white">{badges.length}</span>
                  </div>
                  <div className="bg-green-500/80 backdrop-blur-sm rounded-2xl px-6 py-3 border-2 border-white/30">
                    <span className="text-sm text-white/90 font-medium">✅ Didapat: </span>
                    <span className="text-2xl font-black text-white">{earnedBadges.length}</span>
                  </div>
                  <div className="bg-gray-500/80 backdrop-blur-sm rounded-2xl px-6 py-3 border-2 border-white/30">
                    <span className="text-sm text-white/90 font-medium">🔒 Terkunci: </span>
                    <span className="text-2xl font-black text-white">{lockedBadges.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Earned Badges */}
          {earnedBadges.length > 0 && (
            <div className="px-4 sm:px-0 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">✨</span>
                <h2 className="text-2xl font-black text-gray-900">Badges yang Didapat</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {earnedBadges.map((badge) => (
                  <BadgeCard key={badge.badge_id} badge={badge} />
                ))}
              </div>
            </div>
          )}

          {/* Locked Badges */}
          {lockedBadges.length > 0 && (
            <div className="px-4 sm:px-0">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🔒</span>
                <h2 className="text-2xl font-black text-gray-900">Badges Terkunci</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {lockedBadges.map((badge) => (
                  <BadgeCard key={badge.badge_id} badge={badge} />
                ))}
              </div>
            </div>
          )}

          {badges.length === 0 && (
            <div className="px-4 sm:px-0">
              <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border-4 border-white/50">
                <div className="text-6xl mb-4">🏆</div>
                <p className="text-xl text-gray-600 font-bold">Belum ada badges tersedia</p>
                <p className="text-sm text-gray-500 mt-2">Mulai belajar untuk dapatkan badges!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

