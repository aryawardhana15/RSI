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
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!forum) return null;

  return (
    <ProtectedRoute allowedRoles={['pelajar', 'mentor']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <button
                onClick={() => router.push(`/courses/${courseId}/forum`)}
                className="text-gray-500 hover:text-gray-700 mb-4"
              >
                ← Kembali ke Forum
              </button>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    {forum.is_pinned && (
                      <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.5 16a3.5 3.5 0 01-1.41-6.705 3.5 3.5 0 016.705-1.41 3.5 3.5 0 016.705 1.41 3.5 3.5 0 01-1.41 6.705L5.5 16z" />
                      </svg>
                    )}
                    <h1 className="text-3xl font-bold text-gray-900">{forum.title}</h1>
                    {forum.is_locked && (
                      <svg className="w-5 h-5 text-gray-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span>Oleh: {forum.author_name}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(forum.created_at)}</span>
                    {forum.tags && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {forum.tags}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {canModerate && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePin}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                    >
                      {forum.is_pinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button
                      onClick={handleLock}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                    >
                      {forum.is_locked ? 'Unlock' : 'Lock'}
                    </button>
                    <button
                      onClick={() => handleDelete('forum', forum.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-900"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Forum Content */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">{forum.content}</p>
              </div>
              <div className="mt-4 flex items-center space-x-4">
                <button
                  onClick={handleLikeForum}
                  className={`flex items-center space-x-2 ${
                    forum.user_liked ? 'text-blue-600' : 'text-gray-500'
                  } hover:text-blue-600`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a1 1 0 001.707.707l3.546-3.547a1 1 0 00.293-.707V10.333a1 1 0 00-1-1h-3.333a1 1 0 00-1 1zM15.818 3.482a1.5 1.5 0 010 2.828L11.177 10.9a1.5 1.5 0 01-2.121 0l-.707-.707a1.5 1.5 0 012.121-2.121l.354.353 5.657-5.657a1.5 1.5 0 012.121 0zm-6.364 5.657L4.879 7.879a1.5 1.5 0 00-2.121 2.121l6.364 6.364a1.5 1.5 0 002.121 0l6.364-6.364a1.5 1.5 0 00-2.121-2.121l-5.657 5.657z" />
                  </svg>
                  <span>{forum.likes_count}</span>
                </button>
                <button
                  onClick={() => {
                    setReportType('forum');
                    setReportContentId(forum.id);
                    setShowReportModal(true);
                  }}
                  className="text-gray-500 hover:text-red-600 text-sm"
                >
                  Laporkan
                </button>
              </div>
            </div>

            {/* Replies */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Replies ({forum.replies?.length || 0})
              </h2>
              {forum.replies && forum.replies.length > 0 && (
                <div className="space-y-4">
                  {forum.replies.map((reply: ForumReply) => (
                    <div key={reply.id} className="bg-white shadow rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="font-medium text-gray-900">{reply.author_name}</span>
                            <span className="mx-2 text-gray-500">•</span>
                            <span className="text-sm text-gray-500">{formatDate(reply.created_at)}</span>
                            {reply.author_role === 'mentor' && (
                              <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                Mentor
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                          <div className="mt-3 flex items-center space-x-4">
                            <button
                              onClick={() => handleLikeReply(reply.id)}
                              className={`flex items-center space-x-2 ${
                                reply.user_liked ? 'text-blue-600' : 'text-gray-500'
                              } hover:text-blue-600`}
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a1 1 0 001.707.707l3.546-3.547a1 1 0 00.293-.707V10.333a1 1 0 00-1-1h-3.333a1 1 0 00-1 1zM15.818 3.482a1.5 1.5 0 010 2.828L11.177 10.9a1.5 1.5 0 01-2.121 0l-.707-.707a1.5 1.5 0 012.121-2.121l.354.353 5.657-5.657a1.5 1.5 0 012.121 0zm-6.364 5.657L4.879 7.879a1.5 1.5 0 00-2.121 2.121l6.364 6.364a1.5 1.5 0 002.121 0l6.364-6.364a1.5 1.5 0 00-2.121-2.121l-5.657 5.657z" />
                              </svg>
                              <span>{reply.likes_count}</span>
                            </button>
                            <button
                              onClick={() => {
                                setReportType('reply');
                                setReportContentId(reply.id);
                                setShowReportModal(true);
                              }}
                              className="text-gray-500 hover:text-red-600 text-sm"
                            >
                              Laporkan
                            </button>
                            {(isOwner(reply.user_id) || canModerate) && (
                              <button
                                onClick={() => handleDelete('reply', reply.id)}
                                className="text-red-600 hover:text-red-900 text-sm"
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
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tambah Reply</h3>
                <form onSubmit={handleSubmit(onSubmitReply)}>
                  <textarea
                    {...register('content', { required: 'Konten reply wajib diisi' })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tulis reply Anda di sini..."
                  />
                  {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Mengirim...' : 'Kirim Reply'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {forum.is_locked && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800">Thread ini sudah di-lock. Tidak bisa menambah reply baru.</p>
              </div>
            )}
          </div>
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Laporkan Konten</h3>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Jelaskan alasan laporan..."
              />
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleReport}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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

