import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import User from '../models/User';
import sequelize from '../config/database';

interface CreateCourseInput {
  mentor_id: number;
  title: string;
  description?: string;
  category?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  education_level?: 'SD' | 'SMP' | 'SMA' | 'Kuliah';
  price?: number;
  thumbnail_url?: string;
  is_published?: boolean;
}

interface UpdateCourseInput {
  title?: string;
  description?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  education_level?: 'SD' | 'SMP' | 'SMA' | 'Kuliah';
  price?: number;
  thumbnail_url?: string;
  is_published?: boolean;
}

interface FilterOptions {
  category?: string;
  difficulty?: string;
  education_level?: string;
  search?: string;
  mentor_id?: number;
  is_published?: boolean;
  page?: number;
  limit?: number;
}

export const createCourse = async (input: CreateCourseInput) => {
  const course = await Course.create(input);
  return course;
};

export const getCourseById = async (courseId: number, userId?: number) => {
  const course = await Course.findByPk(courseId);
  
  if (!course) {
    throw new Error('Kursus tidak ditemukan');
  }

  // Get mentor info
  const [mentorResult] = await sequelize.query(
    'SELECT id, name, email, photo_url, expertise FROM users WHERE id = ?',
    { replacements: [course.mentor_id] }
  );
  const mentor = (mentorResult as any)[0];

  // Get enrollment count
  const [enrollmentResult] = await sequelize.query(
    'SELECT COUNT(*) as total FROM enrollments WHERE course_id = ?',
    { replacements: [courseId] }
  );
  const enrollmentCount = (enrollmentResult as any)[0].total;

  // Check if user is enrolled
  let isEnrolled = false;
  if (userId) {
    const enrollment = await Enrollment.findOne({
      where: { user_id: userId, course_id: courseId }
    });
    isEnrolled = !!enrollment;
  }

  // Get materials count
  const [materialsResult] = await sequelize.query(
    'SELECT COUNT(*) as total FROM materials WHERE course_id = ?',
    { replacements: [courseId] }
  );
  const materialsCount = (materialsResult as any)[0].total;

  return {
    ...course.toJSON(),
    mentor,
    enrollmentCount,
    materialsCount,
    isEnrolled
  };
};

export const updateCourse = async (courseId: number, mentorId: number, input: UpdateCourseInput) => {
  const course = await Course.findByPk(courseId);
  
  if (!course) {
    throw new Error('Kursus tidak ditemukan');
  }

  if (course.mentor_id !== mentorId) {
    throw new Error('Anda tidak memiliki akses untuk mengubah kursus ini');
  }

  await course.update(input);
  return course;
};

export const deleteCourse = async (courseId: number, mentorId: number) => {
  const course = await Course.findByPk(courseId);
  
  if (!course) {
    throw new Error('Kursus tidak ditemukan');
  }

  if (course.mentor_id !== mentorId) {
    throw new Error('Anda tidak memiliki akses untuk menghapus kursus ini');
  }

  await course.destroy();
  return { message: 'Kursus berhasil dihapus' };
};

export const getMyCourses = async (mentorId: number) => {
  const courses = await Course.findAll({
    where: { mentor_id: mentorId },
    order: [['created_at', 'DESC']]
  });

  // Get enrollment counts for each course
  const coursesWithStats = await Promise.all(
    courses.map(async (course) => {
      const [enrollmentResult] = await sequelize.query(
        'SELECT COUNT(*) as total FROM enrollments WHERE course_id = ?',
        { replacements: [course.id] }
      );
      const enrollmentCount = (enrollmentResult as any)[0].total;

      const [materialsResult] = await sequelize.query(
        'SELECT COUNT(*) as total FROM materials WHERE course_id = ?',
        { replacements: [course.id] }
      );
      const materialsCount = (materialsResult as any)[0].total;

      return {
        ...course.toJSON(),
        enrollmentCount,
        materialsCount
      };
    })
  );

  return coursesWithStats;
};

export const getAllCourses = async (filters: FilterOptions) => {
  const { category, difficulty, education_level, search, is_published = true, page = 1, limit = 12 } = filters;
  const offset = (page - 1) * limit;

  // Build conditions array for WHERE clause
  const conditions: string[] = [`c.is_published = ${is_published ? 1 : 0}`];
  const replacements: any[] = [];

  if (search) {
    conditions.push(`(c.title LIKE ? OR c.description LIKE ?)`);
    const searchPattern = `%${search}%`;
    replacements.push(searchPattern, searchPattern);
  }

  if (category) {
    conditions.push(`c.category = ?`);
    replacements.push(category);
  }

  if (difficulty) {
    conditions.push(`c.difficulty = ?`);
    replacements.push(difficulty);
  }

  if (education_level) {
    conditions.push(`c.education_level = ?`);
    replacements.push(education_level);
  }

  const whereClause = conditions.join(' AND ');

  // Get courses with mentor info and enrollment count
  const [coursesResult] = await sequelize.query(
    `SELECT 
      c.*,
      u.name as mentor_name,
      u.photo_url as mentor_photo,
      (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrollment_count,
      (SELECT COUNT(*) FROM materials WHERE course_id = c.id) as materials_count
    FROM courses c
    JOIN users u ON c.mentor_id = u.id
    WHERE ${whereClause}
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?`,
    { replacements: [...replacements, limit, offset] }
  );

  // Get total count for pagination
  const [countResult] = await sequelize.query(
    `SELECT COUNT(*) as total
    FROM courses c
    WHERE ${whereClause}`,
    { replacements }
  );
  const totalCourses = (countResult as any)[0].total;

  return {
    courses: coursesResult,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCourses / limit),
      totalCourses,
      limit
    }
  };
};

export const enrollCourse = async (userId: number, courseId: number) => {
  // Check if course exists and is published
  const course = await Course.findByPk(courseId);
  
  if (!course) {
    throw new Error('Kursus tidak ditemukan');
  }

  if (!course.is_published) {
    throw new Error('Kursus ini belum dipublikasikan');
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    where: { user_id: userId, course_id: courseId }
  });

  if (existingEnrollment) {
    throw new Error('Anda sudah terdaftar di kursus ini');
  }

  // Create enrollment
  const enrollment = await Enrollment.create({
    user_id: userId,
    course_id: courseId,
    progress: 0
  });

  return enrollment;
};

export const getMyEnrolledCourses = async (userId: number) => {
  const [enrolledCourses] = await sequelize.query(
    `SELECT 
      c.*,
      e.enrolled_at,
      e.completed_at,
      e.progress,
      u.name as mentor_name,
      u.photo_url as mentor_photo,
      (SELECT COUNT(*) FROM materials WHERE course_id = c.id) as materials_count,
      (SELECT COUNT(*) FROM material_progress mp 
       JOIN materials m ON mp.material_id = m.id 
       WHERE m.course_id = c.id AND mp.user_id = ? AND mp.is_completed = TRUE) as completed_materials
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    JOIN users u ON c.mentor_id = u.id
    WHERE e.user_id = ?
    ORDER BY e.enrolled_at DESC`,
    { replacements: [userId, userId] }
  );

  return enrolledCourses;
};

export const unenrollCourse = async (userId: number, courseId: number) => {
  const enrollment = await Enrollment.findOne({
    where: { user_id: userId, course_id: courseId }
  });

  if (!enrollment) {
    throw new Error('Anda tidak terdaftar di kursus ini');
  }

  await enrollment.destroy();
  return { message: 'Berhasil keluar dari kursus' };
};

