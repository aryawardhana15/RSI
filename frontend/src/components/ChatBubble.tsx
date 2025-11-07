'use client';

import { useState, useEffect, useRef } from 'react';
import { Message } from '@/types/chat';

interface ChatBubbleProps {
  message: Message;
  isSentByCurrentUser: boolean;
  onEdit?: (messageId: number, newContent: string) => void;
  onDelete?: (messageId: number) => void;
}

export default function ChatBubble({ message, isSentByCurrentUser, onEdit, onDelete }: ChatBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMenu]);

  // Update editContent when message content changes
  useEffect(() => {
    if (!isEditing) {
      setEditContent(message.content);
    }
  }, [message.content, isEditing]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && onEdit) {
      onEdit(message.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus pesan ini?')) {
      if (onDelete) {
        onDelete(message.id);
      }
    }
    setShowMenu(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className={`flex items-end space-x-2 group ${isSentByCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      {!isSentByCurrentUser && (
        <div className="flex-shrink-0">
          {message.sender_photo ? (
            <img
              src={message.sender_photo}
              alt={message.sender_name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {message.sender_name?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Message Bubble */}
      <div className={`flex flex-col max-w-xs lg:max-w-md ${isSentByCurrentUser ? 'items-end' : 'items-start'} relative`}>
        {!isSentByCurrentUser && (
          <span className="text-xs text-gray-500 mb-1 ml-2">{message.sender_name}</span>
        )}
        
        {isEditing ? (
          <div className="w-full">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full px-4 py-2 border border-blue-500 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              autoFocus
            />
            <div className="flex items-center space-x-2 mt-2">
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Simpan
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`px-4 py-2 rounded-2xl relative ${
                isSentByCurrentUser
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-gray-200 text-gray-900 rounded-bl-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              
              {message.file_url && (
                <a
                  href={message.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-2 inline-flex items-center text-xs underline ${
                    isSentByCurrentUser ? 'text-blue-100' : 'text-blue-600'
                  }`}
                >
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  File Attachment
                </a>
              )}

              {/* Menu Button (only for own messages) */}
              {isSentByCurrentUser && (onEdit || onDelete) && (
                <div ref={menuRef} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className={`p-1 rounded-full hover:bg-opacity-20 ${
                      isSentByCurrentUser ? 'hover:bg-white' : 'hover:bg-gray-400'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                  
                  {showMenu && (
                    <div className={`absolute ${isSentByCurrentUser ? 'right-0' : 'left-0'} top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[120px]`}>
                      {onEdit && (
                        <button
                          onClick={handleEdit}
                          className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Edit</span>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={handleDelete}
                          className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-1 mt-1 px-2">
              <span className="text-xs text-gray-400">{formatTime(message.created_at)}</span>
              {isSentByCurrentUser && !!message.is_read ? (
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}


