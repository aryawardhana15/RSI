'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface ChatButtonProps {
  courseId: number;
  courseName: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ChatButton({ courseId, courseName, size = 'md' }: ChatButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleChatClick = async () => {
    setIsLoading(true);
    try {
      // Check if chat already exists
      const checkResponse = await api.get(`/chats/course/${courseId}`);
      
      if (checkResponse.data.data) {
        // Chat exists, navigate to it
        router.push(`/chat/${checkResponse.data.data.id}?course=${encodeURIComponent(courseName)}`);
      } else {
        // Create new chat
        const createResponse = await api.post('/chats', { course_id: courseId });
        
        if (createResponse.data.success) {
          router.push(`/chat/${createResponse.data.data.id}?course=${encodeURIComponent(courseName)}`);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membuka chat');
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      onClick={handleChatClick}
      disabled={isLoading}
      className={`inline-flex items-center ${sizeClasses[size]} font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        <>
          <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Chat Mentor
        </>
      )}
    </button>
  );
}


