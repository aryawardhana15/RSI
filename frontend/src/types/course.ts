export interface Course {
  id: number;
  mentor_id: number;
  title: string;
  description?: string;
  category?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  education_level?: 'SD' | 'SMP' | 'SMA' | 'Kuliah';
  price: number;
  thumbnail_url?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  mentor_name?: string;
  mentor_photo?: string;
  enrollment_count?: number;
  materials_count?: number;
  isEnrolled?: boolean;
  mentor?: {
    id: number;
    name: string;
    email: string;
    photo_url?: string;
    expertise?: string;
  };
}

export interface CreateCourseInput {
  title: string;
  description?: string;
  category?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  education_level?: 'SD' | 'SMP' | 'SMA' | 'Kuliah';
  price?: number;
  thumbnail_url?: string;
  is_published?: boolean;
}

export interface CourseFilters {
  category?: string;
  difficulty?: string;
  education_level?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCourses: number;
  limit: number;
}

