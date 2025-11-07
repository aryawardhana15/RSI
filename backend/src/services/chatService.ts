import Chat from '../models/Chat';
import Message from '../models/Message';
import Course from '../models/Course';
import sequelize from '../config/database';
import { Op } from 'sequelize';

interface CreateMessageInput {
  content: string;
  file_url?: string;
}

// Check if user has access to the course
const checkCourseAccess = async (userId: number, courseId: number, role: string) => {
  if (role === 'pelajar') {
    // Check if enrolled
    const [enrollmentResult] = await sequelize.query(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      { replacements: [userId, courseId] }
    );

    if (!enrollmentResult || (enrollmentResult as any[]).length === 0) {
      throw new Error('Anda belum terdaftar di kursus ini');
    }
  } else if (role === 'mentor') {
    // Check if owns the course
    const course = await Course.findByPk(courseId);
    if (!course || course.mentor_id !== userId) {
      throw new Error('Anda tidak memiliki akses ke kursus ini');
    }
  }
};

export const initiateChat = async (
  pelajarId: number,
  courseId: number
) => {
  // Check if pelajar is enrolled
  await checkCourseAccess(pelajarId, courseId, 'pelajar');

  // Get mentor of the course
  const course = await Course.findByPk(courseId);
  if (!course) {
    throw new Error('Kursus tidak ditemukan');
  }

  // Check if chat already exists
  let chat = await Chat.findOne({
    where: {
      pelajar_id: pelajarId,
      mentor_id: course.mentor_id,
      course_id: courseId
    }
  });

  if (!chat) {
    // Create new chat room
    chat = await Chat.create({
      pelajar_id: pelajarId,
      mentor_id: course.mentor_id,
      course_id: courseId,
      last_message_at: new Date()
    });
  }

  return chat;
};

export const initiateChatWithMentor = async (
  pelajarId: number,
  mentorId: number
) => {
  // Verify mentor exists and is verified
  const [mentorResult] = await sequelize.query(
    `SELECT id FROM users WHERE id = ? AND role = 'mentor' AND is_verified = TRUE AND is_suspended = FALSE`,
    { replacements: [mentorId] }
  );

  if (!mentorResult || (mentorResult as any[]).length === 0) {
    throw new Error('Mentor tidak ditemukan atau belum terverifikasi');
  }

  // Check if chat already exists (without course)
  let chat = await Chat.findOne({
    where: {
      pelajar_id: pelajarId,
      mentor_id: mentorId,
      course_id: null
    }
  });

  if (!chat) {
    // Create new chat room
    chat = await Chat.create({
      pelajar_id: pelajarId,
      mentor_id: mentorId,
      course_id: null,
      last_message_at: new Date()
    });
  }

  return chat;
};

export const getChatRoomsByUser = async (userId: number, role: string) => {
  let query: string;
  let replacements: any[];

  if (role === 'pelajar') {
    // Get all chats where user is pelajar (including chats without courses)
    query = `
      SELECT 
        c.*,
        u.name as mentor_name,
        u.email as mentor_email,
        u.photo_url as mentor_photo,
        co.title as course_title,
        (SELECT COUNT(*) FROM messages WHERE chat_id = c.id AND sender_id != ? AND is_read = FALSE) as unread_count,
        (SELECT content FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
      FROM chats c
      JOIN users u ON c.mentor_id = u.id
      LEFT JOIN courses co ON c.course_id = co.id
      WHERE c.pelajar_id = ?
      ORDER BY c.last_message_at DESC
    `;
    replacements = [userId, userId];
  } else {
    // Get all chats where user is mentor (including chats without courses)
    query = `
      SELECT 
        c.*,
        u.name as pelajar_name,
        u.email as pelajar_email,
        u.photo_url as pelajar_photo,
        co.title as course_title,
        (SELECT COUNT(*) FROM messages WHERE chat_id = c.id AND sender_id != ? AND is_read = FALSE) as unread_count,
        (SELECT content FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
      FROM chats c
      JOIN users u ON c.pelajar_id = u.id
      LEFT JOIN courses co ON c.course_id = co.id
      WHERE c.mentor_id = ?
      ORDER BY c.last_message_at DESC
    `;
    replacements = [userId, userId];
  }

  const [chats] = await sequelize.query(query, { replacements });

  return chats;
};

