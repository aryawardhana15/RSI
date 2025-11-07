export interface Material {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  content?: string;
  video_url?: string;
  file_url?: string;
  order_index: number;
  is_completed?: boolean;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMaterialInput {
  course_id: number;
  title: string;
  description?: string;
  content?: string;
  video_url?: string;
  file_url?: string;
  order_index: number;
}

