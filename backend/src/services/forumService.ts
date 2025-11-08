import Forum from '../models/Forum';
import ForumReply from '../models/ForumReply';
import ForumLike from '../models/ForumLike';
import ForumReport from '../models/ForumReport';
import Course from '../models/Course';
import sequelize from '../config/database';
import { addXP, updateMissionProgress } from './gamificationService';

interface CreateForumInput {
  course_id: number;
  title: string;
  content: string;
  tags?: string;
}

interface CreateReplyInput {
  content: string;
}

interface FilterOptions {
  tags?: string;
  user_id?: number;
  search?: string;
  page?: number;
  limit?: number;
}

// Check if user is enrolled in course
const checkEnrollment = async (userId: number, courseId: number) => {
  const [enrollmentResult] = await sequelize.query(
    'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
    { replacements: [userId, courseId] }
  );

  if (!enrollmentResult || (enrollmentResult as any[]).length === 0) {
    throw new Error('Anda belum terdaftar di kursus ini');
  }
};

// Check if user is mentor of the course
const checkMentorOwnership = async (courseId: number, mentorId: number) => {
  const course = await Course.findByPk(courseId);
  
  if (!course) {
    throw new Error('Kursus tidak ditemukan');
  }

  return course.mentor_id === mentorId;
};

export const createForumThread = async (input: CreateForumInput, userId: number) => {
  // Check enrollment
  await checkEnrollment(userId, input.course_id);

  // Create forum thread
  const forum = await Forum.create({
    course_id: input.course_id,
    user_id: userId,
    title: input.title,
    content: input.content,
    tags: input.tags,
    is_pinned: false,
    is_locked: false,
    likes_count: 0,
    replies_count: 0
  });

  // Give XP for posting
  await addXP(userId, 5, 'forum_post');

  // Update mission progress
  await updateMissionProgress(userId, 'forum_post', 1);
  
  // Check badges (Discussion Hero - 10 posts, Discussion Master mission)
  try {
    const { checkAndAwardBadges } = await import('./gamificationService');
    await checkAndAwardBadges(userId);
  } catch (error) {
    // Silent fail
    console.error('Error checking badges on forum post:', error);
  }

  return forum;
};

export const getForumsByCourse = async (
  courseId: number,
  userId: number,
  filters: FilterOptions
) => {
  // Check enrollment
  await checkEnrollment(userId, courseId);

  const { tags, user_id, search, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  // Build WHERE conditions with parameterized queries
  const conditions: string[] = [`f.course_id = ?`];
  const replacements: any[] = [courseId];

  if (tags) {
    conditions.push(`f.tags LIKE ?`);
    replacements.push(`%${tags}%`);
  }
  
  if (user_id) {
    conditions.push(`f.user_id = ?`);
    replacements.push(user_id);
  }
  
  if (search) {
    conditions.push(`(f.title LIKE ? OR f.content LIKE ?)`);
    const searchPattern = `%${search}%`;
    replacements.push(searchPattern, searchPattern);
  }

  const whereClause = conditions.join(' AND ');

  // Get forums with user info and like status
  const [forums] = await sequelize.query(
    `SELECT 
      f.*,
      u.name as author_name,
      u.photo_url as author_photo,
      (SELECT COUNT(*) FROM forum_likes WHERE forum_id = f.id AND user_id = ?) as user_liked
    FROM forums f
    JOIN users u ON f.user_id = u.id
    WHERE ${whereClause}
    ORDER BY f.is_pinned DESC, f.created_at DESC
    LIMIT ? OFFSET ?`,
    { replacements: [userId, ...replacements, limit, offset] }
  );

  // Get total count
  const [countResult] = await sequelize.query(
    `SELECT COUNT(*) as total FROM forums f WHERE ${whereClause}`,
    { replacements }
  );
  const totalThreads = (countResult as any)[0].total;

  return {
    forums,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalThreads / limit),
      totalThreads,
      limit
    }
  };
};

