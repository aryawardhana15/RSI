import User from '../models/User';
import Course from '../models/Course';
import Forum from '../models/Forum';
import ForumReply from '../models/ForumReply';
import ForumReport from '../models/ForumReport';
import sequelize from '../config/database';

interface AdminStats {
  totalPelajar: number;
  totalMentor: number;
  totalMentorVerified: number;
  totalMentorPending: number;
  totalUsers: number;
  totalCourses: number;
  totalCoursesPublished: number;
  totalEnrollments: number;
  totalForumPosts: number;
  pendingReports: number;
  newUsersLast30Days: number;
  newCoursesLast30Days: number;
}

interface PendingMentor {
  id: number;
  name: string;
  email: string;
  cv_url?: string;
  expertise?: string;
  experience?: string;
  created_at: string;
}

export const getDashboardStats = async (): Promise<AdminStats> => {
  // Get user statistics
  const [usersResult] = await sequelize.query(
    `SELECT 
      COUNT(CASE WHEN role = 'pelajar' THEN 1 END) as total_pelajar,
      COUNT(CASE WHEN role = 'mentor' AND is_verified = TRUE THEN 1 END) as total_mentor_verified,
      COUNT(CASE WHEN role = 'mentor' AND is_verified = FALSE THEN 1 END) as total_mentor_pending,
      COUNT(CASE WHEN role = 'mentor' THEN 1 END) as total_mentor,
      COUNT(*) as total_users
    FROM users 
    WHERE role != 'admin'`
  );
  const userStats = (usersResult as any)[0];

  // Get course statistics
  const [coursesResult] = await sequelize.query(
    `SELECT 
      COUNT(*) as total_courses,
      COUNT(CASE WHEN is_published = TRUE THEN 1 END) as total_courses_published
    FROM courses`
  );
  const courseStats = (coursesResult as any)[0];

  // Get enrollment count
  const [enrollmentResult] = await sequelize.query(
    'SELECT COUNT(*) as total FROM enrollments'
  );
  const totalEnrollments = (enrollmentResult as any)[0].total;

  // Get forum posts count
  const [forumResult] = await sequelize.query(
    'SELECT COUNT(*) as total FROM forums'
  );
  const totalForumPosts = (forumResult as any)[0].total;

  // Get pending reports
  const [reportsResult] = await sequelize.query(
    "SELECT COUNT(*) as total FROM forum_reports WHERE status = 'pending'"
  );
  const pendingReports = (reportsResult as any)[0].total;

  // Get new users in last 30 days
  const [newUsersResult] = await sequelize.query(
    'SELECT COUNT(*) as total FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
  );
  const newUsersLast30Days = (newUsersResult as any)[0].total;

  // Get new courses in last 30 days
  const [newCoursesResult] = await sequelize.query(
    'SELECT COUNT(*) as total FROM courses WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
  );
  const newCoursesLast30Days = (newCoursesResult as any)[0].total;

  return {
    totalPelajar: userStats.total_pelajar || 0,
    totalMentor: userStats.total_mentor || 0,
    totalMentorVerified: userStats.total_mentor_verified || 0,
    totalMentorPending: userStats.total_mentor_pending || 0,
    totalUsers: userStats.total_users || 0,
    totalCourses: courseStats.total_courses || 0,
    totalCoursesPublished: courseStats.total_courses_published || 0,
    totalEnrollments,
    totalForumPosts,
    pendingReports,
    newUsersLast30Days,
    newCoursesLast30Days
  };
};

export const getPendingMentors = async (): Promise<PendingMentor[]> => {
  const mentors = await User.findAll({
    where: {
      role: 'mentor',
      is_verified: false
    },
    attributes: ['id', 'name', 'email', 'cv_url', 'expertise', 'experience', 'created_at'],
    order: [['created_at', 'ASC']]
  });

  return mentors.map(m => {
    const mentor = m.toJSON() as any;
    return {
      id: mentor.id,
      name: mentor.name,
      email: mentor.email,
      cv_url: mentor.cv_url,
      expertise: mentor.expertise,
      experience: mentor.experience,
      created_at: mentor.created_at ? new Date(mentor.created_at).toISOString() : new Date().toISOString()
    } as PendingMentor;
  });
};

