'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { UserStats, Badge } from '@/types/gamification';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    photo_url: '',
    expertise: '',
    experience: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        photo_url: user.photo_url || '',
        expertise: user.expertise || '',
        experience: user.experience || ''
      });

      // Fetch gamification data for pelajar
      if (user.role === 'pelajar') {
        fetchGamificationData();
      }
    }
  }, [user]);

  const fetchGamificationData = async () => {
    try {
      const [statsResponse, badgesResponse] = await Promise.all([
        api.get('/gamification/stats').catch(() => ({ data: { success: false } })),
        api.get('/gamification/badges').catch(() => ({ data: { success: false } }))
      ]);

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
      if (badgesResponse.data.success) {
        setBadges(badgesResponse.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch gamification data:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await api.put('/auth/profile', formData);
      
      if (response.data.success) {
        setSuccess('Profile berhasil diperbarui! 🎉');
        updateUser(response.data.data);
        setTimeout(() => {
          setShowEditForm(false);
          setSuccess('');
        }, 2000);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Gagal memperbarui profile');
    } finally {
      setIsLoading(false);
    }
  };

  const earnedBadges = badges.filter(b => b.earned);
  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '⭐';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Profile Header - Fun Design */}
          <div className="relative mb-8 overflow-hidden bg-[#1758E6] rounded-xl p-8 shadow-lg border border-gray-100">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <div className="absolute top-4 right-4 text-6xl opacity-20">✨</div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-1 shadow-xl">
                    {user?.photo_url ? (
                      <img 
                        src={user.photo_url} 
                        alt={user.name} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-4xl font-black text-[#1758E6]">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-2 shadow-lg">
                    <span className="text-2xl">👤</span>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                    {user?.name || 'User'}
                  </h1>
                  <p className="text-xl text-white/90 mb-4 capitalize">
                    {user?.role === 'pelajar' ? '🎓 Pelajar' : user?.role === 'mentor' ? '👨‍🏫 Mentor' : '👑 Admin'}
                  </p>
                  
                  {/* Level & Rank for Pelajar */}
                  {user?.role === 'pelajar' && stats && (
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🎯</span>
                          <div>
                            <p className="text-xs text-white/90">Level</p>
                            <p className="text-xl font-black text-white">{stats.current_level}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">⭐</span>
                          <div>
                            <p className="text-xs text-white/90">XP</p>
                            <p className="text-xl font-black text-white">{stats.total_xp.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      {stats.rank > 0 && (
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getRankEmoji(stats.rank)}</span>
                            <div>
                              <p className="text-xs text-white/90">Ranking</p>
                              <p className="text-xl font-black text-white">#{stats.rank}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🏆</span>
                          <div>
                            <p className="text-xs text-white/90">Badges</p>
                            <p className="text-xl font-black text-white">{earnedBadges.length}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setShowEditForm(!showEditForm)}
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/30 transition-all transform hover:scale-105 border border-white/30 shadow-lg"
                >
                  {showEditForm ? '❌ Tutup' : '✏️ Edit Profile'}
                </button>
              </div>
            </div>
          </div>

          {/* Level Progress Bar for Pelajar */}
          {user?.role === 'pelajar' && stats && (
            <div className="bg-white rounded-2xl border border-gray-300 p-6 shadow-sm mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-[#222C7B] flex items-center gap-2">
                  <span className="text-2xl">📊</span> Progress Level
                </h3>
                <span className="text-sm font-semibold text-[#222C7B]">
                  Level {stats.current_level}: {stats.level_name}
                </span>
              </div>
              <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-[#319BFF] transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(stats.level_progress, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#222C7B] z-10">
                    {stats.level_progress}% menuju Level {stats.current_level + 1}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Badges Section for Pelajar */}
          {user?.role === 'pelajar' && earnedBadges.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-300 p-6 shadow-sm mb-8">
              <h3 className="text-xl font-bold text-[#222C7B] mb-4 flex items-center gap-2">
                <span className="text-2xl">🏆</span> Badges yang Didapat
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {earnedBadges.slice(0, 12).map((badge) => (
                  <div
                    key={badge.badge_id}
                    className="relative group cursor-pointer transform hover:scale-110 transition-all duration-300"
                  >
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 shadow-md border border-blue-300">
                      <div className="text-4xl text-center mb-2">🎖️</div>
                      <p className="text-xs font-bold text-center text-white line-clamp-2">
                        {badge.badge_name}
                      </p>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 shadow-lg">
                      <span className="text-xs text-white">✓</span>
                    </div>
                  </div>
                ))}
              </div>
              {earnedBadges.length > 12 && (
                <p className="text-center text-sm text-[#222C7B] mt-4 font-medium">
                  +{earnedBadges.length - 12} badges lainnya! 🎉
                </p>
              )}
            </div>
          )}

          {/* Edit Form */}
          {showEditForm && (
            <div className="bg-white rounded-2xl border border-gray-300 shadow-sm p-8 animate-fadeIn">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[#222C7B] mb-2 flex items-center gap-2">
                  <span className="text-3xl">✏️</span> Edit Profile
                </h2>
                <p className="text-[#222C7B]">Perbarui informasi profil Anda</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                  <p className="text-green-800 text-sm font-medium">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span>👤</span> Nama Lengkap
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1758E6] focus:border-[#1758E6] outline-none transition-all"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span>📧</span> Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1758E6] focus:border-[#1758E6] outline-none transition-all"
                    placeholder="Masukkan email"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span>📝</span> Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none"
                    placeholder="Ceritakan tentang diri Anda..."
                  />
                </div>

                {/* Photo URL */}
                <div>
                  <label htmlFor="photo_url" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span>🖼️</span> URL Foto Profil
                  </label>
                  <input
                    type="url"
                    id="photo_url"
                    name="photo_url"
                    value={formData.photo_url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1758E6] focus:border-[#1758E6] outline-none transition-all"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                {/* Expertise (for mentor) */}
                {user?.role === 'mentor' && (
                  <div>
                    <label htmlFor="expertise" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <span>🎯</span> Keahlian
                    </label>
                    <textarea
                      id="expertise"
                      name="expertise"
                      value={formData.expertise}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none"
                      placeholder="Daftar keahlian Anda..."
                    />
                  </div>
                )}

                {/* Experience (for mentor) */}
                {user?.role === 'mentor' && (
                  <div>
                    <label htmlFor="experience" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <span>💼</span> Pengalaman
                    </label>
                    <textarea
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none"
                      placeholder="Ceritakan pengalaman Anda..."
                    />
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setError('');
                      setSuccess('');
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 text-[#222C7B] rounded-xl hover:bg-gray-50 transition-all font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-[#1758E6] text-white rounded-xl hover:bg-[#1247CC] transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105"
                  >
                    {isLoading ? '💾 Menyimpan...' : '💾 Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Bio Display (when not editing) */}
          {!showEditForm && user?.bio && (
            <div className="bg-white rounded-2xl border border-gray-300 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#222C7B] mb-3 flex items-center gap-2">
                <span className="text-2xl">📖</span> Tentang Saya
              </h3>
              <p className="text-[#222C7B] leading-relaxed">{user.bio}</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
