'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import StatCard from '@/components/StatCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import StudentCharts from '@/components/StudentCharts';

interface MentorStats {
  totalCourses: number;
  totalPublished: number;
  totalStudents: number;
  totalMaterials: number;
}

interface ChartData {
  monthlyEnrollments: Array<{ month: string; count: number }>;
  studentsPerCourse: Array<{ id: number; title: string; student_count: number }>;
  activeStudents: number;
  totalStudents: number;
}

export default function MentorDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<MentorStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChart, setIsLoadingChart] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/mentor');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchChartData = async () => {
      try {
        const response = await api.get('/dashboard/mentor/students/chart');
        if (response.data.success) {
          setChartData(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      } finally {
        setIsLoadingChart(false);
      }
    };

    if (user?.role === 'mentor') {
      fetchStats();
      fetchChartData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Hero Header Section - Education Theme */}
          <div className="px-4 sm:px-0 mb-8">
            <div className="relative bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-3xl shadow-2xl overflow-hidden p-8 md:p-12">
              {/* Decorative elements - Education themed */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-300 rounded-full filter blur-3xl opacity-20"></div>
              

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                    <span className="text-xl">🌟</span>
                    <span className="text-white text-sm font-medium">Super Mentor</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">Aktif Mengajar</span>
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
                  Halo, Guru {user?.name}! 👨‍🏫
                </h1>
                <p className="text-xl text-white/90 mb-8 max-w-2xl">
                  Yuk, terus semangat menginspirasi! Setiap ilmu yang kamu bagikan adalah investasi masa depan 🚀
                </p>

                {/* Inline Stats - Education Style */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-4xl">📖</div>
                      <div>
                        <p className="text-3xl font-bold text-white">{stats?.totalCourses || 0}</p>
                      </div>
                    </div>
                    <p className="text-sm text-white/80 font-medium">Kursus Keren</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-4xl">✅</div>
                      <div>
                        <p className="text-3xl font-bold text-white">{stats?.totalPublished || 0}</p>
                      </div>
                    </div>
                    <p className="text-sm text-white/80 font-medium">Siap Belajar</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-4xl">👨‍🎓</div>
                      <div>
                        <p className="text-3xl font-bold text-white">{stats?.totalStudents || 0}</p>
                      </div>
                    </div>
                    <p className="text-sm text-white/80 font-medium">Pelajar Hebat</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-4xl">📝</div>
                      <div>
                        <p className="text-3xl font-bold text-white">{stats?.totalMaterials || 0}</p>
                      </div>
                    </div>
                    <p className="text-sm text-white/80 font-medium">Materi Seru</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Student Charts Section */}
          {!isLoadingChart && chartData && stats && stats.totalStudents > 0 && (
            <div className="mt-8 px-4 sm:px-0">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <span>📊</span> Yuk Lihat Progressnya!
                </h2>
                <p className="text-gray-600">Pantau perkembangan dan aktivitas murid-muridmu yang kece 👀</p>
              </div>
              <StudentCharts
                monthlyEnrollments={chartData.monthlyEnrollments}
                studentsPerCourse={chartData.studentsPerCourse}
                activeStudents={chartData.activeStudents}
                totalStudents={chartData.totalStudents}
              />
            </div>
          )}

          {/* Quick Actions - Grid Layout with Fun Education Theme */}
          <div className="mt-8 px-4 sm:px-0">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <span>⚡</span> Ayo Mulai Aksi!
              </h2>
              <p className="text-gray-600">Pilih aksi yang ingin kamu lakukan hari ini~</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Create Course - Large Card */}
              <button
                onClick={() => router.push('/mentor/courses/create')}
                className="group relative bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-[1.02] p-8 text-left"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-300 rounded-full filter blur-2xl opacity-30"></div>
                
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-4 text-5xl">
                      📚
                    </div>
                    <div className="bg-yellow-300/90 backdrop-blur-sm rounded-full px-4 py-2 transform -rotate-12">
                      <span className="text-purple-900 text-xs font-bold">HOT! 🔥</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-3">Bikin Kursus Baru!</h3>
                  <p className="text-white/90 text-base mb-4">Waktunya berbagi ilmu! Buat kursus baru yang keren dan inspiratif untuk murid-muridmu 🚀</p>
                  <div className="flex items-center gap-2 text-white font-bold">
                    <span className="text-base">Yuk Mulai!</span>
                    <svg className="h-5 w-5 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Manage Courses */}
              <button
                onClick={() => router.push('/mentor/courses')}
                className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-blue-200 hover:border-blue-400 transform hover:scale-[1.02] p-8 text-left"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full filter blur-2xl opacity-70"></div>
                <div className="absolute bottom-4 right-4 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">📖</div>
                
                <div className="relative z-10">
                  <div className="text-5xl mb-4 inline-block transform group-hover:rotate-12 transition-transform">
                    🎯
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Kelola Kursus</h3>
                  <p className="text-gray-600 text-sm mb-4">Update dan edit kursusmu supaya makin kece dan bermanfaat!</p>
                  <div className="flex items-center gap-2 text-blue-600 font-bold">
                    <span className="text-sm">Lihat Kursus</span>
                    <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Students */}
              <button
                onClick={() => router.push('/mentor/students')}
                className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-purple-200 hover:border-purple-400 transform hover:scale-[1.02] p-8 text-left"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full filter blur-2xl opacity-70"></div>
                <div className="absolute bottom-4 right-4 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">👨‍🎓</div>
                
                <div className="relative z-10">
                  <div className="text-5xl mb-4 inline-block transform group-hover:scale-110 transition-transform">
                    🌟
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Murid-Muridku</h3>
                  <p className="text-gray-600 text-sm mb-4">Cek progress belajar murid-muridmu yang keren abis!</p>
                  <div className="flex items-center gap-2 text-purple-600 font-bold">
                    <span className="text-sm">Lihat Murid</span>
                    <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Chat */}
              <button
                onClick={() => router.push('/mentor/chat')}
                className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-green-200 hover:border-green-400 transform hover:scale-[1.02] p-8 text-left"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full filter blur-2xl opacity-70"></div>
                <div className="absolute bottom-4 right-4 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">💬</div>
                
                <div className="relative z-10">
                  <div className="text-5xl mb-4 inline-block transform group-hover:rotate-12 transition-transform">
                    💭
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Ngobrol Yuk!</h3>
                  <p className="text-gray-600 text-sm mb-4">Chat seru dengan murid-muridmu, jawab pertanyaan mereka!</p>
                  <div className="flex items-center gap-2 text-green-600 font-bold">
                    <span className="text-sm">Buka Chat</span>
                    <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Motivational Quote */}
          <div className="mt-8 px-4 sm:px-0">
            <div className="relative bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-3xl shadow-2xl overflow-hidden p-8">
              <div className="absolute inset-0 bg-black/5"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full filter blur-3xl opacity-20"></div>
              
              <div className="relative z-10 flex items-center gap-6">
                <div className="hidden md:block">
                  <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 text-7xl">
                    ✨
                  </div>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-black text-white mb-3 leading-relaxed">
                    "Pendidikan adalah senjata paling ampuh untuk mengubah dunia!"
                  </p>
                  <p className="text-white/90 text-lg font-bold flex items-center gap-2">
                    <span>—</span> Nelson Mandela
                    <span className="text-2xl">🌍</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}