export const verifyMentor = async (mentorId: number, adminId: number) => {
  const mentor = await User.findByPk(mentorId);
  
  if (!mentor) {
    throw new Error('Mentor tidak ditemukan');
  }

  if (mentor.role !== 'mentor') {
    throw new Error('User bukan mentor');
  }

  if (mentor.is_verified) {
    throw new Error('Mentor sudah terverifikasi');
  }

  // Verify mentor
  await mentor.update({ is_verified: true });

  // Log admin action
  await logAdminAction(adminId, 'verify_mentor', 'user', mentorId, `Verified mentor: ${mentor.name}`);

  // Create notification for mentor
  await sequelize.query(
    `INSERT INTO notifications (user_id, type, title, message, is_read)
    VALUES (?, 'mentor_approved', 'Akun Disetujui!', 'Selamat! Akun mentor Anda telah disetujui oleh admin.', FALSE)`,
    { replacements: [mentorId] }
  );

  return mentor;
};

export const rejectMentor = async (mentorId: number, adminId: number, reason?: string) => {
  const mentor = await User.findByPk(mentorId);
  
  if (!mentor) {
    throw new Error('Mentor tidak ditemukan');
  }

  if (mentor.role !== 'mentor') {
    throw new Error('User bukan mentor');
  }

  // Log admin action
  await logAdminAction(adminId, 'reject_mentor', 'user', mentorId, `Rejected mentor: ${mentor.name}. Reason: ${reason || 'N/A'}`);

  // Create notification for mentor
  const message = reason 
    ? `Mohon maaf, pendaftaran mentor Anda ditolak. Alasan: ${reason}`
    : 'Mohon maaf, pendaftaran mentor Anda ditolak.';
  
  await sequelize.query(
    `INSERT INTO notifications (user_id, type, title, message, is_read)
    VALUES (?, 'mentor_rejected', 'Pendaftaran Ditolak', ?, FALSE)`,
    { replacements: [mentorId, message] }
  );

  // Delete the mentor account
  await mentor.destroy();

  return { message: 'Mentor berhasil ditolak dan dihapus' };
};

