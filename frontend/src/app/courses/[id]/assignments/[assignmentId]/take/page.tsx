'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Assignment, QuizQuestion, SubmitQuizInput } from '@/types/assignment';

export default function TakeQuizPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id;
  const assignmentId = params?.assignmentId;
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [questionId: number]: 'a' | 'b' | 'c' | 'd' }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (assignmentId) {
      fetchAssignment();
    }
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/assignments/${assignmentId}`);
      if (response.data.success) {
        const data = response.data.data;
        if (data.type !== 'kuis') {
          toast.error('Ini bukan halaman untuk kuis');
          router.push(`/courses/${courseId}/assignments`);
          return;
        }
        if (data.submission) {
          // Already submitted, show result
          setShowResult(true);
          setResult({
            score: data.submission.score,
            totalQuestions: data.questions?.length || 0,
            percentage: data.submission.score ? Math.round((data.submission.score / (data.questions?.length || 1) / 10) * 100) : 0
          });
        }
        setAssignment(data);
        setQuestions(data.questions || []);
      }
    } catch (error: any) {
      toast.error('Gagal memuat data kuis');
      router.push(`/courses/${courseId}/assignments`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: 'a' | 'b' | 'c' | 'd') => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    if (!assignmentId) return;

    // Check if all questions answered
    if (Object.keys(answers).length !== questions.length) {
      toast.error('Silakan jawab semua pertanyaan');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: SubmitQuizInput = {
        answers: questions.map(q => ({
          question_id: q.id,
          selected_answer: answers[q.id] || 'a'
        }))
      };

      const response = await api.post(`/assignments/${assignmentId}/submit-quiz`, payload);
      if (response.data.success) {
        toast.success(response.data.message);
        setResult(response.data.data);
        setShowResult(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal submit kuis');
    } finally {
      setIsSubmitting(false);
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

  if (showResult && result) {
    return (
      <ProtectedRoute allowedRoles={['pelajar']}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />

          <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <div className="mb-6">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Kuis Selesai!</h2>
                  <p className="text-lg text-gray-600 mb-4">
                    Score: <span className="font-bold text-blue-600">{result.score}/{result.totalQuestions * 10}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Persentase: {result.percentage}%
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/courses/${courseId}/assignments`)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Kembali ke Assignments
                </button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['pelajar']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <button
                onClick={() => router.push(`/courses/${courseId}/assignments`)}
                className="text-gray-500 hover:text-gray-700 mb-4"
              >
                ← Kembali
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Kuis: {assignment?.title}
              </h1>
              {assignment?.deadline && (
                <p className="mt-2 text-sm text-gray-600">
                  Deadline: {formatDate(assignment.deadline)}
                </p>
              )}
            </div>

            {assignment?.description && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Deskripsi Kuis</h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {assignment.description}
                </p>
                <p className="mt-4 text-sm text-gray-600">
                  Max Score: {assignment.max_score} | Total Pertanyaan: {questions.length}
                </p>
              </div>
            )}

            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-8">
                {questions.map((question, index) => (
                  <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {index + 1}. {question.question_text}
                    </h3>
                    <div className="space-y-3">
                      {(['a', 'b', 'c', 'd'] as const).map((option) => (
                        <label
                          key={option}
                          className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                            answers[question.id] === option
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={() => handleAnswerChange(question.id, option)}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-medium mr-2">{option.toUpperCase()}.</span>
                          <span>{question[`option_${option}` as keyof QuizQuestion] as string}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Terjawab: {Object.keys(answers).length} / {questions.length}
                  </p>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || Object.keys(answers).length !== questions.length}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Mengirim...' : 'Submit Kuis'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

