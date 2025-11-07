'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-xl font-bold text-blue-600 hover:text-blue-700"
            >
              RSI E-Learning
            </button>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <a
                href="/dashboard"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-blue-500"
              >
                Dashboard
              </a>
              {user?.role === 'pelajar' && (
                <>
                  <a
                    href="/courses"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-blue-500 hover:text-gray-900"
                  >
                    Kursus
                  </a>
                  <a
                    href="/my-courses"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-blue-500 hover:text-gray-900"
                  >
                    Kursus Saya
                  </a>
                </>
              )}
              {user?.role === 'mentor' && (
                <>
                  <a
                    href="/mentor/courses"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-blue-500 hover:text-gray-900"
                  >
                    Kursus Saya
                  </a>
                  <a
                    href="/mentor/students"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-blue-500 hover:text-gray-900"
                  >
                    Pelajar
                  </a>
                </>
              )}
              {user?.role === 'admin' && (
                <>
                  <a
                    href="/admin/users"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-blue-500 hover:text-gray-900"
                  >
                    Users
                  </a>
                  <a
                    href="/admin/courses"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-blue-500 hover:text-gray-900"
                  >
                    Kursus
                  </a>
                  <a
                    href="/admin/mentors"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-blue-500 hover:text-gray-900"
                  >
                    Verifikasi Mentor
                  </a>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notifications Bell */}
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