export const getAllUsers = async (filters: {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { role, search, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  let whereConditions = "role != 'admin'";
  const replacements: any[] = [];
  
  if (role) {
    whereConditions += ` AND role = ?`;
    replacements.push(role);
  }
  
  if (search) {
    whereConditions += ` AND (name LIKE ? OR email LIKE ?)`;
    const searchPattern = `%${search}%`;
    replacements.push(searchPattern, searchPattern);
  }

  // Get users with related counts
  const [users] = await sequelize.query(
    `SELECT 
      u.*,
      (SELECT COUNT(*) FROM enrollments WHERE user_id = u.id) as total_enrollments,
      (SELECT COUNT(*) FROM courses WHERE mentor_id = u.id) as total_courses
    FROM users u
    WHERE ${whereConditions}
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?`,
    { replacements: [...replacements, limit, offset] }
  );

  // Get total count
  const [countResult] = await sequelize.query(
    `SELECT COUNT(*) as total FROM users WHERE ${whereConditions}`,
    { replacements }
  );
  const totalUsers = (countResult as any)[0].total;

  return {
    users,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
      limit
    }
  };
};

export const suspendUser = async (userId: number, adminId: number, reason?: string) => {
  const user = await User.findByPk(userId);
  
  if (!user) {
    throw new Error('User tidak ditemukan');
  }

  if (user.role === 'admin') {
    throw new Error('Tidak dapat suspend admin');
  }

  // Toggle suspend
  const newSuspendedStatus = !user.is_suspended;
  await user.update({ is_suspended: newSuspendedStatus });

  // Log admin action
  const action = newSuspendedStatus ? 'suspend_user' : 'unsuspend_user';
  await logAdminAction(adminId, action, 'user', userId, `${action}: ${user.name}. Reason: ${reason || 'N/A'}`);

  // Create notification
  if (newSuspendedStatus) {
    await sequelize.query(
      `INSERT INTO notifications (user_id, type, title, message, is_read)
      VALUES (?, 'account_suspended', 'Akun Ditangguhkan', 'Akun Anda telah ditangguhkan oleh admin.', FALSE)`,
      { replacements: [userId] }
    );
  }

  return user;
};

export const deleteUser = async (userId: number, adminId: number) => {
  const user = await User.findByPk(userId);
  
  if (!user) {
    throw new Error('User tidak ditemukan');
  }

  if (user.role === 'admin') {
    throw new Error('Tidak dapat menghapus admin');
  }

  // Log admin action
  await logAdminAction(adminId, 'delete_user', 'user', userId, `Deleted user: ${user.name}`);

  // Delete user
  await user.destroy();

  return { message: 'User berhasil dihapus' };
};

export const getAllCourses = async (filters: {
  search?: string;
  is_published?: boolean;
  page?: number;
  limit?: number;
}) => {
  const { search, is_published, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  let whereConditions = '1=1';
  const replacements: any[] = [];
  
  if (is_published !== undefined) {
    whereConditions += ` AND c.is_published = ?`;
    replacements.push(is_published ? 1 : 0);
  }
  
  if (search) {
    whereConditions += ` AND (c.title LIKE ? OR c.description LIKE ?)`;
    const searchPattern = `%${search}%`;
    replacements.push(searchPattern, searchPattern);
  }

  // Get courses with stats
  const [courses] = await sequelize.query(
    `SELECT 
      c.*,
      u.name as mentor_name,
      (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrollment_count,
      (SELECT COUNT(*) FROM materials WHERE course_id = c.id) as materials_count
    FROM courses c
    JOIN users u ON c.mentor_id = u.id
    WHERE ${whereConditions}
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?`,
    { replacements: [...replacements, limit, offset] }
  );

  // Get total count
  const [countResult] = await sequelize.query(
    `SELECT COUNT(*) as total FROM courses c WHERE ${whereConditions}`,
    { replacements }
  );
  const totalCourses = (countResult as any)[0].total;

  return {
    courses,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCourses / limit),
      totalCourses,
      limit
    }
  };
};

export const unpublishCourse = async (courseId: number, adminId: number, reason?: string) => {
  const course = await Course.findByPk(courseId);
  
  if (!course) {
    throw new Error('Kursus tidak ditemukan');
  }

  // Toggle publish status
  const newPublishedStatus = !course.is_published;
  await course.update({ is_published: newPublishedStatus });

  // Log admin action
  const action = newPublishedStatus ? 'publish_course' : 'unpublish_course';
  await logAdminAction(adminId, action, 'course', courseId, `${action}: ${course.title}. Reason: ${reason || 'N/A'}`);

  // Notify mentor
  if (!newPublishedStatus) {
    await sequelize.query(
      `INSERT INTO notifications (user_id, type, title, message, is_read)
      VALUES (?, 'course_unpublished', 'Kursus Di-unpublish', ?, FALSE)`,
      { replacements: [course.mentor_id, `Kursus "${course.title}" telah di-unpublish oleh admin.`] }
    );
  }

  return course;
};

export const deleteCourse = async (courseId: number, adminId: number) => {
  const course = await Course.findByPk(courseId);
  
  if (!course) {
    throw new Error('Kursus tidak ditemukan');
  }

  // Log admin action
  await logAdminAction(adminId, 'delete_course', 'course', courseId, `Deleted course: ${course.title}`);

  // Notify mentor
  await sequelize.query(
    `INSERT INTO notifications (user_id, type, title, message, is_read)
    VALUES (?, 'course_deleted', 'Kursus Dihapus', ?, FALSE)`,
    { replacements: [course.mentor_id, `Kursus "${course.title}" telah dihapus oleh admin.`] }
  );

  // Delete course
  await course.destroy();

  return { message: 'Kursus berhasil dihapus' };
};