export const getChatMessages = async (
  chatId: number,
  userId: number,
  role: string,
  page: number = 1,
  limit: number = 50
) => {
  // Verify chat access
  const chat = await Chat.findByPk(chatId);
  
  if (!chat) {
    throw new Error('Chat room tidak ditemukan');
  }

  // Check if user has access to this chat
  if (role === 'pelajar' && chat.pelajar_id !== userId) {
    throw new Error('Anda tidak memiliki akses ke chat ini');
  }
  
  if (role === 'mentor' && chat.mentor_id !== userId) {
    throw new Error('Anda tidak memiliki akses ke chat ini');
  }

  const offset = (page - 1) * limit;

  // Get messages with sender info
  const [messages] = await sequelize.query(
    `SELECT 
      m.*,
      u.name as sender_name,
      u.photo_url as sender_photo
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.chat_id = ?
    ORDER BY m.created_at DESC
    LIMIT ? OFFSET ?`,
    { replacements: [chatId, limit, offset] }
  );

  // Reverse to show oldest first
  (messages as any[]).reverse();

  // Mark messages as read (messages sent by the other person)
  await Message.update(
    { is_read: true },
    {
      where: {
        chat_id: chatId,
        sender_id: { [Op.ne]: userId },
        is_read: false
      }
    }
  );

  return messages;
};

export const sendMessage = async (
  chatId: number,
  senderId: number,
  role: string,
  input: CreateMessageInput
) => {
  // Verify chat access
  const chat = await Chat.findByPk(chatId);
  
  if (!chat) {
    throw new Error('Chat room tidak ditemukan');
  }

  // Check if user has access to this chat
  if (role === 'pelajar' && chat.pelajar_id !== senderId) {
    throw new Error('Anda tidak memiliki akses ke chat ini');
  }
  
  if (role === 'mentor' && chat.mentor_id !== senderId) {
    throw new Error('Anda tidak memiliki akses ke chat ini');
  }

  // Create message
  const message = await Message.create({
    chat_id: chatId,
    sender_id: senderId,
    content: input.content,
    file_url: input.file_url,
    is_read: false,
    created_at: new Date()
  });

  // Update last_message_at in chat
  await chat.update({
    last_message_at: new Date()
  });

  return message;
};

export const markMessagesAsRead = async (
  chatId: number,
  userId: number,
  role: string
) => {
  // Verify chat access
  const chat = await Chat.findByPk(chatId);
  
  if (!chat) {
    throw new Error('Chat room tidak ditemukan');
  }

  // Check access
  if (role === 'pelajar' && chat.pelajar_id !== userId) {
    throw new Error('Anda tidak memiliki akses ke chat ini');
  }
  
  if (role === 'mentor' && chat.mentor_id !== userId) {
    throw new Error('Anda tidak memiliki akses ke chat ini');
  }

  // Mark all messages from the other person as read
  await Message.update(
    { is_read: true },
    {
      where: {
        chat_id: chatId,
        sender_id: { [Op.ne]: userId },
        is_read: false
      }
    }
  );

  return { message: 'Messages marked as read' };
};

