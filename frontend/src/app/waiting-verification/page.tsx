'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function WaitingVerificationPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Redirect jika bukan mentor atau sudah verified
    if (!user || user.role !== 'mentor' || user.is_verified) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-yellow-100">
            <svg
              className="h-12 w-12 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Menunggu Verifikasi
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Terima kasih telah mendaftar sebagai mentor!
          </p>
        </div>

        <div className="bg-white shadow sm:rounded-lg p-6">
          <div className="space-y-4">
            <p className="text-gray-700">
              Akun Anda sedang dalam proses verifikasi oleh tim admin kami.
              Anda akan menerima email notifikasi setelah akun Anda disetujui.
            </p>
            <p className="text-sm text-gray-500">
              Proses verifikasi biasanya memakan waktu 1-2 hari kerja.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Logout
          </button>
          <p className="text-xs text-gray-500">
            Jika Anda memiliki pertanyaan, silakan hubungi admin@edutopia.com
          </p>
        </div>
      </div>
    </div>
  );
}
