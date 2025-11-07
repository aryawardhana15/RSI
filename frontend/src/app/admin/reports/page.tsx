'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Report {
  id: number;
  reporter_id: number;
  reporter_name: string;
  reporter_email: string;
  forum_id?: number;
  reply_id?: number;
  reason: string;
  status: string;
  forum_title?: string;
  forum_content?: string;
  reply_content?: string;
  created_at: string;
}

export default function ReportsModerationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveAction, setResolveAction] = useState<'delete_content' | 'dismiss'>('delete_content');
  const [resolveReason, setResolveReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [currentPage]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/admin/reports?page=${currentPage}&limit=20`);
      
      if (response.data.success) {
        setReports(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: any) {
      toast.error('Gagal memuat data reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedReport) return;

    setIsProcessing(true);
    try {
      const response = await api.post(`/admin/reports/${selectedReport.id}/resolve`, {
        action: resolveAction,
        reason: resolveReason
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        setShowResolveModal(false);
        setResolveReason('');
        setResolveAction('delete_content');
        setSelectedReport(null);
        fetchReports();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memproses laporan');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Navbar />
          <div className="flex flex-col justify-center items-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-red-600 font-medium animate-pulse">Memuat laporan...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="px-4 py-6 sm:px-0 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-200 to-pink-200 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
            
            <div className="relative flex items-center justify-between mb-6">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-full text-white text-sm font-medium mb-3 shadow-lg">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Content Moderation
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  Moderasi Reports 🚨
                </h1>
                <p className="mt-2 text-gray-600 text-lg">
                  Review dan proses laporan konten
                </p>
              </div>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="group p-3 bg-white hover:bg-gray-50 rounded-xl shadow-lg transition-all"
              >
                <svg className="w-6 h-6 text-gray-600 group-hover:text-red-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Empty State */}
          {!isLoading && reports.length === 0 && (
            <div className="px-4 sm:px-0">
              <div className="relative bg-white rounded-3xl shadow-xl p-12 text-center overflow-hidden border-2 border-green-100">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-20"></div>
                
                <div className="relative">
                  <div className="inline-block p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-6">
                    <svg className="h-20 w-20 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Tidak ada laporan pending ✅</h3>
                  <p className="text-gray-600">Semua laporan sudah diproses</p>
                </div>
              </div>
            </div>
          )}

          {/* Reports List */}
          {reports.length > 0 && (
            <div className="px-4 sm:px-0 space-y-6">
              {reports.map((report, index) => (
                <div key={report.id} className="group bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-red-100 hover:shadow-2xl transition-all duration-300">
                  <div className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Report Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg ${
                              report.forum_id ? 'bg-gradient-to-r from-purple-500 to-pink-600' : 'bg-gradient-to-r from-blue-500 to-cyan-600'
                            }`}>
                              {report.forum_id ? '📝 Forum Post' : '💬 Reply'}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center">
                              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(report.created_at).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Reporter Info */}
                        <div className="mb-4 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200">
                          <div className="flex items-start">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                              {report.reporter_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-900 mb-1">
                                Dilaporkan oleh: {report.reporter_name}
                              </p>
                              <p className="text-xs text-gray-600 flex items-center">
                                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {report.reporter_email}
                              </p>
                              <div className="mt-2 flex items-start">
                                <svg className="h-4 w-4 text-red-600 mr-1 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-sm text-gray-900">
                                  <span className="font-bold">Alasan: </span>
                                  {report.reason}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Reported Content */}
                        {report.forum_id && report.forum_title && (
                          <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                            <div className="flex items-center mb-3">
                              <div className="p-2 bg-purple-100 rounded-lg mr-2">
                                <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                              </div>
                              <p className="text-sm font-bold text-gray-900">Forum Post Content:</p>
                            </div>
                            <p className="text-base font-bold text-gray-900 mb-2">{report.forum_title}</p>
                            <p className="text-sm text-gray-700 line-clamp-3">{report.forum_content}</p>
                          </div>
                        )}

                        {report.reply_id && report.reply_content && (
                          <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                            <div className="flex items-center mb-3">
                              <div className="p-2 bg-blue-100 rounded-lg mr-2">
                                <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                              </div>
                              <p className="text-sm font-bold text-gray-900">Reply Content:</p>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-3">{report.reply_content}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="ml-6 flex flex-col space-y-3">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setResolveAction('delete_content');
                            setShowResolveModal(true);
                          }}
                          disabled={isProcessing}
                          className="group/btn relative px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-pink-600 to-red-600 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity"></span>
                          <span className="relative flex items-center">
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Hapus
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setResolveAction('dismiss');
                            setShowResolveModal(true);
                          }}
                          disabled={isProcessing}
                          className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                          <span className="flex items-center">
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Dismiss
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 px-4 sm:px-0">
              <div className="bg-white rounded-2xl shadow-xl px-6 py-4 flex items-center justify-between border-2 border-gray-100">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border-2 border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border-2 border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 font-medium">
                      Halaman <span className="font-bold text-red-600">{currentPage}</span> dari{' '}
                      <span className="font-bold text-red-600">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 rounded-l-xl border-2 border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-4 py-2 rounded-r-xl border-2 border-l-0 border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
                      >
                        Next →
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resolve Modal */}
        {showResolveModal && selectedReport && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={() => setShowResolveModal(false)}></div>

              <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-2xl shadow-2xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="px-6 pt-6 pb-4 bg-white">
                  <div className="sm:flex sm:items-start">
                    <div className={`flex items-center justify-center flex-shrink-0 w-14 h-14 mx-auto rounded-full sm:mx-0 ${
                      resolveAction === 'delete_content' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <svg className={`w-7 h-7 ${resolveAction === 'delete_content' ? 'text-red-600' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                      <h3 className="text-xl font-bold leading-6 text-gray-900 mb-2">
                        {resolveAction === 'delete_content' ? '🗑️ Hapus Konten' : '❌ Dismiss Laporan'}
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-4">
                          {resolveAction === 'delete_content'
                            ? 'Apakah Anda yakin ingin menghapus konten yang dilaporkan? Tindakan ini tidak dapat dibatalkan.'
                            : 'Apakah Anda yakin ingin dismiss laporan ini? Konten akan tetap dipertahankan.'
                          }
                        </p>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Alasan (opsional):
                        </label>
                        <textarea
                          value={resolveReason}
                          onChange={(e) => setResolveReason(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                          placeholder="Masukkan alasan..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="button"
                    onClick={handleResolve}
                    disabled={isProcessing}
                    className={`inline-flex justify-center w-full px-6 py-3 text-base font-bold text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all sm:w-auto disabled:opacity-50 disabled:transform-none ${
                      resolveAction === 'delete_content' 
                        ? 'bg-gradient-to-r from-red-600 to-pink-600' 
                        : 'bg-gradient-to-r from-gray-600 to-gray-700'
                    }`}
                  >
                    {isProcessing ? 'Memproses...' : resolveAction === 'delete_content' ? 'Hapus Konten' : 'Dismiss'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResolveModal(false);
                      setResolveReason('');
                      setSelectedReport(null);
                    }}
                    disabled={isProcessing}
                    className="inline-flex justify-center w-full px-6 py-3 mt-3 text-base font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all sm:mt-0 sm:w-auto"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}