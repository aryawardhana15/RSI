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
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
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
              Chat dengan Pelajar
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Kelola percakapan dengan pelajar Anda
            </p>
          </div>

          {/* Empty State */}
          {chats.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada chat</h3>
              <p className="mt-1 text-sm text-gray-500">Pelajar akan muncul di sini ketika mereka mulai chat dengan Anda</p>
            </div>
          )}

          {/* Chats List */}
          {chats.length > 0 && (
            <div className="px-4 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {chats.map((chat) => (
                    <li 
                      key={chat.id}
                      onClick={() => handleChatClick(chat.id)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1 min-w-0">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              {chat.pelajar_photo ? (
                                <img
                                  src={chat.pelajar_photo}
                                  alt={chat.pelajar_name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-lg font-medium text-gray-600">
                                    {chat.pelajar_name?.charAt(0).toUpperCase() || 'P'}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Chat Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-medium text-gray-900 truncate">
                                    {chat.pelajar_name || 'Pelajar'}
                                  </h3>
                                  <div className="mt-1 flex items-center text-sm text-gray-500">
                                    {chat.course_title && (
                                      <span className="truncate mr-2">
                                        {chat.course_title}
                                      </span>
                                    )}
                                    {chat.course_title && chat.last_message && (
                                      <span className="mx-1">•</span>
                                    )}
                                    {chat.last_message && (
                                      <span className="truncate">
                                        {chat.last_message.length > 50 
                                          ? `${chat.last_message.substring(0, 50)}...` 
                                          : chat.last_message}
                                      </span>
                                    )}
                                    {!chat.last_message && !chat.course_title && (
                                      <span className="text-gray-400 italic">Belum ada pesan</span>
                                    )}
                                  </div>
                                </div>

                                {/* Time & Unread */}
                                <div className="flex flex-col items-end ml-4 flex-shrink-0">
                                  {chat.last_message_time && (
                                    <span className="text-xs text-gray-500 mb-1">
                                      {formatTime(chat.last_message_time)}
                                    </span>
                                  )}
                                  {(chat.unread_count ?? 0) > 0 ? (
                                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                                      {chat.unread_count! > 99 ? '99+' : chat.unread_count}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

