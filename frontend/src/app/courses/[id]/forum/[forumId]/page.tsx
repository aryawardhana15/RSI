'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Forum, ForumReply, CreateReplyInput } from '@/types/forum';

export default function ForumDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id;
  const forumId = params?.forumId;
  const { user } = useAuth();
  const [forum, setForum] = useState<Forum | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<'forum' | 'reply'>('forum');
  const [reportContentId, setReportContentId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateReplyInput>();

  useEffect(() => {
    if (forumId) {
      fetchForum();
    }
  }, [forumId]);

  const fetchForum = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/forums/${forumId}`);
      if (response.data.success) {
        setForum(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        return;
      }
      toast.error('Gagal memuat forum');
      router.push(`/courses/${courseId}/forum`);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitReply = async (data: CreateReplyInput) => {
    if (!forumId) return;

    setIsSubmitting(true);
    try {
      const response = await api.post(`/forums/${forumId}/replies`, data);
      if (response.data.success) {
        toast.success(response.data.message);
        reset();
        fetchForum(); // Refresh to get new reply
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membuat reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeForum = async () => {
    if (!forumId) return;
    try {
      const response = await api.post(`/forums/${forumId}/like`);
      if (response.data.success) {
        fetchForum();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal like thread');
    }
  };

  const handleLikeReply = async (replyId: number) => {
    try {
      const response = await api.post(`/forums/replies/${replyId}/like`);
      if (response.data.success) {
        fetchForum();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal like reply');
    }
  };

  const handlePin = async () => {
    if (!forumId) return;
    try {
      const response = await api.put(`/forums/${forumId}/pin`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchForum();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal pin thread');
    }
  };

  const handleLock = async () => {
    if (!forumId) return;
    try {
      const response = await api.put(`/forums/${forumId}/lock`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchForum();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal lock thread');
    }
  };

  const handleDelete = async (type: 'forum' | 'reply', id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus?')) return;

    try {
      const endpoint = type === 'forum' ? `/forums/${id}` : `/forums/replies/${id}`;
      const response = await api.delete(endpoint);
      if (response.data.success) {
        toast.success('Berhasil dihapus');
        if (type === 'forum') {
          router.push(`/courses/${courseId}/forum`);
        } else {
          fetchForum();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus');
    }
  };

  const handleReport = async () => {
    if (!reportContentId || !reportReason.trim()) {
      toast.error('Alasan laporan wajib diisi');
      return;
    }

    try {
      const response = await api.post('/forums/report', {
        type: reportType,
        content_id: reportContentId,
        reason: reportReason
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setShowReportModal(false);
        setReportReason('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengirim laporan');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOwner = (userId: number) => user?.id === userId;
  const isMentor = user?.role === 'mentor';
  const canModerate = isOwner(forum?.user_id || 0) || isMentor || user?.role === 'admin';

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['pelajar', 'mentor']}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!forum) return null;

  return (
    <ProtectedRoute allowedRoles={['pelajar', 'mentor']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />

        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <button
              onClick={() => router.push(`/courses/${courseId}/forum`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Kembali ke Forum</span>
            </button>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-4">
                    {forum.is_pinned && (
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.5 16a3.5 3.5 0 01-1.41-6.705 3.5 3.5 0 016.705-1.41 3.5 3.5 0 016.705 1.41 3.5 3.5 0 01-1.41 6.705L5.5 16z" />
                        </svg>
                      </div>
                    )}
                    <h1 className="text-3xl font-bold text-gray-900">{forum.title}</h1>
                    {forum.is_locked && (
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                        {forum.author_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-700">{forum.author_name}</span>
                    </div>
                    <span className="text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{formatDate(forum.created_at)}</span>
                    {forum.tags && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-200">
                          {forum.tags}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {canModerate && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handlePin}
                      className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-amber-100 hover:text-amber-700 rounded-lg transition-all border border-gray-200 hover:border-amber-300"
                    >
                      {forum.is_pinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button
                      onClick={handleLock}
                      className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all border border-gray-200"
                    >
                      {forum.is_locked ? 'Unlock' : 'Lock'}
                    </button>
                    <button
                      onClick={() => handleDelete('forum', forum.id)}
                      className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all border border-red-200"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Forum Content */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-gray-100">
            <div className="prose max-w-none mb-6">
              <p className="whitespace-pre-wrap text-gray-700 text-lg leading-relaxed">{forum.content}</p>
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleLikeForum}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  forum.user_liked 
                    ? 'bg-blue-100 text-blue-600 border-2 border-blue-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a1 1 0 001.707.707l3.546-3.547a1 1 0 00.293-.707V10.333a1 1 0 00-1-1h-3.333a1 1 0 00-1 1zM15.818 3.482a1.5 1.5 0 010 2.828L11.177 10.9a1.5 1.5 0 01-2.121 0l-.707-.707a1.5 1.5 0 012.121-2.121l.354.353 5.657-5.657a1.5 1.5 0 012.121 0zm-6.364 5.657L4.879 7.879a1.5 1.5 0 00-2.121 2.121l6.364 6.364a1.5 1.5 0 002.121 0l6.364-6.364a1.5 1.5 0 00-2.121-2.121l-5.657 5.657z" />
                </svg>
                <span className="font-semibold">{forum.likes_count}</span>
              </button>
              <button
                onClick={() => {
                  setReportType('forum');
                  setReportContentId(forum.id);
                  setShowReportModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border-2 border-gray-200 hover:border-red-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-medium">Laporkan</span>
              </button>
            </div>
          </div>

          {/* Replies Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Replies ({forum.replies?.length || 0})
              </h2>
            </div>
            {forum.replies && forum.replies.length > 0 && (
              <div className="space-y-4">
                {forum.replies.map((reply: ForumReply) => (
                  <div key={reply.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                        {reply.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="font-bold text-gray-900">{reply.author_name}</span>
                          {reply.author_role === 'mentor' && (
                            <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                              Mentor
                            </span>
                          )}
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{formatDate(reply.created_at)}</span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">{reply.content}</p>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleLikeReply(reply.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                              reply.user_liked 
                                ? 'bg-blue-100 text-blue-600 border-2 border-blue-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a1 1 0 001.707.707l3.546-3.547a1 1 0 00.293-.707V10.333a1 1 0 00-1-1h-3.333a1 1 0 00-1 1zM15.818 3.482a1.5 1.5 0 010 2.828L11.177 10.9a1.5 1.5 0 01-2.121 0l-.707-.707a1.5 1.5 0 012.121-2.121l.354.353 5.657-5.657a1.5 1.5 0 012.121 0zm-6.364 5.657L4.879 7.879a1.5 1.5 0 00-2.121 2.121l6.364 6.364a1.5 1.5 0 002.121 0l6.364-6.364a1.5 1.5 0 00-2.121-2.121l-5.657 5.657z" />
                            </svg>
                            <span className="text-sm font-semibold">{reply.likes_count}</span>
                          </button>
                          <button
                            onClick={() => {
                              setReportType('reply');
                              setReportContentId(reply.id);
                              setShowReportModal(true);
                            }}
                            className="text-sm text-gray-500 hover:text-red-600 font-medium"
                          >
                            Laporkan
                          </button>
                          {(isOwner(reply.user_id) || canModerate) && (
                            <button
                              onClick={() => handleDelete('reply', reply.id)}
                              className="text-sm text-red-600 hover:text-red-800 font-semibold"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reply Form */}
          {!forum.is_locked && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Tambah Reply</h3>
              </div>
              <form onSubmit={handleSubmit(onSubmitReply)}>
                <textarea
                  {...register('content', { required: 'Konten reply wajib diisi' })}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 placeholder-gray-400 resize-none"
                  placeholder="Tulis reply Anda di sini..."
                />
                {errors.content && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.content.message}
                  </p>
                )}
                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 font-semibold flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Kirim Reply
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {forum.is_locked && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <p className="text-amber-800 font-semibold">Thread ini sudah di-lock</p>
              </div>
              <p className="text-amber-700 text-sm">Tidak bisa menambah reply baru.</p>
            </div>
          )}
          </div>
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Laporkan Konten</h3>
              </div>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-gray-900 placeholder-gray-400 resize-none"
                placeholder="Jelaskan alasan laporan..."
              />
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason('');
                  }}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
                >
                  Batal
                </button>
                <button
                  onClick={handleReport}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all font-semibold"
                >
                  Laporkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

