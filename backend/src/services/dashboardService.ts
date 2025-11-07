import User from '../models/User';
import sequelize from '../config/database';

export const getPelajarStats = async (userId: number) => {
  // Get total enrolled courses
  const [enrolledResult] = await sequelize.query(
    'SELECT COUNT(*) as total FROM enrollments WHERE user_id = ?',
    { replacements: [userId] }
  );
  const totalEnrolled = (enrolledResult as any)[0].total;

  // Get completed courses
  const [completedResult] = await sequelize.query(
    'SELECT COUNT(*) as total FROM enrollments WHERE user_id = ? AND completed_at IS NOT NULL',
    { replacements: [userId] }
  );
  const totalCompleted = (completedResult as any)[0].total;

  // Get gamification stats
  const [gamificationResult] = await sequelize.query(
    'SELECT total_xp, current_level FROM user_gamification WHERE user_id = ?',
    { replacements: [userId] }
  );
  const gamification = (gamificationResult as any)[0] || { total_xp: 0, current_level: 1 };

  // Get total badges
  const [badgesResult] = await sequelize.query(
    'SELECT COUNT(*) as total FROM user_badges WHERE user_id = ?',
    { replacements: [userId] }
  );
  const totalBadges = (badgesResult as any)[0].total;

  return {
    totalEnrolled,
    totalCompleted,
    totalXP: gamification.total_xp,
    currentLevel: gamification.current_level,
    totalBadges,
    progressPercentage: totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0
  };
};

export const getMentorStats = async (userId: number) => {
  // Get total courses created
  const [coursesResult] = await sequelize.query(
    'SELECT COUNT(*) as total FROM courses WHERE mentor_id = ?',
    { replacements: [userId] }
  );
  const totalCourses = (coursesResult as any)[0].total;

  // Get published courses
  const [publishedResult] = await sequelize.query(
    'SELECT COUNT(*) as total FROM courses WHERE mentor_id = ? AND is_published = TRUE',
    { replacements: [userId] }
  );
  const totalPublished = (publishedResult as any)[0].total;

  // Get total students across all courses
  const [studentsResult] = await sequelize.query(
    `SELECT COUNT(DISTINCT e.user_id) as total 
     FROM enrollments e 
     JOIN courses c ON e.course_id = c.id 
     WHERE c.mentor_id = ?`,
    { replacements: [userId] }
  );
  const totalStudents = (studentsResult as any)[0].total;

  // Get total materials created
  const [materialsResult] = await sequelize.query(
    `SELECT COUNT(*) as total 
     FROM materials m 
     JOIN courses c ON m.course_id = c.id 
     WHERE c.mentor_id = ?`,
    { replacements: [userId] }
  );
  const totalMaterials = (materialsResult as any)[0].total;

  return {
    totalCourses,
    totalPublished,
    totalStudents,
    totalMaterials
  };
};

export const getMentorStudentChartData = async (userId: number) => {
  // Get enrollment data per month for last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [monthlyEnrollments] = await sequelize.query(
    `SELECT 
      DATE_FORMAT(e.enrolled_at, '%Y-%m') as month,
      COUNT(*) as count
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE c.mentor_id = ? 
      AND e.enrolled_at >= ?
    GROUP BY DATE_FORMAT(e.enrolled_at, '%Y-%m')
    ORDER BY month ASC`,
    { replacements: [userId, sixMonthsAgo] }
  );

  // Get students per course
  const [studentsPerCourse] = await sequelize.query(
    `SELECT 
      c.id,
      c.title,
      COUNT(DISTINCT e.user_id) as student_count
    FROM courses c
    LEFT JOIN enrollments e ON c.id = e.course_id
    WHERE c.mentor_id = ?
    GROUP BY c.id, c.title
    ORDER BY student_count DESC
    LIMIT 10`,
    { replacements: [userId] }
  );

  // Get active vs total students (active = enrolled in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [activeStudentsResult] = await sequelize.query(
    `SELECT COUNT(DISTINCT e.user_id) as total
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     WHERE c.mentor_id = ?
       AND e.enrolled_at >= ?`,
    { replacements: [userId, thirtyDaysAgo] }
  );
  const activeStudents = (activeStudentsResult as any)[0].total;

  const [totalStudentsResult] = await sequelize.query(
    `SELECT COUNT(DISTINCT e.user_id) as total
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     WHERE c.mentor_id = ?`,
    { replacements: [userId] }
  );
  const totalStudents = (totalStudentsResult as any)[0].total;

  // Format monthly data - ensure all 6 months are represented
  const months = [];
  const currentDate = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthData = (monthlyEnrollments as any[]).find((m: any) => m.month === monthKey);
    months.push({
      month: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
      count: monthData ? parseInt(monthData.count) : 0
    });
  }

  return {
    monthlyEnrollments: months,
    studentsPerCourse: studentsPerCourse,
    activeStudents,
    totalStudents
  };
};

export const getAdminStats = async () => {
  // Get total users by role
  const [usersResult] = await sequelize.query(
    `SELECT 
      COUNT(CASE WHEN role = 'pelajar' THEN 1 END) as total_pelajar,
      COUNT(CASE WHEN role = 'mentor' THEN 1 END) as total_mentor,
      COUNT(*) as total_users
     FROM users 
     WHERE role != 'admin'`
  );
  const users = (usersResult as any)[0];

  // Get pending mentor verifications
  const [pendingResult] = await sequelize.query(
    "SELECT COUNT(*) as total FROM users WHERE role = 'mentor' AND is_verified = FALSE"
  );
  const pendingMentors = (pendingResult as any)[0].total;

  // Get total courses
  const [coursesResult] = await sequelize.query(
    'SELECT COUNT(*) as total FROM courses'
  );
  const totalCourses = (coursesResult as any)[0].total;

  // Get total enrollments
  const [enrollmentsResult] = await sequelize.query(
    'SELECT COUNT(*) as total FROM enrollments'
  );
  const totalEnrollments = (enrollmentsResult as any)[0].total;

  // Get pending reports
  const [reportsResult] = await sequelize.query(
    "SELECT COUNT(*) as total FROM forum_reports WHERE status = 'pending'"
  );
  const pendingReports = (reportsResult as any)[0].total;

  return {
    totalPelajar: users.total_pelajar,
    totalMentor: users.total_mentor,
    totalUsers: users.total_users,
    pendingMentors,
    totalCourses,
    totalEnrollments,
    pendingReports
  };
};

