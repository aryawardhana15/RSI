import Material from '../models/Material';
import MaterialProgress from '../models/MaterialProgress';
import Course from '../models/Course';
import sequelize from '../config/database';

interface CreateMaterialInput {
  course_id: number;
  title: string;
  description?: string;
  content?: string;
  video_url?: string;
  file_url?: string;
  order_index: number;
}

interface UpdateMaterialInput {
  title?: string;
  description?: string;
  content?: string;
  video_url?: string;
  file_url?: string;
  order_index?: number;
}

// Check if mentor owns the course
const checkMentorOwnership = async (courseId: number, mentorId: number) => {
  const course = await Course.findByPk(courseId);
  
  if (!course) {
    throw new Error('Kursus tidak ditemukan');
  }

  if (course.mentor_id !== mentorId) {
    throw new Error('Anda tidak memiliki akses ke kursus ini');
  }

  return course;
};

export const createMaterial = async (input: CreateMaterialInput, mentorId: number) => {
  // Check ownership
  await checkMentorOwnership(input.course_id, mentorId);

  const material = await Material.create(input);
  return material;
};

export const getMaterialsByCourse = async (courseId: number, userId?: number) => {
  const materials = await Material.findAll({
    where: { course_id: courseId },
    order: [['order_index', 'ASC']]
  });

  // If user is provided, get progress for each material
  if (userId) {
    const materialsWithProgress = await Promise.all(
      materials.map(async (material) => {
        const progress = await MaterialProgress.findOne({
          where: {
            user_id: userId,
            material_id: material.id
          }
        });

        return {
          ...material.toJSON(),
          is_completed: progress?.is_completed || false,
          completed_at: progress?.completed_at || null
        };
      })
    );

    return materialsWithProgress;
  }

  return materials;
};

export const getMaterialById = async (materialId: number, userId?: number) => {
  const material = await Material.findByPk(materialId);
  
  if (!material) {
    throw new Error('Materi tidak ditemukan');
  }

  // Get progress if user provided
  let progress = null;
  if (userId) {
    progress = await MaterialProgress.findOne({
      where: {
        user_id: userId,
        material_id: materialId
      }
    });
  }

  return {
    ...material.toJSON(),
    is_completed: progress?.is_completed || false,
    completed_at: progress?.completed_at || null
  };
};

export const updateMaterial = async (
  materialId: number,
  mentorId: number,
  input: UpdateMaterialInput
) => {
  const material = await Material.findByPk(materialId);
  
  if (!material) {
    throw new Error('Materi tidak ditemukan');
  }

  // Check ownership
  await checkMentorOwnership(material.course_id, mentorId);

  await material.update(input);
  return material;
};

export const deleteMaterial = async (materialId: number, mentorId: number) => {
  const material = await Material.findByPk(materialId);
  
  if (!material) {
    throw new Error('Materi tidak ditemukan');
  }

  // Check ownership
  await checkMentorOwnership(material.course_id, mentorId);

  await material.destroy();
  return { message: 'Materi berhasil dihapus' };
};

export const markMaterialComplete = async (materialId: number, userId: number) => {
  const material = await Material.findByPk(materialId);
  
  if (!material) {
    throw new Error('Materi tidak ditemukan');
  }

  // Check if user is enrolled in the course
  const [enrollmentResult] = await sequelize.query(
    'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
    { replacements: [userId, material.course_id] }
  );

  if (!enrollmentResult || (enrollmentResult as any[]).length === 0) {
    throw new Error('Anda belum terdaftar di kursus ini');
  }

  // Check if progress already exists
  let progress = await MaterialProgress.findOne({
    where: {
      user_id: userId,
      material_id: materialId
    }
  });

  if (progress) {
    // Update existing progress
    await progress.update({
      is_completed: true,
      completed_at: new Date()
    });
  } else {
    // Create new progress
    progress = await MaterialProgress.create({
      user_id: userId,
      material_id: materialId,
      is_completed: true,
      completed_at: new Date()
    });
  }

  // Update enrollment progress
  await updateEnrollmentProgress(userId, material.course_id);

  // Give XP reward (10 XP for completing material)
  await addXP(userId, 10, 'complete_material');

  return progress;
};