export const getPendingReports = async (page: number = 1, limit: number = 20) => {
  const offset = (page - 1) * limit;

  const [reports] = await sequelize.query(
    `SELECT 
      fr.*,
      reporter.name as reporter_name,
      reporter.email as reporter_email,
      CASE 
        WHEN fr.forum_id IS NOT NULL THEN (SELECT title FROM forums WHERE id = fr.forum_id)
        ELSE NULL
      END as forum_title,
      CASE 
        WHEN fr.reply_id IS NOT NULL THEN (SELECT content FROM forum_replies WHERE id = fr.reply_id)
        ELSE NULL
      END as reply_content,
      CASE 
        WHEN fr.forum_id IS NOT NULL THEN (SELECT content FROM forums WHERE id = fr.forum_id)
        ELSE NULL
      END as forum_content
    FROM forum_reports fr
    JOIN users reporter ON fr.reporter_id = reporter.id
    WHERE fr.status = 'pending'
    ORDER BY fr.created_at DESC
    LIMIT ? OFFSET ?`,
    { replacements: [limit, offset] }
  );

  // Get total count
  const [countResult] = await sequelize.query(
    "SELECT COUNT(*) as total FROM forum_reports WHERE status = 'pending'"
  );
  const totalReports = (countResult as any)[0].total;

  return {
    reports,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalReports / limit),
      totalReports,
      limit
    }
  };
};

export const resolveReport = async (
  reportId: number,
  adminId: number,
  action: 'delete_content' | 'dismiss',
  reason?: string
) => {
  const report = await ForumReport.findByPk(reportId);
  
  if (!report) {
    throw new Error('Laporan tidak ditemukan');
  }

  if (report.status !== 'pending') {
    throw new Error('Laporan sudah diproses');
  }

  if (action === 'delete_content') {
    // Delete the reported content
    if (report.forum_id) {
      const forum = await Forum.findByPk(report.forum_id);
      if (forum) {
        await logAdminAction(adminId, 'delete_forum', 'forum', report.forum_id, `Deleted reported forum: ${forum.title}`);
        await forum.destroy();
      }
    } else if (report.reply_id) {
      const reply = await ForumReply.findByPk(report.reply_id);
      if (reply) {
        await logAdminAction(adminId, 'delete_reply', 'reply', report.reply_id, `Deleted reported reply`);
        await reply.destroy();
      }
    }

    // Update report status
    await report.update({
      status: 'resolved',
      resolved_at: new Date(),
      resolved_by: adminId
    });
  } else {
    // Dismiss report
    await report.update({
      status: 'dismissed',
      resolved_at: new Date(),
      resolved_by: adminId
    });

    await logAdminAction(adminId, 'dismiss_report', 'report', reportId, `Dismissed report. Reason: ${reason || 'N/A'}`);
  }

  return report;
};

export const getAdminLogs = async (page: number = 1, limit: number = 50) => {
  const offset = (page - 1) * limit;

  // Check if admin_logs table exists, if not return empty array
  try {
    const [logs] = await sequelize.query(
      `SELECT 
        al.*,
        u.name as admin_name,
        u.email as admin_email
      FROM admin_logs al
      JOIN users u ON al.admin_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?`,
      { replacements: [limit, offset] }
    );

    // Get total count
    const [countResult] = await sequelize.query(
      'SELECT COUNT(*) as total FROM admin_logs'
    );
    const totalLogs = (countResult as any)[0].total;

    return {
      logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalLogs / limit),
        totalLogs,
        limit
      }
    };
  } catch (error) {
    // If table doesn't exist, return empty
    return {
      logs: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalLogs: 0,
        limit
      }
    };
  }
};

const logAdminAction = async (
  adminId: number,
  action: string,
  targetType: string,
  targetId: number,
  description: string
) => {
  try {
    // Try to insert into admin_logs table
    await sequelize.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id, description, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())`,
      { replacements: [adminId, action, targetType, targetId, description] }
    );
  } catch (error) {
    // If table doesn't exist, just log to console
    console.log(`[ADMIN ACTION] ${action} by admin ${adminId}: ${description}`);
  }
};