export const getForumById = async (forumId: number, userId: number) => {
  // Get forum with author info
  const [forumResult] = await sequelize.query(
    `SELECT 
      f.*,
      u.name as author_name,
      u.email as author_email,
      u.photo_url as author_photo,
      u.role as author_role,
      (SELECT COUNT(*) FROM forum_likes WHERE forum_id = f.id AND user_id = ?) as user_liked
    FROM forums f
    JOIN users u ON f.user_id = u.id
    WHERE f.id = ?`,
    { replacements: [userId, forumId] }
  );

  if (!forumResult || (forumResult as any[]).length === 0) {
    throw new Error('Forum thread tidak ditemukan');
  }

  const forum = (forumResult as any)[0];

  // Check enrollment
  await checkEnrollment(userId, forum.course_id);

  // Get all replies with author info and like status
  const [replies] = await sequelize.query(
    `SELECT 
      r.*,
      u.name as author_name,
      u.email as author_email,
      u.photo_url as author_photo,
      u.role as author_role,
      (SELECT COUNT(*) FROM forum_likes WHERE reply_id = r.id AND user_id = ?) as user_liked
    FROM forum_replies r
    JOIN users u ON r.user_id = u.id
    WHERE r.forum_id = ?
    ORDER BY r.created_at ASC`,
    { replacements: [userId, forumId] }
  );

  return {
    ...forum,
    replies
  };
};

export const createReply = async (forumId: number, userId: number, input: CreateReplyInput) => {
  const forum = await Forum.findByPk(forumId);
  
  if (!forum) {
    throw new Error('Forum thread tidak ditemukan');
  }

  // Check if forum is locked
  if (forum.is_locked) {
    throw new Error('Thread ini sudah di-lock, tidak bisa reply');
  }

  // Check enrollment
  await checkEnrollment(userId, forum.course_id);

  // Create reply
  const reply = await ForumReply.create({
    forum_id: forumId,
    user_id: userId,
    content: input.content,
    likes_count: 0
  });

  // Update replies count in forum
  await forum.update({
    replies_count: forum.replies_count + 1
  });

  // Give XP for replying
  await addXP(userId, 3, 'forum_reply');

  // Update mission progress
  await updateMissionProgress(userId, 'forum_reply', 1);
  
  // Check badges (Helping Hand - 20 replies)
  try {
    const { checkAndAwardBadges } = await import('./gamificationService');
    await checkAndAwardBadges(userId);
  } catch (error) {
    // Silent fail
    console.error('Error checking badges on forum reply:', error);
  }

  return reply;
};

export const toggleLikeForum = async (forumId: number, userId: number) => {
  const forum = await Forum.findByPk(forumId);
  
  if (!forum) {
    throw new Error('Forum thread tidak ditemukan');
  }

  // Check enrollment
  await checkEnrollment(userId, forum.course_id);

  // Check if already liked
  const existingLike = await ForumLike.findOne({
    where: {
      user_id: userId,
      forum_id: forumId
    }
  });

  if (existingLike) {
    // Unlike
    await existingLike.destroy();
    await forum.update({
      likes_count: forum.likes_count - 1
    });
    return { liked: false, likes_count: forum.likes_count - 1 };
  } else {
    // Like
    await ForumLike.create({
      user_id: userId,
      forum_id: forumId
    });
    await forum.update({
      likes_count: forum.likes_count + 1
    });
    
    // Check badges for forum post owner (Social Butterfly - receive 50 likes)
    try {
      const { checkAndAwardBadges } = await import('./gamificationService');
      await checkAndAwardBadges(forum.user_id);
    } catch (error) {
      // Silent fail
      console.error('Error checking badges on forum like:', error);
    }
    
    return { liked: true, likes_count: forum.likes_count + 1 };
  }
};

export const toggleLikeReply = async (replyId: number, userId: number) => {
  const reply = await ForumReply.findByPk(replyId);
  
  if (!reply) {
    throw new Error('Reply tidak ditemukan');
  }

  // Get forum to check enrollment
  const forum = await Forum.findByPk(reply.forum_id);
  if (!forum) {
    throw new Error('Forum thread tidak ditemukan');
  }

  // Check enrollment
  await checkEnrollment(userId, forum.course_id);

  // Check if already liked
  const existingLike = await ForumLike.findOne({
    where: {
      user_id: userId,
      reply_id: replyId
    }
  });

  if (existingLike) {
    // Unlike
    await existingLike.destroy();
    await reply.update({
      likes_count: reply.likes_count - 1
    });
    return { liked: false, likes_count: reply.likes_count - 1 };
  } else {
    // Like
    await ForumLike.create({
      user_id: userId,
      reply_id: replyId
    });
    await reply.update({
      likes_count: reply.likes_count + 1
    });
    return { liked: true, likes_count: reply.likes_count + 1 };
  }
};

