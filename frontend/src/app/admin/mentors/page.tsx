'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

interface PendingMentor {
  id: number;
  name: string;
  email: string;
  cv_url?: string;
  expertise?: string;
  experience?: string;
  created_at: string;
}

export default function VerifyMentorsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mentors, setMentors] = useState<PendingMentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<PendingMentor | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPendingMentors();
  }, []);

  const fetchPendingMentors = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/mentors/pending');
      
      if (response.data.success) {
        setMentors(response.data.data);
      }
    } catch (error: any) {
      toast.error('Gagal memuat data mentor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (mentorId: number) => {
    if (!confirm('Apakah Anda yakin ingin memverifikasi mentor ini?')) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await api.post(`/admin/mentors/${mentorId}/verify`);
      
      if (response.data.success) {
        toast.success('Mentor berhasil diverifikasi');
        fetchPendingMentors();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memverifikasi mentor');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedMentor) return;

    setIsProcessing(true);
    try {
      const response = await api.post(`/admin/mentors/${selectedMentor.id}/reject`, {
        reason: rejectReason
      });
      
      if (response.data.success) {
        toast.success('Mentor berhasil ditolak');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedMentor(null);
        fetchPendingMentors();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menolak mentor');
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
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-green-600 font-medium animate-pulse">Memuat data mentor...</p>
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
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
            
            <div className="relative flex items-center justify-between mb-6">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white text-sm font-medium mb-3 shadow-lg">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verification Required
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Verifikasi Mentor 👨‍🏫
                </h1>
                <p className="mt-2 text-gray-600 text-lg">
                  Review dan verifikasi pendaftaran mentor baru
                </p>
              </div>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="group p-3 bg-white hover:bg-gray-50 rounded-xl shadow-lg transition-all"
              >
                <svg className="w-6 h-6 text-gray-600 group-hover:text-green-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Empty State */}
          {mentors.length === 0 && (
            <div className="px-4 sm:px-0">
              <div className="relative bg-white rounded-3xl shadow-xl p-12 text-center overflow-hidden border-2 border-green-100">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-20"></div>
                
                <div className="relative">
                  <div className="inline-block p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-6">
                    <svg className="h-20 w-20 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Tidak ada mentor pending ✅</h3>
                  <p className="text-gray-600">Semua mentor sudah diverifikasi</p>
                </div>
              </div>
            </div>
          )}

          {/* Mentors List */}
          {mentors.length > 0 && (
            <div className="px-4 sm:px-0 space-y-6">
              {mentors.map((mentor, index) => (
                <div key={mentor.id} className="group bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-green-100 hover:shadow-2xl transition-all duration-300">
                  <div className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Mentor Info */}
                        <div className="flex items-start mb-6">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-lg">
                            {mentor.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">{mentor.name}</h3>
                            <p className="text-gray-600 flex items-center mt-1">
                              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {mentor.email}
                            </p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {mentor.expertise && (
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                              <div className="flex items-center mb-2">
                                <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <span className="text-sm font-bold text-gray-700">Keahlian</span>
                              </div>
                              <p className="text-sm text-gray-600">{mentor.expertise}</p>
                            </div>
                          )}
                          {mentor.experience && (
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                              <div className="flex items-center mb-2">
                                <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm font-bold text-gray-700">Pengalaman</span>
                              </div>
                              <p className="text-sm text-gray-600">{mentor.experience}</p>
                            </div>
                          )}
                        </div>

                        {/* CV Link */}
                        {mentor.cv_url && (
                          <a
                            href={mentor.cv_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-all group/link"
                          >
                            <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-bold text-indigo-600 group-hover/link:text-indigo-700">Lihat CV</span>
                          </a>
                        )}

                        <p className="mt-4 text-xs text-gray-500 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Mendaftar: {new Date(mentor.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="ml-6 flex flex-col space-y-3">
                        <button
                          onClick={() => handleVerify(mentor.id)}
                          disabled={isProcessing}
                          className="group/btn relative px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity"></span>
                          <span className="relative flex items-center">
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Approve
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMentor(mentor);
                            setShowRejectModal(true);
                          }}
                          disabled={isProcessing}
                          className="px-6 py-3 bg-white border-2 border-red-300 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all disabled:opacity-50"
                        >
                          <span className="flex items-center">
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
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

        {/* Reject Modal */}
        {showRejectModal && selectedMentor && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={() => setShowRejectModal(false)}></div>

              <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-2xl shadow-2xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="px-6 pt-6 pb-4 bg-white">
                  <div className="sm:flex sm:items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-14 h-14 mx-auto bg-red-100 rounded-full sm:mx-0">
                      <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                      <h3 className="text-xl font-bold leading-6 text-gray-900 mb-2">
                        Tolak Mentor
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-4">
                          Apakah Anda yakin ingin menolak pendaftaran mentor <strong>{selectedMentor.name}</strong>? 
                          Akun akan dihapus dari sistem.
                        </p>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Alasan penolakan (opsional):
                        </label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                          placeholder="Masukkan alasan penolakan..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="inline-flex justify-center w-full px-6 py-3 text-base font-bold text-white bg-gradient-to-r from-red-600 to-pink-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all sm:w-auto disabled:opacity-50 disabled:transform-none"
                  >
                    {isProcessing ? 'Memproses...' : 'Tolak Mentor'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason('');
                      setSelectedMentor(null);
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