'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Submission, Assignment } from '@/types/assignment';

interface GradeForm {
  score: number;
  feedback?: string;
}

export default function AssignmentSubmissionsPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id;
  const assignmentId = params?.assignmentId;
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gradingSubmission, setGradingSubmission] = useState<number | null>(null);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<GradeForm>();

  useEffect(() => {
    if (assignmentId) {
      fetchAssignment();
      fetchSubmissions();
    }
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      const response = await api.get(`/assignments/${assignmentId}`);
      if (response.data.success) {
        setAssignment(response.data.data);
      }
    } catch (error: any) {
      toast.error('Gagal memuat data assignment');
    }
  };

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/assignments/${assignmentId}/submissions`);
      if (response.data.success) {
        setSubmissions(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        return;
      }
      toast.error('Gagal memuat submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const onGradeSubmit = async (data: GradeForm, submissionId: number) => {
    try {
      const response = await api.post(`/assignments/submissions/${submissionId}/grade`, {
        score: data.score,
        feedback: data.feedback
      });
      if (response.data.success) {
        toast.success('Submission berhasil dinilai');
        setGradingSubmission(null);
        fetchSubmissions();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menilai submission');
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

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-blue-500 to-cyan-600';
    if (percentage >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['mentor']}>
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
            <p className="mt-4 text-indigo-600 font-medium animate-pulse">Memuat submissions...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />

        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="mb-8 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
              
              <button
                onClick={() => router.push(`/mentor/courses/${courseId}/assignments`)}
                className="group inline-flex items-center text-gray-600 hover:text-indigo-600 mb-4 transition-colors relative z-10"
              >
                <svg className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Assignments
              </button>
              
              <div className="relative z-10">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full text-white text-sm font-medium mb-3 shadow-lg">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {assignment?.type === 'tugas' ? 'Tugas' : 'Kuis'}
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-2">
                  Submissions 📝
                </h1>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">{assignment?.title}</h2>
                <div className="flex items-center gap-3 text-sm">
                  <span className="inline-flex items-center px-3 py-1 bg-white rounded-full shadow-sm">
                    🎯 Max Score: <span className="font-bold ml-1">{assignment?.max_score}</span>
                  </span>
                  <span className="inline-flex items-center px-3 py-1 bg-white rounded-full shadow-sm">
                    📊 {submissions.length} Submissions
                  </span>
                  <span className="inline-flex items-center px-3 py-1 bg-white rounded-full shadow-sm">
                    ✅ {submissions.filter(s => s.graded_at).length} Graded
                  </span>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {submissions.length === 0 ? (
              <div className="relative bg-white rounded-3xl shadow-xl p-12 text-center overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full filter blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-30"></div>
                
                <div className="relative">
                  <div className="inline-block p-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-6">
                    <svg className="h-20 w-20 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Submission 📭</h3>
                  <p className="text-gray-600">Pelajar belum mengumpulkan tugas atau mengerjakan kuis ini</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {submissions.map((submission, index) => {
                  const colors = [
                    { card: 'from-blue-50 to-cyan-50', border: 'border-blue-200', badge: 'from-blue-500 to-cyan-600' },
                    { card: 'from-purple-50 to-pink-50', border: 'border-purple-200', badge: 'from-purple-500 to-pink-600' },
                    { card: 'from-green-50 to-emerald-50', border: 'border-green-200', badge: 'from-green-500 to-emerald-600' },
                    { card: 'from-orange-50 to-red-50', border: 'border-orange-200', badge: 'from-orange-500 to-red-600' },
                    { card: 'from-indigo-50 to-purple-50', border: 'border-indigo-200', badge: 'from-indigo-500 to-purple-600' },
                  ];
                  const color = colors[index % colors.length];

                  return (
                    <div
                      key={submission.id}
                      className={`relative bg-gradient-to-br ${color.card} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${color.border}`}
                    >
                      {/* Student Info Header */}
                      <div className={`bg-gradient-to-r ${color.badge} p-6`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {submission.student_photo ? (
                              <img
                                src={submission.student_photo}
                                alt={submission.student_name}
                                className="h-14 w-14 rounded-full border-4 border-white shadow-lg"
                              />
                            ) : (
                              <div className="h-14 w-14 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center">
                                <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                            <div className="ml-4">
                              <h3 className="text-xl font-bold text-white">{submission.student_name}</h3>
                              <p className="text-sm text-white opacity-90">{submission.student_email}</p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          {submission.graded_at ? (
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-4 py-2 bg-white rounded-full text-sm font-bold text-green-600 shadow-lg">
                                ✅ Graded
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-4 py-2 bg-white rounded-full text-sm font-bold text-amber-600 shadow-lg">
                              ⏳ Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Left Column - Submission Details */}
                          <div className="space-y-4">
                            {/* Submitted Date */}
                            <div className="flex items-start">
                              <div className="p-2 bg-white rounded-lg shadow-sm">
                                <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</p>
                                <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(submission.submitted_at)}</p>
                              </div>
                            </div>

                            {/* Answer Text */}
                            {submission.answer_text && (
                              <div className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="flex items-center mb-2">
                                  <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <p className="text-sm font-bold text-gray-700">Jawaban</p>
                                </div>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                                  {submission.answer_text}
                                </p>
                              </div>
                            )}

                            {/* File Attachment */}
                            {submission.file_url && (
                              <a
                                href={submission.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                              >
                                <div className="flex items-center">
                                  <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                  <span className="ml-3 text-sm font-medium text-gray-900">Download File Attachment</span>
                                </div>
                                <svg className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                          </div>

                          {/* Right Column - Grading */}
                          <div className="space-y-4">
                            {/* Score Display */}
                            {submission.score !== null && submission.score !== undefined && (
                              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Score</p>
                                <div className={`inline-flex items-baseline justify-center px-6 py-3 bg-gradient-to-r ${getScoreColor(submission.score, assignment?.max_score || 100)} rounded-2xl shadow-lg`}>
                                  <span className="text-4xl font-bold text-white">{submission.score}</span>
                                  <span className="text-2xl font-medium text-white opacity-80 ml-1">/{assignment?.max_score}</span>
                                </div>
                                <div className="mt-3">
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                      className={`h-2.5 rounded-full bg-gradient-to-r ${getScoreColor(submission.score, assignment?.max_score || 100)}`}
                                      style={{ width: `${(submission.score / (assignment?.max_score || 100)) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Feedback Display */}
                            {submission.feedback && (
                              <div className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="flex items-center mb-2">
                                  <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                  </svg>
                                  <p className="text-sm font-bold text-gray-700">Feedback Mentor</p>
                                </div>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                                  {submission.feedback}
                                </p>
                              </div>
                            )}

                            {/* Grading Form */}
                            {!submission.graded_at && assignment?.type === 'tugas' && (
                              <div>
                                {gradingSubmission === submission.id ? (
                                  <form
                                    onSubmit={handleSubmit((data) => onGradeSubmit(data, submission.id))}
                                    className="bg-white rounded-xl p-6 shadow-lg border-2 border-indigo-200"
                                  >
                                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                      <svg className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                      Beri Nilai
                                    </h4>

                                    <div className="mb-4">
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Score (0 - {assignment?.max_score}) <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        {...register('score', {
                                          required: 'Score wajib diisi',
                                          min: { value: 0, message: 'Score minimal 0' },
                                          max: { value: assignment?.max_score || 100, message: `Score maksimal ${assignment?.max_score}` },
                                          valueAsNumber: true
                                        })}
                                        type="number"
                                        min={0}
                                        max={assignment?.max_score}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="0"
                                      />
                                      {errors.score && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center">
                                          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                          </svg>
                                          {errors.score.message}
                                        </p>
                                      )}
                                    </div>

                                    <div className="mb-4">
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Feedback 💬
                                      </label>
                                      <textarea
                                        {...register('feedback')}
                                        rows={4}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Berikan feedback untuk siswa..."
                                      />
                                    </div>

                                    <div className="flex space-x-3">
                                      <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                                      >
                                        💾 Simpan
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setGradingSubmission(null);
                                          setValue('score', 0);
                                          setValue('feedback', '');
                                        }}
                                        className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                                      >
                                        ❌ Batal
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setGradingSubmission(submission.id);
                                      setValue('score', 0);
                                      setValue('feedback', '');
                                    }}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center"
                                  >
                                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Beri Nilai
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}