export const pinForumThread = async (forumId: number, userId: number) => {
  const forum = await Forum.findByPk(forumId);
  
  if (!forum) {
    throw new Error('Forum thread tidak ditemukan');
  }

  // Check if user is mentor of the course
  const isMentor = await checkMentorOwnership(forum.course_id, userId);
  
  if (!isMentor) {
    throw new Error('Hanya mentor yang dapat pin thread');
  }

  // Toggle pin
  await forum.update({
    is_pinned: !forum.is_pinned
  });

  return forum;
};

export const lockForumThread = async (forumId: number, userId: number) => {
  const forum = await Forum.findByPk(forumId);
  
  if (!forum) {
    throw new Error('Forum thread tidak ditemukan');
  }

  // Check if user is mentor of the course
  const isMentor = await checkMentorOwnership(forum.course_id, userId);
  
  if (!isMentor) {
    throw new Error('Hanya mentor yang dapat lock thread');
  }

  // Toggle lock
  await forum.update({
    is_locked: !forum.is_locked
  });

  return forum;
};

export const reportContent = async (
  userId: number,
  type: 'forum' | 'reply',
  contentId: number,
  reason: string
) => {
  // Create report
  const report = await ForumReport.create({
    reporter_id: userId,
    forum_id: type === 'forum' ? contentId : undefined,
    reply_id: type === 'reply' ? contentId : undefined,
    reason,
    status: 'pending'
  });

  return report;
};

export const deleteForumThread = async (forumId: number, userId: number, isAdmin: boolean = false) => {
  const forum = await Forum.findByPk(forumId);
  
  if (!forum) {
    throw new Error('Forum thread tidak ditemukan');
  }

  // Check if user is owner or admin or mentor
  const isMentor = await checkMentorOwnership(forum.course_id, userId);
  const isOwner = forum.user_id === userId;
  
  if (!isOwner && !isMentor && !isAdmin) {
    throw new Error('Anda tidak memiliki akses untuk menghapus thread ini');
  }

  await forum.destroy();
  return { message: 'Forum thread berhasil dihapus' };
};

export const deleteReply = async (replyId: number, userId: number, isAdmin: boolean = false) => {
  const reply = await ForumReply.findByPk(replyId);
  
  if (!reply) {
    throw new Error('Reply tidak ditemukan');
  }

  // Get forum to check mentor ownership
  const forum = await Forum.findByPk(reply.forum_id);
  if (!forum) {
    throw new Error('Forum thread tidak ditemukan');
  }

  const isMentor = await checkMentorOwnership(forum.course_id, userId);
  const isOwner = reply.user_id === userId;
  
  if (!isOwner && !isMentor && !isAdmin) {
    throw new Error('Anda tidak memiliki akses untuk menghapus reply ini');
  }

  await reply.destroy();
  
  // Update replies count
  await forum.update({
    replies_count: forum.replies_count - 1
  });

  return { message: 'Reply berhasil dihapus' };
};


export const searchForums = async (
  userId: number,
  query: string,
  page: number = 1,
  limit: number = 20
) => {
  const offset = (page - 1) * limit;

  // Search across all courses where user is enrolled
  const [forums] = await sequelize.query(
    `SELECT 
      f.*,
      u.name as author_name,
      u.photo_url as author_photo,
      c.title as course_title,
      (SELECT COUNT(*) FROM forum_likes WHERE forum_id = f.id AND user_id = ?) as user_liked
    FROM forums f
    JOIN users u ON f.user_id = u.id
    JOIN courses c ON f.course_id = c.id
    WHERE f.course_id IN (
      SELECT course_id FROM enrollments WHERE user_id = ?
    )
    AND (f.title LIKE ? OR f.content LIKE ? OR f.tags LIKE ?)
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?`,
    { replacements: [userId, userId, `%${query}%`, `%${query}%`, `%${query}%`, limit, offset] }
  );

  return forums;
};

