import Assignment from '../models/Assignment';
import QuizQuestion from '../models/QuizQuestion';
import Submission from '../models/Submission';
import QuizAnswer from '../models/QuizAnswer';
import Course from '../models/Course';
import sequelize from '../config/database';
import { addXP, updateMissionProgress } from './gamificationService';

interface CreateAssignmentInput {
  course_id: number;
  title: string;
  description?: string;
  type: 'tugas' | 'kuis';
  deadline?: Date;
  max_score?: number;
  questions?: {
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: 'a' | 'b' | 'c' | 'd';
  }[];
}

interface SubmitAssignmentInput {
  answer_text?: string;
  file_url?: string;
}

interface SubmitQuizInput {
  answers: {
    question_id: number;
    selected_answer: 'a' | 'b' | 'c' | 'd';
  }[];
}

// Check if mentor owns the course
const checkMentorOwnership = async (courseId: number, mentorId: number) => {
  const course = await Course.findByPk(courseId);
  
  if (!course) {
    throw new Error('Kursus tidak ditemukan');
  }

  if (course.mentor_id !== mentorId) {
    throw new Error('Anda tidak memiliki akses ke kursus ini');
  }

  return course;
};

export const createAssignment = async (input: CreateAssignmentInput, mentorId: number) => {
  // Check ownership
  await checkMentorOwnership(input.course_id, mentorId);

  // Create assignment
  const assignment = await Assignment.create({
    course_id: input.course_id,
    title: input.title,
    description: input.description,
    type: input.type,
    deadline: input.deadline,
    max_score: input.max_score || 100
  });

  // If type is kuis and questions provided, create questions
  if (input.type === 'kuis' && input.questions && input.questions.length > 0) {
    const questionsData = input.questions.map((q, index) => ({
      assignment_id: assignment.id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      order_index: index
    }));

    await QuizQuestion.bulkCreate(questionsData);
  }

  return assignment;
};

export const getAssignmentsByCourse = async (courseId: number, userId?: number) => {
  const assignments = await Assignment.findAll({
    where: { course_id: courseId },
    order: [['created_at', 'DESC']]
  });

  // If user provided, check submission status
  if (userId) {
    const assignmentsWithStatus = await Promise.all(
      assignments.map(async (assignment) => {
        const submission = await Submission.findOne({
          where: {
            assignment_id: assignment.id,
            user_id: userId
          }
        });

        return {
          ...assignment.toJSON(),
          submitted: !!submission,
          submission: submission ? {
            id: submission.id,
            score: submission.score,
            graded: !!submission.graded_at
          } : null
        };
      })
    );

    return assignmentsWithStatus;
  }

  return assignments;
};

