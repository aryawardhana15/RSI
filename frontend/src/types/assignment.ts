export interface Assignment {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  type: 'tugas' | 'kuis';
  deadline?: string;
  max_score: number;
  created_at: string;
  updated_at: string;
  submitted?: boolean;
  submission?: {
    id: number;
    score?: number;
    graded: boolean;
  };
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: number;
  assignment_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer?: 'a' | 'b' | 'c' | 'd'; // Only visible to mentor
  order_index: number;
}

export interface CreateAssignmentInput {
  course_id: number;
  title: string;
  description?: string;
  type: 'tugas' | 'kuis';
  deadline?: string;
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

export interface SubmitAssignmentInput {
  answer_text?: string;
  file_url?: string;
}

export interface SubmitQuizInput {
  answers: {
    question_id: number;
    selected_answer: 'a' | 'b' | 'c' | 'd';
  }[];
}

export interface Submission {
  id: number;
  assignment_id: number;
  user_id: number;
  answer_text?: string;
  file_url?: string;
  submitted_at: string;
  score?: number;
  feedback?: string;
  graded_at?: string;
  graded_by?: number;
  student_name?: string;
  student_email?: string;
  student_photo?: string;
}

