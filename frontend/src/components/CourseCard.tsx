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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-20 h-20 text-white opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        {/* Price Badge */}
        {course.price > 0 && (
          <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg">
            <span className="text-sm font-bold text-gray-900">Rp {Number(course.price).toLocaleString('id-ID')}</span>
          </div>
        )}
        {course.price === 0 && (
          <div className="absolute top-4 right-4 bg-green-500 px-3 py-1 rounded-full shadow-lg">
            <span className="text-sm font-bold text-white">GRATIS</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category & Difficulty */}
        <div className="flex items-center gap-2 mb-2">
          {course.category && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
              {course.category}
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded ${difficultyColors[course.difficulty]}`}>
            {difficultyText[course.difficulty]}
          </span>
          {course.education_level && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
              {course.education_level}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {course.description || 'Tidak ada deskripsi'}
        </p>

        {/* Mentor Info */}
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex items-center justify-center">
            {course.mentor_photo ? (
              <img src={course.mentor_photo} alt={course.mentor_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-xs font-medium text-gray-600">
                {course.mentor_name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500">Mentor</p>
            <p className="text-sm font-medium text-gray-900">{course.mentor_name || 'Unknown'}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>{course.enrollment_count || 0} pelajar</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{course.materials_count || 0} materi</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/courses/${course.id}`)}
              className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Lihat Detail
            </button>
            {onEnroll && !course.isEnrolled && (
              <button
                onClick={() => onEnroll(course.id)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Gabung
              </button>
            )}
            {course.isEnrolled && (
              <button
                onClick={() => router.push(`/courses/${course.id}/learn`)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Lanjutkan
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

