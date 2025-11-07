'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Mentor {
  id: number;
  name: string;
  email: string;
  photo_url?: string;
  bio?: string;
  expertise?: string;
  experience?: string;
  created_at: string;
}

export default function MentorsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingChat, setIsStartingChat] = useState<number | null>(null);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/users/mentors');
      
      if (response.data.success) {
        setMentors(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        return;
      }
      toast.error(error.response?.data?.message || 'Gagal memuat mentor');
      setMentors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async (mentorId: number) => {
    setIsStartingChat(mentorId);
    try {
      const response = await api.post('/chats', { mentor_id: mentorId });
      
      if (response.data.success) {
        const chatId = response.data.data.id;
        router.push(`/chat/${chatId}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memulai chat');
    } finally {
      setIsStartingChat(null);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['pelajar']}>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
          <Navbar />
          <div className="flex flex-col justify-center items-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">👨‍🏫</span>
              </div>
            </div>
            <p className="mt-4 text-purple-600 font-medium animate-pulse">Mencari mentor terbaik...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['pelajar']}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header dengan dekorasi */}
          <div className="px-4 py-8 sm:px-0 relative">
            {/* Dekorasi background */}
            <div className="absolute top-0 left-0 right-0 h-full opacity-10 pointer-events-none">
              <div className="absolute top-4 left-10 text-6xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}>🎓</div>
              <div className="absolute top-8 right-20 text-5xl animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3s'}}>📚</div>
              <div className="absolute top-16 left-1/3 text-4xl animate-bounce" style={{animationDelay: '1s', animationDuration: '3s'}}>✨</div>
              <div className="absolute top-12 right-1/4 text-5xl animate-bounce" style={{animationDelay: '1.5s', animationDuration: '3s'}}>💡</div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-yellow-100 border-2 border-yellow-300 rounded-full px-6 py-2 mb-4">
                <span className="text-2xl animate-pulse">🌟</span>
                <span className="text-sm font-semibold text-yellow-800">Temukan Mentor Terbaik!</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 mb-4">
                Pilih Mentor Hebatmu! 🚀
              </h1>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border-3 border-purple-200">
                <p className="text-lg text-gray-700 leading-relaxed">
                  <span className="font-semibold text-purple-600">💬 Chat langsung</span> dengan mentor favoritmu! 
                  Tidak perlu terdaftar di kursus, <span className="font-semibold text-pink-600">gratis bertanya</span> kapan saja 
                  <span className="inline-block ml-1">🎉</span>
                </p>
                
                {/* Tips edukatif */}
                <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200">
                  <p className="text-sm font-semibold text-purple-700 mb-1">💡 Tips: Bertanya yang Efektif</p>
                  <p className="text-xs text-gray-700">Persiapkan pertanyaan dengan jelas, sampaikan dengan sopan, dan jangan ragu untuk bertanya lebih dalam!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State dengan ilustrasi lucu */}
          {mentors.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="max-w-md mx-auto">
                <div className="relative mb-8">
                  <div className="w-40 h-40 mx-auto bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center shadow-xl">
                    <span className="text-7xl">🔍</span>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-300 rounded-full px-4 py-2 shadow-lg">
                    <span className="text-2xl">❓</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-purple-100">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Belum Ada Mentor 😢</h3>
                  <p className="text-gray-600 mb-4">Sepertinya belum ada mentor yang terverifikasi saat ini</p>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border-2 border-blue-200">
                    <p className="text-sm font-semibold text-blue-700 mb-1">✨ Jangan khawatir!</p>
                    <p className="text-xs text-gray-700">Mentor baru akan segera bergabung. Cek kembali nanti ya!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mentors Grid dengan desain card yang lucu */}
          {mentors.length > 0 && (
            <div className="px-4 sm:px-0">
              {/* Info badge */}
              <div className="mb-6 flex justify-center">
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-md border-2 border-purple-200">
                  <span className="text-xl">👥</span>
                  <span className="text-sm font-medium text-gray-700">
                    {mentors.length} Mentor Siap Membantumu!
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {mentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="bg-white rounded-3xl shadow-lg border-3 border-purple-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  >
                    {/* Dekorasi corner */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-200 to-pink-200 rounded-bl-full opacity-50"></div>
                    <div className="absolute top-2 right-2 text-2xl opacity-50 group-hover:animate-spin">⭐</div>
                    
                    <div className="relative z-10">
                      {/* Avatar dengan border lucu */}
                      <div className="flex justify-center mb-4">
                        {mentor.photo_url ? (
                          <div className="relative">
                            <img
                              src={mentor.photo_url}
                              alt={mentor.name}
                              className="w-24 h-24 rounded-full object-cover border-4 border-gradient-to-r from-purple-400 to-pink-400 shadow-lg"
                            />
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-400 rounded-full border-3 border-white flex items-center justify-center">
                              <span className="text-sm">✓</span>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 flex items-center justify-center border-4 border-white shadow-lg">
                              <span className="text-4xl font-bold text-white">
                                {mentor.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-400 rounded-full border-3 border-white flex items-center justify-center">
                              <span className="text-sm">✓</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Mentor Info */}
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {mentor.name}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                          <span>📧</span>
                          <span className="truncate">{mentor.email}</span>
                        </p>
                      </div>

                      {/* Expertise dengan badge lucu */}
                      {mentor.expertise && (
                        <div className="mb-4">
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-3 border-2 border-purple-200">
                            <p className="text-xs font-bold text-purple-600 uppercase tracking-wide flex items-center gap-1 mb-1">
                              <span>🎯</span>
                              <span>Keahlian</span>
                            </p>
                            <p className="text-sm font-medium text-gray-800">
                              {mentor.expertise}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Bio */}
                      {mentor.bio && (
                        <div className="mb-4">
                          <div className="bg-blue-50 rounded-2xl p-3 border-2 border-blue-200">
                            <p className="text-xs text-gray-700 line-clamp-3 italic">
                              💬 "{mentor.bio}"
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Chat Button dengan desain fun */}
                      <button
                        onClick={() => handleStartChat(mentor.id)}
                        disabled={isStartingChat === mentor.id}
                        className="w-full px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                      >
                        {isStartingChat === mentor.id ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Memulai...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xl">💬</span>
                            <span>Mulai Chat Sekarang!</span>
                          </>
                        )}
                      </button>

                      {/* Fun fact */}
                      <div className="mt-3 text-center">
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                          <span>⚡</span>
                          <span>Respon cepat & ramah!</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom tips */}
              <div className="mt-12 max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-yellow-50 via-pink-50 to-purple-50 rounded-3xl p-6 border-3 border-yellow-200 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 text-4xl">
                      🎓
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-800 mb-2">Tips Belajar dengan Mentor 💡</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                        <div className="flex items-start gap-2">
                          <span className="text-xl">1️⃣</span>
                          <p><span className="font-semibold">Persiapkan pertanyaan</span> sebelum chat</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xl">2️⃣</span>
                          <p><span className="font-semibold">Bersikap sopan</span> dan terbuka</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xl">3️⃣</span>
                          <p><span className="font-semibold">Praktikkan</span> apa yang dipelajari</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}