export const getAssignmentById = async (assignmentId: number, userId?: number) => {
  const assignment = await Assignment.findByPk(assignmentId);
  
  if (!assignment) {
    throw new Error('Assignment tidak ditemukan');
  }

  let submission = null;
  let isMentor = false;
  
  if (userId) {
    submission = await Submission.findOne({
      where: {
        assignment_id: assignmentId,
        user_id: userId
      }
    });

    // Check if user is the mentor of this course
    const course = await Course.findByPk(assignment.course_id);
    if (course && course.mentor_id === userId) {
      isMentor = true;
    }

    // If quiz submission exists, get answers
    if (submission && assignment.type === 'kuis') {
      const answers = await QuizAnswer.findAll({
        where: { submission_id: submission.id }
      });
      (submission as any).answers = answers;
    }
  }

  let questions = null;
  if (assignment.type === 'kuis') {
    // Show correct_answer only if:
    // 1. User is the mentor of the course, OR
    // 2. User has already submitted the quiz
    const shouldShowCorrectAnswer = isMentor || !!submission;
    
    const attributes = shouldShowCorrectAnswer
      ? ['id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'order_index']
      : ['id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'order_index'];
    
    questions = await QuizQuestion.findAll({
      where: { assignment_id: assignmentId },
      order: [['order_index', 'ASC']],
      attributes: attributes
    });
  }

  return {
    ...assignment.toJSON(),
    questions,
    submission
  };
};

export const updateAssignment = async (
  assignmentId: number,
  mentorId: number,
  input: Partial<CreateAssignmentInput>
) => {
  const assignment = await Assignment.findByPk(assignmentId);
  
  if (!assignment) {
    throw new Error('Assignment tidak ditemukan');
  }

  // Check ownership
  await checkMentorOwnership(assignment.course_id, mentorId);

  // Update assignment
  await assignment.update({
    title: input.title,
    description: input.description,
    deadline: input.deadline,
    max_score: input.max_score
  });

  // If questions provided for kuis, update them
  if (assignment.type === 'kuis' && input.questions) {
    // Delete old questions
    await QuizQuestion.destroy({ where: { assignment_id: assignmentId } });

    // Create new questions
    const questionsData = input.questions.map((q, index) => ({
      assignment_id: assignmentId,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      order_index: index
    }));

    await QuizQuestion.bulkCreate(questionsData);
  }

  return assignment;
};

export const deleteAssignment = async (assignmentId: number, mentorId: number) => {
  const assignment = await Assignment.findByPk(assignmentId);
  
  if (!assignment) {
    throw new Error('Assignment tidak ditemukan');
  }

  // Check ownership
  await checkMentorOwnership(assignment.course_id, mentorId);

  await assignment.destroy();
  return { message: 'Assignment berhasil dihapus' };
};

export const submitAssignment = async (
  assignmentId: number,
  userId: number,
  input: SubmitAssignmentInput
) => {
  const assignment = await Assignment.findByPk(assignmentId);
  
  if (!assignment) {
    throw new Error('Assignment tidak ditemukan');
  }

  if (assignment.type !== 'tugas') {
    throw new Error('Gunakan endpoint submit quiz untuk kuis');
  }

  // Check if already submitted
  const existingSubmission = await Submission.findOne({
    where: {
      assignment_id: assignmentId,
      user_id: userId
    }
  });

  if (existingSubmission) {
    throw new Error('Anda sudah submit tugas ini');
  }

  // Check deadline
  if (assignment.deadline && new Date() > assignment.deadline) {
    throw new Error('Deadline sudah lewat');
  }

  // Create submission
  const submission = await Submission.create({
    assignment_id: assignmentId,
    user_id: userId,
    answer_text: input.answer_text,
    file_url: input.file_url,
    submitted_at: new Date()
  });

  // Give XP for submission
  await addXP(userId, 20, 'submit_assignment');

  // Update mission progress
  await updateMissionProgress(userId, 'submit_assignment', 1);

  return submission;
};

export const submitQuiz = async (
  assignmentId: number,
  userId: number,
  input: SubmitQuizInput
) => {
  const assignment = await Assignment.findByPk(assignmentId);
  
  if (!assignment) {
    throw new Error('Assignment tidak ditemukan');
  }

  if (assignment.type !== 'kuis') {
    throw new Error('Gunakan endpoint submit assignment untuk tugas');
  }

  // Check if already submitted
  const existingSubmission = await Submission.findOne({
    where: {
      assignment_id: assignmentId,
      user_id: userId
    }
  });

  if (existingSubmission) {
    throw new Error('Anda sudah submit kuis ini');
  }

  // Check deadline
  if (assignment.deadline && new Date() > assignment.deadline) {
    throw new Error('Deadline sudah lewat');
  }

  // Get all questions with correct answers
  const questions = await QuizQuestion.findAll({
    where: { assignment_id: assignmentId }
  });

  // Create submission
  const submission = await Submission.create({
    assignment_id: assignmentId,
    user_id: userId,
    submitted_at: new Date()
  });

  // Process answers and calculate score
  let correctCount = 0;
  const answersData = input.answers.map((answer) => {
    const question = questions.find(q => q.id === answer.question_id);
    const isCorrect = question ? question.correct_answer === answer.selected_answer : false;
    
    if (isCorrect) correctCount++;

    return {
      submission_id: submission.id,
      question_id: answer.question_id,
      selected_answer: answer.selected_answer,
      is_correct: isCorrect
    };
  });

  await QuizAnswer.bulkCreate(answersData);

  // Calculate score
  const score = Math.round((correctCount / questions.length) * assignment.max_score);

  // Auto-grade quiz
  await submission.update({
    score,
    graded_at: new Date()
  });

  // Give XP based on score
  const xpReward = score === assignment.max_score ? 50 : 20; // Bonus for perfect score
  await addXP(userId, xpReward, score === assignment.max_score ? 'perfect_quiz' : 'submit_assignment');

  // Update mission progress
  await updateMissionProgress(userId, 'submit_assignment', 1);

  // If perfect score, update perfect_quiz mission
  if (score === assignment.max_score) {
    await updateMissionProgress(userId, 'perfect_quiz', 1);
  }

  return {
    ...submission.toJSON(),
    correctCount,
    totalQuestions: questions.length,
    percentage: Math.round((correctCount / questions.length) * 100)
  };
};

export const getSubmissionsByAssignment = async (assignmentId: number, mentorId: number) => {
  const assignment = await Assignment.findByPk(assignmentId);
  
  if (!assignment) {
    throw new Error('Assignment tidak ditemukan');
  }

  // Check ownership
  await checkMentorOwnership(assignment.course_id, mentorId);

  // Get all submissions with user info
  const [submissions] = await sequelize.query(
    `SELECT 
      s.*,
      u.name as student_name,
      u.email as student_email,
      u.photo_url as student_photo
    FROM submissions s
    JOIN users u ON s.user_id = u.id
    WHERE s.assignment_id = ?
    ORDER BY s.submitted_at DESC`,
    { replacements: [assignmentId] }
  );

  return submissions;
};

export const gradeSubmission = async (
  submissionId: number,
  mentorId: number,
  score: number,
  feedback?: string
) => {
  const submission = await Submission.findByPk(submissionId);
  
  if (!submission) {
    throw new Error('Submission tidak ditemukan');
  }

  const assignment = await Assignment.findByPk(submission.assignment_id);
  if (!assignment) {
    throw new Error('Assignment tidak ditemukan');
  }

  // Check ownership
  await checkMentorOwnership(assignment.course_id, mentorId);

  // Validate score
  if (score < 0 || score > assignment.max_score) {
    throw new Error(`Nilai harus antara 0 - ${assignment.max_score}`);
  }

  // Update submission
  await submission.update({
    score,
    feedback,
    graded_at: new Date(),
    graded_by: mentorId
  });

  // Give XP if not already given (for tugas)
  if (assignment.type === 'tugas') {
    const xpReward = score === assignment.max_score ? 50 : 20;
    await addXP(submission.user_id, xpReward, score === assignment.max_score ? 'perfect_score' : 'graded_assignment');
    
    // Update mission progress (tugas submission is already tracked in submitAssignment)
    if (score === assignment.max_score) {
      await updateMissionProgress(submission.user_id, 'perfect_quiz', 1);
    }
  }

  return submission;
};