export const updateMessage = async (
  messageId: number,
  userId: number,
  role: string,
  content: string
) => {
  // Find message
  const message = await Message.findByPk(messageId);
  
  if (!message) {
    throw new Error('Pesan tidak ditemukan');
  }

  // Verify chat access
  const chat = await Chat.findByPk(message.chat_id);
  
  if (!chat) {
    throw new Error('Chat room tidak ditemukan');
  }

  // Check if user has access to this chat
  if (role === 'pelajar' && chat.pelajar_id !== userId) {
    throw new Error('Anda tidak memiliki akses ke chat ini');
  }
  
  if (role === 'mentor' && chat.mentor_id !== userId) {
    throw new Error('Anda tidak memiliki akses ke chat ini');
  }

  // Check if user is the sender
  if (message.sender_id !== userId) {
    throw new Error('Anda hanya dapat mengedit pesan Anda sendiri');
  }

  // Update message
  await message.update({
    content: content.trim()
  });

  return message;
};

export const deleteMessage = async (
  messageId: number,
  userId: number,
  role: string
) => {
  // Find message
  const message = await Message.findByPk(messageId);
  
  if (!message) {
    throw new Error('Pesan tidak ditemukan');
  }

  // Verify chat access
  const chat = await Chat.findByPk(message.chat_id);
  
  if (!chat) {
    throw new Error('Chat room tidak ditemukan');
  }

  // Check if user has access to this chat
  if (role === 'pelajar' && chat.pelajar_id !== userId) {
    throw new Error('Anda tidak memiliki akses ke chat ini');
  }
  
  if (role === 'mentor' && chat.mentor_id !== userId) {
    throw new Error('Anda tidak memiliki akses ke chat ini');
  }

  // Check if user is the sender
  if (message.sender_id !== userId) {
    throw new Error('Anda hanya dapat menghapus pesan Anda sendiri');
  }

  // Delete message
  await message.destroy();

  return { message: 'Message deleted' };
};

export const getTotalUnreadCount = async (userId: number, role: string) => {
  let query: string;
  let replacements: any[];

  if (role === 'pelajar') {
    query = `
      SELECT COUNT(*) as total
      FROM messages m
      JOIN chats c ON m.chat_id = c.id
      WHERE c.pelajar_id = ? AND m.sender_id != ? AND m.is_read = FALSE
    `;
    replacements = [userId, userId];
  } else {
    query = `
      SELECT COUNT(*) as total
      FROM messages m
      JOIN chats c ON m.chat_id = c.id
      WHERE c.mentor_id = ? AND m.sender_id != ? AND m.is_read = FALSE
    `;
    replacements = [userId, userId];
  }

  const [result] = await sequelize.query(query, { replacements });
  
  return (result as any)[0].total;
};

export const getChatByCourse = async (
  userId: number,
  courseId: number,
  role: string
) => {
  let chat;

  if (role === 'pelajar') {
    // Find chat between pelajar and course mentor
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new Error('Kursus tidak ditemukan');
    }

    chat = await Chat.findOne({
      where: {
        pelajar_id: userId,
        mentor_id: course.mentor_id,
        course_id: courseId
      }
    });
  } else if (role === 'mentor') {
    // For mentor, we need pelajar_id to find specific chat
    // This will be called from frontend with pelajar_id param
    throw new Error('Mentor harus memilih pelajar tertentu untuk chat');
  }

  if (!chat) {
    return null;
  }

  // Get chat with user info
  const query = role === 'pelajar' ? `
    SELECT 
      c.*,
      u.name as mentor_name,
      u.email as mentor_email,
      u.photo_url as mentor_photo,
      co.title as course_title
    FROM chats c
    JOIN users u ON c.mentor_id = u.id
    JOIN courses co ON c.course_id = co.id
    WHERE c.id = ?
  ` : `
    SELECT 
      c.*,
      u.name as pelajar_name,
      u.email as pelajar_email,
      u.photo_url as pelajar_photo,
      co.title as course_title
    FROM chats c
    JOIN users u ON c.pelajar_id = u.id
    JOIN courses co ON c.course_id = co.id
    WHERE c.id = ?
  `;

  const [chatInfo] = await sequelize.query(query, { replacements: [chat.id] });

  return (chatInfo as any)[0] || null;
};


