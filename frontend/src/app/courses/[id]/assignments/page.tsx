'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Assignment } from '@/types/assignment';
import { Course } from '@/types/course';

export default function CourseAssignmentsPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id;
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchAssignments();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      if (response.data.success) {
        setCourse(response.data.data);
      }
    } catch (error: any) {
      toast.error('Gagal memuat data kursus');
    }
  };

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/assignments/course/${courseId}`);
      if (response.data.success) {
        setAssignments(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        return;
      }
      toast.error('Gagal memuat assignments');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['pelajar']}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['pelajar']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <button
                onClick={() => router.push(`/courses/${courseId}/learn`)}
                className="text-gray-500 hover:text-gray-700 mb-4"
              >
                ← Kembali ke Learning Page
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Assignments: {course?.title}
              </h1>
            </div>

            {assignments.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">Belum ada assignment untuk kursus ini</p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <ul className="divide-y divide-gray-200">
                  {assignments.map((assignment) => (
                    <li key={assignment.id} className="hover:bg-gray-50">
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">
                                {assignment.title}
                              </h3>
                              <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                assignment.type === 'tugas' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {assignment.type === 'tugas' ? 'Tugas' : 'Kuis'}
                              </span>
                              {assignment.submitted && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Submitted
                                </span>
                              )}
                            </div>
                            {assignment.description && (
                              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                {assignment.description}
                              </p>
                            )}
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <span className="mr-4">
                                Max Score: {assignment.max_score}
                              </span>
                              {assignment.deadline && (
                                <span className={isDeadlinePassed(assignment.deadline) ? 'text-red-600' : ''}>
                                  Deadline: {formatDate(assignment.deadline)}
                                  {isDeadlinePassed(assignment.deadline) && ' (Lewat)'}
                                </span>
                              )}
                            </div>
                            {assignment.submission && (
                              <div className="mt-2">
                                {assignment.submission.score !== null && assignment.submission.score !== undefined ? (
                                  <p className="text-sm font-medium text-green-600">
                                    Score: {assignment.submission.score}/{assignment.max_score}
                                  </p>
                                ) : (
                                  <p className="text-sm text-gray-500">
                                    Menunggu penilaian
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="ml-4 flex items-center space-x-2">
                            {assignment.submitted ? (
                              <button
                                onClick={() => router.push(`/courses/${courseId}/assignments/${assignment.id}/view`)}
                                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-900"
                              >
                                Lihat Submission
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  if (assignment.type === 'tugas') {
                                    router.push(`/courses/${courseId}/assignments/${assignment.id}/submit`);
                                  } else {
                                    router.push(`/courses/${courseId}/assignments/${assignment.id}/take`);
                                  }
                                }}
                                disabled={isDeadlinePassed(assignment.deadline)}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {assignment.type === 'tugas' ? 'Submit Tugas' : 'Take Quiz'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

