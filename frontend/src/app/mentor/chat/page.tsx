'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Chat } from '@/types/chat';

export default function MentorChatPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChats();
    // Poll untuk update unread count
    const interval = setInterval(fetchChats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchChats = async () => {
    try {
      const response = await api.get('/chats');
      
      if (response.data.success) {
        setChats(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        return;
      }
      toast.error(error.response?.data?.message || 'Gagal memuat chat');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const handleChatClick = (chatId: number) => {
    router.push(`/chat/${chatId}`);
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['mentor']}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Navbar />
          <div className="flex flex-col justify-center items-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-blue-600 font-medium animate-pulse">Memuat chat...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />

        <div className="max-w-6xl mx-auto py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="px-4 py-6 sm:px-0 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
            
            <div className="relative">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full text-white text-sm font-medium mb-3 shadow-lg">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Messages
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Chat dengan Pelajar 💬
              </h1>
              <p className="text-gray-600 text-lg">
                Kelola percakapan dengan pelajar Anda
              </p>

              {/* Stats Badge */}
              {chats.length > 0 && (
                <div className="mt-4 inline-flex items-center px-4 py-2 bg-white rounded-xl shadow-md border-2 border-blue-100">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700">
                        {chats.length} Percakapan Aktif
                      </span>
                    </div>
                    {chats.filter(c => (c.unread_count ?? 0) > 0).length > 0 && (
                      <>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-gradient-to-r from-red-500 to-pink-600 rounded-full text-white text-xs font-bold mr-2">
                            {chats.filter(c => (c.unread_count ?? 0) > 0).length}
                          </span>
                          <span className="text-sm font-medium text-gray-700">Pesan Baru</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Empty State */}
          {chats.length === 0 && (
            <div className="px-4 sm:px-0">
              <div className="relative bg-white rounded-3xl shadow-xl p-12 text-center overflow-hidden border-2 border-blue-100">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full filter blur-3xl opacity-20"></div>
                
                <div className="relative">
                  <div className="inline-block p-8 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mb-6">
                    <svg className="h-24 w-24 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Belum ada chat 📭</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Pelajar akan muncul di sini ketika mereka mulai chat dengan Anda. Pastikan untuk merespons dengan cepat!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chats List */}
          {chats.length > 0 && (
            <div className="px-4 sm:px-0 space-y-4">
              {chats.map((chat, index) => {
                const hasUnread = (chat.unread_count ?? 0) > 0;
                
                return (
                  <div
                    key={chat.id}
                    onClick={() => handleChatClick(chat.id)}
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border-2 border-blue-100 cursor-pointer transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Gradient Accent Line */}
                    {hasUnread && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 via-cyan-500 to-teal-500"></div>
                    )}

                    <div className="p-6">
                      <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {chat.pelajar_photo ? (
                            <img
                              src={chat.pelajar_photo}
                              alt={chat.pelajar_name}
                              className="w-16 h-16 rounded-full object-cover border-4 border-blue-100 group-hover:border-blue-200 transition-colors"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center border-4 border-blue-100 group-hover:border-blue-200 transition-colors">
                              <span className="text-2xl font-bold text-white">
                                {chat.pelajar_name?.charAt(0).toUpperCase() || 'P'}
                              </span>
                            </div>
                          )}
                          {/* Online Status Indicator */}
                          <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                        </div>

                        {/* Chat Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0 mr-4">
                              <h3 className={`text-xl font-bold truncate ${
                                hasUnread ? 'text-gray-900' : 'text-gray-700'
                              } group-hover:text-blue-600 transition-colors`}>
                                {chat.pelajar_name || 'Pelajar'}
                              </h3>
                              
                              {chat.course_title && (
                                <div className="mt-1 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
                                  <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                                  </svg>
                                  {chat.course_title}
                                </div>
                              )}
                            </div>

                            {/* Time & Unread Badge */}
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              {chat.last_message_time && (
                                <span className="text-xs font-medium text-gray-500">
                                  {formatTime(chat.last_message_time)}
                                </span>
                              )}
                              {hasUnread && (
                                <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-full shadow-lg animate-pulse">
                                  {chat.unread_count! > 99 ? '99+' : chat.unread_count}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Last Message */}
                          <div className="flex items-start mt-3">
                            {chat.last_message ? (
                              <div className={`flex-1 text-sm truncate ${
                                hasUnread ? 'font-semibold text-gray-900' : 'text-gray-600'
                              }`}>
                                <span className="inline-flex items-center">
                                  <svg className={`h-4 w-4 mr-2 flex-shrink-0 ${
                                    hasUnread ? 'text-blue-500' : 'text-gray-400'
                                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                  </svg>
                                  {chat.last_message.length > 70 
                                    ? `${chat.last_message.substring(0, 70)}...` 
                                    : chat.last_message}
                                </span>
                              </div>
                            ) : (
                              <div className="flex-1 text-sm text-gray-400 italic flex items-center">
                                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Belum ada pesan
                              </div>
                            )}
                            
                            {/* Arrow Icon */}
                            <svg className="h-5 w-5 ml-2 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hover Gradient Border Effect */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 opacity-50"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Help Text */}
          {chats.length > 0 && (
            <div className="px-4 sm:px-0 mt-8">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-bold text-gray-900">💡 Tips untuk Mentor</h3>
                    <p className="mt-1 text-sm text-gray-700">
                      Responsif dalam menjawab pertanyaan pelajar dapat meningkatkan engagement dan kepuasan mereka. Chat akan diperbarui secara otomatis setiap 10 detik.
                    </p>
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