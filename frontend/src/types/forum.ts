export interface Forum {
  id: number;
  course_id: number;
  user_id: number;
  title: string;
  content: string;
  tags?: string;
  is_pinned: boolean;
  is_locked: boolean;
  likes_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_email?: string;
  author_photo?: string;
  author_role?: string;
  user_liked?: number;
  course_title?: string;
  replies?: ForumReply[];
}

export interface ForumReply {
  id: number;
  forum_id: number;
  user_id: number;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_email?: string;
  author_photo?: string;
  author_role?: string;
  user_liked?: number;
}

export interface CreateForumInput {
  course_id: number;
  title: string;
  content: string;
  tags?: string;
}

export interface CreateReplyInput {
  content: string;
}

export interface ForumFilters {
  tags?: string;
  user_id?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalThreads: number;
  limit: number;
}

