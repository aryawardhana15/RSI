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
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Badges</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Koleksi semua badge dan buktikan pencapaian Anda
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

            {/* Stats */}
            <div className="mt-4 flex items-center space-x-4">
              <div className="bg-white rounded-lg px-4 py-2 shadow">
                <span className="text-sm text-gray-600">Total Badges: </span>
                <span className="font-bold text-gray-900">{badges.length}</span>
              </div>
              <div className="bg-green-50 rounded-lg px-4 py-2 shadow">
                <span className="text-sm text-green-600">Earned: </span>
                <span className="font-bold text-green-700">{earnedBadges.length}</span>
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2 shadow">
                <span className="text-sm text-gray-600">Locked: </span>
                <span className="font-bold text-gray-700">{lockedBadges.length}</span>
              </div>
            </div>
          </div>

          {/* Earned Badges */}
          {earnedBadges.length > 0 && (
            <div className="px-4 sm:px-0 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Badges yang Didapat</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {earnedBadges.map((badge) => (
                  <BadgeCard key={badge.badge_id} badge={badge} />
                ))}
              </div>
            </div>
          )}

          {/* Locked Badges */}
          {lockedBadges.length > 0 && (
            <div className="px-4 sm:px-0">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Badges Terkunci</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {lockedBadges.map((badge) => (
                  <BadgeCard key={badge.badge_id} badge={badge} />
                ))}
              </div>
            </div>
          )}

          {badges.length === 0 && (
            <div className="px-4 sm:px-0">
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">Belum ada badges tersedia</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

