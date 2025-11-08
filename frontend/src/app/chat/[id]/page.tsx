'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ChatBubble from '@/components/ChatBubble';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Message } from '@/types/chat';

interface ChatInfo {
  id: number;
  mentor_name?: string;
  pelajar_name?: string;
  course_title?: string;
  course_id?: number | null;
}

export default function ChatRoomPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const chatId = params?.id;
  const courseName = searchParams?.get('course');
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (chatId) {
      fetchChatInfo();
      fetchMessages();
      startPolling();
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [chatId]);

  const fetchChatInfo = async () => {
    try {
      const response = await api.get('/chats');
      if (response.data.success) {
        const chats = response.data.data;
        const currentChat = chats.find((chat: ChatInfo) => chat.id === parseInt(chatId as string));
        if (currentChat) {
          setChatInfo(currentChat);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch chat info:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (silent: boolean = false) => {
    try {
      if (!silent) setIsLoading(true);
      
      const response = await api.get(`/chats/${chatId}/messages`);
      
      if (response.data.success) {
        setMessages(response.data.data);
        
        // Mark as read
        await api.put(`/chats/${chatId}/read`);
      }
    } catch (error: any) {
      if (!silent) {
        toast.error('Gagal memuat pesan');
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const startPolling = () => {
    // Poll for new messages every 3 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages(true);
    }, 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const response = await api.post(`/chats/${chatId}/messages`, {
        content: newMessage.trim()
      });

      if (response.data.success) {
        setNewMessage('');
        fetchMessages(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengirim pesan');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditMessage = async (messageId: number, newContent: string) => {
    try {
      const response = await api.put(`/chats/messages/${messageId}`, {
        content: newContent
      });

      if (response.data.success) {
        toast.success('Pesan berhasil diubah');
        fetchMessages(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengubah pesan');
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      const response = await api.delete(`/chats/messages/${messageId}`);

      if (response.data.success) {
        toast.success('Pesan berhasil dihapus');
        fetchMessages(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus pesan');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
          <Navbar />
          <div className="flex flex-col justify-center items-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            </div>
            <p className="mt-4 text-purple-600 font-medium animate-pulse">Memuat percakapan...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col">
        <Navbar />

        {/* Chat Header dengan dekorasi lucu */}
        <div className="bg-white border-b-4 border-purple-200 px-4 py-4 shadow-md relative overflow-hidden">
          {/* Dekorasi background */}
          <div className="absolute top-0 left-0 w-full h-full opacity-5">
            <div className="absolute top-2 left-10 text-4xl">📖</div>
            <div className="absolute top-3 right-20 text-3xl">✏️</div>
            <div className="absolute bottom-2 left-1/4 text-3xl">🎓</div>
            <div className="absolute bottom-3 right-1/3 text-4xl">💡</div>
          </div>
          
          <div className="flex items-center relative z-10">
            <button
              onClick={() => {
                if (user?.role === 'pelajar') {
                  router.push(chatInfo?.course_id ? '/my-courses' : '/chat/mentors');
                } else {
                  router.push('/mentor/chat');
                }
              }}
              className="mr-3 p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-all duration-300 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Avatar lucu */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center text-2xl shadow-lg mr-3 border-3 border-white">
              {user?.role === 'pelajar' ? '👨‍🏫' : '👨‍🎓'}
            </div>
            
            <div className="flex-1">
              <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {chatInfo?.course_title 
                  ? `📚 ${chatInfo.course_title}` 
                  : user?.role === 'pelajar' 
                    ? `Chat dengan ${chatInfo?.mentor_name || 'Mentor'}`
                    : `Chat dengan ${chatInfo?.pelajar_name || 'Pelajar'}`
                }
              </h2>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                {user?.role === 'pelajar' 
                  ? chatInfo?.mentor_name || 'Mentor'
                  : chatInfo?.pelajar_name || 'Pelajar'
                }
              </p>
            </div>
            
            {/* Fun facts bubble */}
            <div className="hidden md:flex items-center gap-2 bg-yellow-50 border-2 border-yellow-200 rounded-full px-4 py-2">
              <span className="text-xl">💡</span>
              <span className="text-xs font-medium text-yellow-700">Belajar sambil ngobrol!</span>
            </div>
          </div>
        </div>

        {/* Messages Container dengan pattern background */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 relative" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              {/* Ilustrasi lucu untuk empty state */}
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-6xl">💬</span>
                </div>
              </div>
              
              <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-purple-100 max-w-md text-center">
                <p className="text-xl font-bold text-gray-800 mb-2">Belum ada pesan nih! 🤔</p>
                <p className="text-gray-600 mb-4">Yuk mulai percakapan seru dan penuh ilmu!</p>
                
                {/* Tips belajar lucu */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200">
                  <p className="text-sm font-semibold text-purple-700 mb-2">💡 Tips Belajar Efektif:</p>
                  <p className="text-xs text-gray-700">Jangan malu bertanya! Setiap pertanyaan adalah langkah menuju pemahaman yang lebih baik 🚀</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  message={message}
                  isSentByCurrentUser={message.sender_id === user?.id}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input dengan desain menarik */}
        <div className="bg-white border-t-4 border-purple-200 px-4 py-4 shadow-lg">
          {/* Motivasi singkat */}
          <div className="mb-3 flex items-center justify-center gap-2 text-xs text-gray-600">
            <span>🌟</span>
            <span>Komunikasi yang baik adalah kunci pembelajaran yang efektif!</span>
            <span>🌟</span>
          </div>
          
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pertanyaan atau pesan di sini... 💭"
                rows={1}
                className="block w-full px-5 py-3 pr-12 border-3 border-purple-200 rounded-3xl resize-none focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-400 shadow-sm transition-all duration-300 bg-gradient-to-r from-white to-purple-50"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              {/* Emoji dekoratif */}
              <div className="absolute right-4 bottom-3 text-xl opacity-30">
                ✍️
              </div>
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={isSending || !newMessage.trim()}
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-300 hover:scale-110 disabled:hover:scale-100"
            >
              {isSending ? (
                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span className="text-2xl">🚀</span>
              )}
            </button>
          </div>
          
          <div className="mt-3 flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-gray-500">
              <span className="font-medium">Enter</span>
              <span>→ Kirim</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-1 text-gray-500">
              <span className="font-medium">Shift + Enter</span>
              <span>→ Baris baru</span>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}