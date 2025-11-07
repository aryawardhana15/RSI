'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

interface AdminLog {
  id: number;
  admin_id: number;
  admin_name: string;
  admin_email: string;
  action: string;
  target_type: string;
  target_id: number;
  description: string;
  created_at: string;
}

export default function AdminLogsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [currentPage]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/admin/logs?page=${currentPage}&limit=50`);
      
      if (response.data.success) {
        setLogs(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: any) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionConfig = (action: string) => {
    if (action.includes('delete')) return { 
      gradient: 'from-red-500 to-pink-600', 
      bg: 'bg-red-50',
      icon: '🗑️',
      text: 'Delete'
    };
    if (action.includes('suspend')) return { 
      gradient: 'from-yellow-500 to-orange-600', 
      bg: 'bg-yellow-50',
      icon: '⚠️',
      text: 'Suspend'
    };
    if (action.includes('verify') || action.includes('approve')) return { 
      gradient: 'from-green-500 to-emerald-600', 
      bg: 'bg-green-50',
      icon: '✅',
      text: 'Verify'
    };
    if (action.includes('reject')) return { 
      gradient: 'from-orange-500 to-red-600', 
      bg: 'bg-orange-50',
      icon: '❌',
      text: 'Reject'
    };
    return { 
      gradient: 'from-blue-500 to-cyan-600', 
      bg: 'bg-blue-50',
      icon: '📝',
      text: 'Action'
    };
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Navbar />
          <div className="flex flex-col justify-center items-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-indigo-600 font-medium animate-pulse">Memuat logs...</p>
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
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
            
            <div className="relative flex items-center justify-between mb-6">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white text-sm font-medium mb-3 shadow-lg">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Admin Activity
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Admin Logs 📋
                </h1>
                <p className="mt-2 text-gray-600 text-lg">
                  Riwayat aktivitas admin
                </p>
              </div>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="group p-3 bg-white hover:bg-gray-50 rounded-xl shadow-lg transition-all"
              >
                <svg className="w-6 h-6 text-gray-600 group-hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Logs List */}
          <div className="px-4 sm:px-0">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-indigo-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        ⏰ Waktu
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        👤 Admin
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        🎯 Action
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        📌 Target
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        📝 Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="inline-block p-6 bg-gray-50 rounded-full mb-4">
                            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 font-medium">Tidak ada logs</p>
                        </td>
                      </tr>
                    ) : (
                      logs.map((log, index) => {
                        const config = getActionConfig(log.action);
                        return (
                          <tr key={log.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {new Date(log.created_at).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3">
                                  {log.admin_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-gray-900">{log.admin_name}</div>
                                  <div className="text-xs text-gray-500">{log.admin_email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${config.gradient} shadow-sm`}>
                                {config.icon} {formatAction(log.action)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">
                                {log.target_type} #{log.target_id}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              <div className="max-w-md truncate">{log.description}</div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex items-center justify-between border-t border-gray-200">
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
                        Halaman <span className="font-bold text-indigo-600">{currentPage}</span> dari{' '}
                        <span className="font-bold text-indigo-600">{totalPages}</span>
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
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}