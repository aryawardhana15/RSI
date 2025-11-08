'use client';

import { Course } from '@/types/course';
import { useRouter } from 'next/navigation';

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: number) => void;
  showActions?: boolean;
}

export default function CourseCard({ course, onEnroll, showActions = true }: CourseCardProps) {
  const router = useRouter();

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  const difficultyText = {
    beginner: 'Pemula',
    intermediate: 'Menengah',
    advanced: 'Mahir'
  };

  return (
    <div className="group relative bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-4 border-white/50">
      {/* Thumbnail */}
      <div className="relative h-56 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-7xl opacity-50">📚</div>
          </div>
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        {/* Price Badge */}
        {course.price > 0 && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-xl border-2 border-white/50">
            <span className="text-sm font-black text-gray-900">💰 Rp {Number(course.price).toLocaleString('id-ID')}</span>
          </div>
        )}
        {course.price === 0 && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 rounded-2xl shadow-xl border-2 border-white/50">
            <span className="text-sm font-black text-white flex items-center gap-1">
              <span>🎁</span>
              GRATIS
            </span>
          </div>
        )}
        
        {/* Decorative Elements */}
        <div className="absolute bottom-4 left-4 text-3xl opacity-30">✨</div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category & Difficulty */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {course.category && (
            <span className="text-xs px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black rounded-full shadow-md">
              📚 {course.category}
            </span>
          )}
          <span className={`text-xs px-3 py-1.5 rounded-full font-black shadow-md ${
            course.difficulty === 'beginner' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
            course.difficulty === 'intermediate' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
            'bg-gradient-to-r from-red-500 to-pink-500 text-white'
          }`}>
            {course.difficulty === 'beginner' ? '🌱' : course.difficulty === 'intermediate' ? '🌿' : '🌳'} {difficultyText[course.difficulty]}
          </span>
          {course.education_level && (
            <span className="text-xs px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black rounded-full shadow-md">
              🎓 {course.education_level}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-gray-900 mb-3 line-clamp-2 leading-tight">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {course.description || 'Tidak ada deskripsi'}
        </p>

        {/* Mentor Info */}
        <div className="flex items-center mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mr-3 flex items-center justify-center border-4 border-white shadow-lg">
            {course.mentor_photo ? (
              <img src={course.mentor_photo} alt={course.mentor_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-lg font-black text-white">
                {course.mentor_name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">👨‍🏫 Mentor</p>
            <p className="text-sm font-black text-gray-900">{course.mentor_name || 'Unknown'}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
          <div className="flex items-center gap-2">
            <span className="text-lg">👥</span>
            <span className="font-black text-gray-800">{course.enrollment_count || 0} pelajar</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📄</span>
            <span className="font-black text-gray-800">{course.materials_count || 0} materi</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/courses/${course.id}`)}
              className="group flex-1 px-4 py-3 text-sm font-black text-blue-600 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl hover:from-blue-100 hover:to-cyan-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 transition-all duration-300 border-2 border-blue-200"
            >
              <span className="flex items-center justify-center gap-2">
                <span>👁️</span>
                Detail
              </span>
            </button>
            {onEnroll && !course.isEnrolled && (
              <button
                onClick={() => onEnroll(course.id)}
                className="group flex-1 px-4 py-3 text-sm font-black text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>➕</span>
                  Gabung
                </span>
              </button>
            )}
            {course.isEnrolled && (
              <button
                onClick={() => router.push(`/courses/${course.id}/learn`)}
                className="group flex-1 px-4 py-3 text-sm font-black text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>▶️</span>
                  Lanjutkan
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

