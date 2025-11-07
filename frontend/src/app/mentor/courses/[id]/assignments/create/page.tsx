'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CreateAssignmentInput } from '@/types/assignment';

interface QuestionForm {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
}

export default function CreateAssignmentPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id;
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CreateAssignmentInput & { questions: QuestionForm[] }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const assignmentType = watch('type');
  const [questions, setQuestions] = useState<QuestionForm[]>([]);

  const addQuestion = () => {
    setQuestions([...questions, {
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'a'
    }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuestionForm, value: string | 'a' | 'b' | 'c' | 'd') => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const onSubmit = async (data: CreateAssignmentInput & { questions?: QuestionForm[] }) => {
    if (!courseId) return;

    if (data.type === 'kuis' && questions.length === 0) {
      toast.error('Kuis harus memiliki minimal 1 pertanyaan');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateAssignmentInput = {
        course_id: parseInt(courseId as string),
        title: data.title,
        description: data.description,
        type: data.type,
        deadline: data.deadline,
        max_score: data.max_score || 100
      };

      if (data.type === 'kuis' && questions.length > 0) {
        payload.questions = questions.map(q => ({
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_answer: q.correct_answer
        }));
      }

      const response = await api.post('/assignments', payload);
      if (response.data.success) {
        toast.success('Assignment berhasil dibuat');
        router.push(`/mentor/courses/${courseId}/assignments`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membuat assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />

        <div className="max-w-5xl mx-auto py-8 sm:px-6 lg:px-8">
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
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white text-sm font-medium mb-3 shadow-lg">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Tambah Assignment ✨
                </h1>
                <p className="mt-2 text-gray-600">Buat tugas atau kuis baru untuk kursus Anda</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Main Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-indigo-100">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="ml-3 text-xl font-bold text-gray-900">Informasi Dasar</h2>
                </div>

                {/* Type */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipe Assignment <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register('type', { required: 'Tipe wajib diisi' })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white font-medium"
                    >
                      <option value="">Pilih tipe assignment...</option>
                      <option value="tugas">📄 Tugas - Upload file atau text</option>
                      <option value="kuis">🎯 Kuis - Multiple choice questions</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.type && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.type.message}
                    </p>
                  )}
                </div>

                {/* Title */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Judul Assignment <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('title', { required: 'Judul wajib diisi' })}
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Masukkan judul assignment..."
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deskripsi 📝
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    placeholder="Jelaskan detail assignment..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Deadline */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Deadline ⏰
                    </label>
                    <input
                      {...register('deadline')}
                      type="datetime-local"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Max Score */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Max Score 🎯
                    </label>
                    <input
                      {...register('max_score', { valueAsNumber: true })}
                      type="number"
                      defaultValue={100}
                      min={1}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>

              {/* Type Preview Card */}
              {assignmentType && (
                <div className={`p-6 rounded-2xl border-2 ${
                  assignmentType === 'tugas' 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                    : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
                }`}>
                  <div className="flex items-start">
                    <div className={`p-3 rounded-xl ${
                      assignmentType === 'tugas' 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                        : 'bg-gradient-to-br from-purple-500 to-pink-600'
                    }`}>
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {assignmentType === 'tugas' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        {assignmentType === 'tugas' ? '📄 Tugas' : '🎯 Kuis'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {assignmentType === 'tugas' 
                          ? 'Siswa akan mengupload file atau menulis jawaban text' 
                          : 'Siswa akan menjawab pertanyaan pilihan ganda'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz Questions Section */}
              {assignmentType === 'kuis' && (
                <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h2 className="text-xl font-bold text-gray-900">Pertanyaan Kuis</h2>
                        <p className="text-sm text-gray-600">{questions.length} pertanyaan</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Tambah Pertanyaan
                    </button>
                  </div>

                  {questions.length === 0 && (
                    <div className="text-center py-12">
                      <div className="inline-block p-6 bg-purple-50 rounded-full mb-4">
                        <svg className="h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 font-medium">Belum ada pertanyaan 📝</p>
                      <p className="text-sm text-gray-500 mt-1">Klik tombol "Tambah Pertanyaan" untuk menambahkan!</p>
                    </div>
                  )}

                  <div className="space-y-6">
                    {questions.map((question, index) => (
                      <div key={index} className="relative p-6 border-2 border-purple-100 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-shadow">
                        {/* Question Number Badge */}
                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">{index + 1}</span>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="absolute top-4 right-4 p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                          title="Hapus pertanyaan"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>

                        <div className="mt-4">
                          {/* Question Text */}
                          <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Pertanyaan <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={question.question_text}
                              onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                              rows={3}
                              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none bg-white"
                              placeholder="Tulis pertanyaan di sini..."
                              required
                            />
                          </div>

                          {/* Options Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                🅰️ Opsi A <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={question.option_a}
                                onChange={(e) => updateQuestion(index, 'option_a', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                placeholder="Opsi A"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                🅱️ Opsi B <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={question.option_b}
                                onChange={(e) => updateQuestion(index, 'option_b', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                                placeholder="Opsi B"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                ©️ Opsi C <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={question.option_c}
                                onChange={(e) => updateQuestion(index, 'option_c', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all bg-white"
                                placeholder="Opsi C"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                🅳 Opsi D <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={question.option_d}
                                onChange={(e) => updateQuestion(index, 'option_d', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white"
                                placeholder="Opsi D"
                                required
                              />
                            </div>
                          </div>

                          {/* Correct Answer */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              ✅ Jawaban Benar <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={question.correct_answer}
                              onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value as 'a' | 'b' | 'c' | 'd')}
                              className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white font-medium"
                              required
                            >
                              <option value="a">🅰️ Opsi A</option>
                              <option value="b">🅱️ Opsi B</option>
                              <option value="c">©️ Opsi C</option>
                              <option value="d">🅳 Opsi D</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push(`/mentor/courses/${courseId}/assignments`)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative flex items-center">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Buat Assignment
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}