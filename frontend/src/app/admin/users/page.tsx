'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_verified: boolean;
  is_suspended: boolean;
  created_at: string;
  total_enrollments?: number;
  total_courses?: number;
}

export default function UsersManagementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, searchQuery]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      if (roleFilter) params.append('role', roleFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await api.get(`/admin/users?${params.toString()}`);
      
      if (response.data.success) {
        setUsers(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: any) {
      toast.error('Gagal memuat data users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedUser) return;

    setIsProcessing(true);
    try {
      const response = await api.post(`/admin/users/${selectedUser.id}/suspend`, {
        reason: suspendReason
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        setShowSuspendModal(false);
        setSuspendReason('');
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengubah status user');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (userId: number, userName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user "${userName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      
      if (response.data.success) {
        toast.success('User berhasil dihapus');
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus user');
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
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-purple-600 font-medium animate-pulse">Memuat users...</p>
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
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full text-white text-sm font-medium mb-3 shadow-lg">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  User Management
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                  Kelola Users 👥
                </h1>
                <p className="mt-2 text-gray-600 text-lg">
                  Kelola semua pengguna platform
                </p>
              </div>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="group p-3 bg-white hover:bg-gray-50 rounded-xl shadow-lg transition-all"
              >
                <svg className="w-6 h-6 text-gray-600 group-hover:text-purple-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filters */}
            <div className="relative flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Cari nama atau email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                  />
                </div>
              </div>
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-48 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white appearance-none font-medium"
                >
                  <option value="">👥 Semua Role</option>
                  <option value="pelajar">🎓 Pelajar</option>
                  <option value="mentor">👨‍🏫 Mentor</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Users Cards */}
          <div className="px-4 sm:px-0 mt-6">
            {users.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-gray-100">
                <div className="inline-block p-6 bg-gray-50 rounded-full mb-4">
                  <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak ada user ditemukan</h3>
                <p className="text-gray-600">Coba ubah filter pencarian Anda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((userItem, index) => (
                  <div key={userItem.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border-2 border-purple-100 transition-all duration-300">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* User Info */}
                          <div className="flex items-start mb-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-lg ${
                              userItem.role === 'mentor' 
                                ? 'bg-gradient-to-br from-purple-500 to-pink-600' 
                                : 'bg-gradient-to-br from-blue-500 to-cyan-600'
                            }`}>
                              {userItem.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-1">{userItem.name}</h3>
                              <p className="text-gray-600 flex items-center text-sm">
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {userItem.email}
                              </p>
                              
                              {/* Badges */}
                              <div className="flex flex-wrap gap-2 mt-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${
                                  userItem.role === 'mentor' 
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-600' 
                                    : 'bg-gradient-to-r from-blue-500 to-cyan-600'
                                }`}>
                                  {userItem.role === 'mentor' ? '👨‍🏫 Mentor' : '🎓 Pelajar'}
                                </span>
                                {!!userItem.is_verified ? (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm">
                                    ✅ Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-sm">
                                    ⏳ Pending
                                  </span>
                                )}
                                {!!userItem.is_suspended && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-sm">
                                    🚫 Suspended
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Activity Stats */}
                          <div className={`p-4 rounded-xl border-2 ${
                            userItem.role === 'mentor' 
                              ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200' 
                              : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
                          }`}>
                            <div className="flex items-center">
                              <div className={`p-2 rounded-lg mr-3 ${
                                userItem.role === 'mentor' ? 'bg-purple-100' : 'bg-blue-100'
                              }`}>
                                <svg className={`h-5 w-5 ${
                                  userItem.role === 'mentor' ? 'text-purple-600' : 'text-blue-600'
                                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  {userItem.role === 'mentor' ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                  ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  )}
                                </svg>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-gray-900">
                                  {userItem.role === 'pelajar' 
                                    ? (userItem.total_enrollments || 0) 
                                    : (userItem.total_courses || 0)
                                  }
                                </p>
                                <p className="text-xs text-gray-600 font-medium">
                                  {userItem.role === 'pelajar' ? 'Enrollments' : 'Courses'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="ml-6 flex flex-col space-y-3">
                          <button
                            onClick={() => {
                              setSelectedUser(userItem);
                              setShowSuspendModal(true);
                            }}
                            disabled={isProcessing}
                            className={`px-6 py-3 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none ${
                              userItem.is_suspended
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                            }`}
                          >
                            <span className="flex items-center">
                              {userItem.is_suspended ? (
                                <>
                                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Unsuspend
                                </>
                              ) : (
                                <>
                                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                  </svg>
                                  Suspend
                                </>
                              )}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDelete(userItem.id, userItem.name)}
                            disabled={isProcessing}
                            className="px-6 py-3 bg-white border-2 border-red-300 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all disabled:opacity-50"
                          >
                            <span className="flex items-center">
                              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 px-4 sm:px-0">
              <div className="bg-white rounded-2xl shadow-xl px-6 py-4 flex items-center justify-between border-2 border-purple-100">
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
                      Halaman <span className="font-bold text-purple-600">{currentPage}</span> dari{' '}
                      <span className="font-bold text-purple-600">{totalPages}</span>
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

        {/* Suspend/Unsuspend Modal */}
        {showSuspendModal && selectedUser && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={() => setShowSuspendModal(false)}></div>

              <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-2xl shadow-2xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="px-6 pt-6 pb-4 bg-white">
                  <div className="sm:flex sm:items-start">
                    <div className={`flex items-center justify-center flex-shrink-0 w-14 h-14 mx-auto rounded-full sm:mx-0 ${
                      selectedUser.is_suspended ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      <svg className={`w-7 h-7 ${selectedUser.is_suspended ? 'text-green-600' : 'text-yellow-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                      <h3 className="text-xl font-bold leading-6 text-gray-900 mb-2">
                        {selectedUser.is_suspended ? '✅ Unsuspend User' : '🚫 Suspend User'}
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-4">
                          {selectedUser.is_suspended 
                            ? `Apakah Anda yakin ingin mengaktifkan kembali akun "${selectedUser.name}"?`
                            : `Apakah Anda yakin ingin menangguhkan akun "${selectedUser.name}"?`
                          }
                        </p>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Alasan (opsional):
                        </label>
                        <textarea
                          value={suspendReason}
                          onChange={(e) => setSuspendReason(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none"
                          placeholder="Masukkan alasan..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="button"
                    onClick={handleSuspend}
                    disabled={isProcessing}
                    className={`inline-flex justify-center w-full px-6 py-3 text-base font-bold text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all sm:w-auto disabled:opacity-50 disabled:transform-none ${
                      selectedUser.is_suspended 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                        : 'bg-gradient-to-r from-yellow-600 to-orange-600'
                    }`}
                  >
                    {isProcessing ? 'Memproses...' : selectedUser.is_suspended ? 'Unsuspend' : 'Suspend'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSuspendModal(false);
                      setSuspendReason('');
                      setSelectedUser(null);
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