// Helper function to update enrollment progress
const updateEnrollmentProgress = async (userId: number, courseId: number) => {
  // Get total materials count
  const [totalResult] = await sequelize.query(
    'SELECT COUNT(*) as total FROM materials WHERE course_id = ?',
    { replacements: [courseId] }
  );
  const totalMaterials = (totalResult as any)[0].total;

  // Get completed materials count
  const [completedResult] = await sequelize.query(
    `SELECT COUNT(*) as total FROM material_progress mp
     JOIN materials m ON mp.material_id = m.id
     WHERE mp.user_id = ? AND m.course_id = ? AND mp.is_completed = TRUE`,
    { replacements: [userId, courseId] }
  );
  const completedMaterials = (completedResult as any)[0].total;

  // Calculate progress percentage
  const progress = totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0;

  // Update enrollment
  await sequelize.query(
    'UPDATE enrollments SET progress = ? WHERE user_id = ? AND course_id = ?',
    { replacements: [progress, userId, courseId] }
  );

  // If all materials completed, mark course as completed
  if (progress === 100) {
    await sequelize.query(
      'UPDATE enrollments SET completed_at = NOW() WHERE user_id = ? AND course_id = ? AND completed_at IS NULL',
      { replacements: [userId, courseId] }
    );

    // Give bonus XP for completing course (50 XP)
    await addXP(userId, 50, 'complete_course');
  }
};

// Helper function to add XP (will be moved to gamification service later)
const addXP = async (userId: number, xpAmount: number, reason: string) => {
  try {
    // Insert XP history
    await sequelize.query(
      'INSERT INTO xp_history (user_id, xp_amount, reason) VALUES (?, ?, ?)',
      { replacements: [userId, xpAmount, reason] }
    );

    // Update total XP in user_gamification
    const [gamificationResult] = await sequelize.query(
      'SELECT * FROM user_gamification WHERE user_id = ?',
      { replacements: [userId] }
    );

    if (gamificationResult && (gamificationResult as any[]).length > 0) {
      const newTotalXP = (gamificationResult as any)[0].total_xp + xpAmount;
      
      await sequelize.query(
        'UPDATE user_gamification SET total_xp = ? WHERE user_id = ?',
        { replacements: [newTotalXP, userId] }
      );

      // Check for level up (simple logic, will be improved in gamification phase)
      const [levelResult] = await sequelize.query(
        'SELECT level_number FROM levels WHERE xp_required <= ? ORDER BY xp_required DESC LIMIT 1',
        { replacements: [newTotalXP] }
      );

      if (levelResult && (levelResult as any[]).length > 0) {
        const newLevel = (levelResult as any)[0].level_number;
        
        await sequelize.query(
          'UPDATE user_gamification SET current_level = ? WHERE user_id = ?',
          { replacements: [newLevel, userId] }
        );
      }
    } else {
      // Create gamification record if not exists
      await sequelize.query(
        'INSERT INTO user_gamification (user_id, total_xp, current_level) VALUES (?, ?, 1)',
        { replacements: [userId, xpAmount] }
      );
    }
  } catch (error) {
    console.error('Error adding XP:', error);
    // Don't throw error, just log it
  }
};

export const reorderMaterials = async (
  courseId: number,
  mentorId: number,
  materialOrders: { id: number; order_index: number }[]
) => {
  // Check ownership
  await checkMentorOwnership(courseId, mentorId);

  // Update order for each material
  await Promise.all(
    materialOrders.map(async (order) => {
      await Material.update(
        { order_index: order.order_index },
        { where: { id: order.id, course_id: courseId } }
      );
    })
  );

  return { message: 'Urutan materi berhasil diupdate' };
};

