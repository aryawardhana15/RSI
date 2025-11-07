export interface Chat {
  id: number;
  pelajar_id: number;
  mentor_id: number;
  course_id: number | null;
  last_message_at: string;
  created_at: string;
  mentor_name?: string;
  mentor_email?: string;
  mentor_photo?: string;
  pelajar_name?: string;
  pelajar_email?: string;
  pelajar_photo?: string;
  course_title?: string;
  unread_count?: number;
  last_message?: string;
  last_message_time?: string;
}

export interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  content: string;
  file_url?: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  sender_photo?: string;
}

export interface SendMessageInput {
  content: string;
  file_url?: string;
}


