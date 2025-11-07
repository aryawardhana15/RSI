import sequelize from '../config/database';

interface UserStats {
  total_xp: number;
  current_level: number;
  level_name: string;
  level_progress: number;
  next_level_xp: number;
  total_badges: number;
  completed_missions: number;
  rank: number;
}

interface BadgeProgress {
  badge_id: number;
  badge_name: string;
  description: string;
  icon_url?: string;
  requirement: string;
  earned: boolean;
  earned_at?: string;
}

interface MissionProgress {
  mission_id: number;
  title: string;
  description: string;
  type: string;
  requirement_type: string;
  requirement_count: number;
  current_progress: number;
  xp_reward: number;
  badge_reward?: number;
  is_completed: boolean;
  completed_at?: string;
  reset_at?: string;
  progress_percentage: number;
}

export const getUserStats = async (userId: number): Promise<UserStats> => {
  // Get user gamification data
  const [gamificationResult] = await sequelize.query(
    `SELECT 
      ug.total_xp,
      ug.current_level,
      l.level_name,
      l.xp_required as current_level_xp,
      (SELECT xp_required FROM levels WHERE level_number = ug.current_level + 1) as next_level_xp
    FROM user_gamification ug
    JOIN levels l ON ug.current_level = l.level_number
    WHERE ug.user_id = ?`,
    { replacements: [userId] }
  );

  if (!gamificationResult || (gamificationResult as any[]).length === 0) {
    // Create gamification record if not exists
    await sequelize.query(
      'INSERT INTO user_gamification (user_id, total_xp, current_level) VALUES (?, 0, 1)',
      { replacements: [userId] }
    );

    return {
      total_xp: 0,
      current_level: 1,
      level_name: 'Pemula',
      level_progress: 0,
      next_level_xp: 100,
      total_badges: 0,
      completed_missions: 0,
      rank: 0
    };
  }

  const gamification = (gamificationResult as any)[0];

  // Calculate level progress
  const currentLevelXP = gamification.current_level_xp || 0;
  const nextLevelXP = gamification.next_level_xp || gamification.current_level_xp || 100;
  const xpInCurrentLevel = gamification.total_xp - currentLevelXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
  const levelProgress = xpNeededForNextLevel > 0 
    ? Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100)
    : 100;

  // Get total badges
  const [badgesResult] = await sequelize.query(
    'SELECT COUNT(*) as total FROM user_badges WHERE user_id = ?',
    { replacements: [userId] }
  );
  const totalBadges = (badgesResult as any)[0].total;

  // Get completed missions
  const [missionsResult] = await sequelize.query(
    'SELECT COUNT(*) as total FROM user_missions WHERE user_id = ? AND is_completed = TRUE',
    { replacements: [userId] }
  );
  const completedMissions = (missionsResult as any)[0].total;

  // Get user rank
  const [rankResult] = await sequelize.query(
    `SELECT COUNT(*) + 1 as rank
    FROM user_gamification ug
    WHERE ug.total_xp > (SELECT total_xp FROM user_gamification WHERE user_id = ?)
    AND ug.user_id IN (SELECT id FROM users WHERE role = 'pelajar' AND is_suspended = FALSE)`,
    { replacements: [userId] }
  );
  const rank = (rankResult as any)[0]?.rank || 0;

  return {
    total_xp: gamification.total_xp,
    current_level: gamification.current_level,
    level_name: gamification.level_name,
    level_progress: levelProgress,
    next_level_xp: nextLevelXP,
    total_badges: totalBadges,
    completed_missions: completedMissions,
    rank
  };
};

export const getLeaderboard = async (page: number = 1, limit: number = 20) => {
  const offset = (page - 1) * limit;

  const [leaderboard] = await sequelize.query(
    `SELECT 
      u.id,
      u.name,
      u.photo_url,
      ug.total_xp,
      ug.current_level,
      l.level_name,
      (SELECT COUNT(*) FROM user_badges WHERE user_id = u.id) as total_badges,
      (SELECT COUNT(*) FROM enrollments WHERE user_id = u.id AND completed_at IS NOT NULL) as courses_completed,
      ROW_NUMBER() OVER (ORDER BY ug.total_xp DESC) as rank
    FROM users u
    JOIN user_gamification ug ON u.id = ug.user_id
    JOIN levels l ON ug.current_level = l.level_number
    WHERE u.role = 'pelajar' AND u.is_suspended = FALSE
    ORDER BY ug.total_xp DESC
    LIMIT ? OFFSET ?`,
    { replacements: [limit, offset] }
  );

  // Get total count
  const [countResult] = await sequelize.query(
    `SELECT COUNT(*) as total
    FROM users u
    JOIN user_gamification ug ON u.id = ug.user_id
    WHERE u.role = 'pelajar' AND u.is_suspended = FALSE`
  );
  const totalUsers = (countResult as any)[0].total;

  return {
    leaderboard,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
      limit
    }
  };
};

export const getAllBadges = async (userId: number): Promise<BadgeProgress[]> => {
  const [badges] = await sequelize.query(
    `SELECT 
      b.id as badge_id,
      b.name as badge_name,
      b.description,
      b.icon_url,
      b.requirement,
      CASE WHEN ub.id IS NOT NULL THEN TRUE ELSE FALSE END as earned,
      ub.earned_at
    FROM badges b
    LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = ?
    ORDER BY earned DESC, b.id ASC`,
    { replacements: [userId] }
  );

  return badges as BadgeProgress[];
};

export const getUserMissions = async (userId: number): Promise<MissionProgress[]> => {
  // First, ensure user has mission records
  await initializeUserMissions(userId);

  const [missions] = await sequelize.query(
    `SELECT 
      m.id as mission_id,
      m.title,
      m.description,
      m.type,
      m.requirement_type,
      m.requirement_count,
      m.xp_reward,
      m.badge_reward,
      COALESCE(um.progress, 0) as current_progress,
      COALESCE(um.is_completed, FALSE) as is_completed,
      um.completed_at,
      um.reset_at,
      ROUND((COALESCE(um.progress, 0) / m.requirement_count) * 100) as progress_percentage
    FROM missions m
    LEFT JOIN user_missions um ON m.id = um.mission_id AND um.user_id = ?
    ORDER BY 
      CASE m.type 
        WHEN 'daily' THEN 1 
        WHEN 'weekly' THEN 2 
        WHEN 'achievement' THEN 3 
      END,
      um.is_completed ASC,
      m.id ASC`,
    { replacements: [userId] }
  );

  return missions as MissionProgress[];
};

const initializeUserMissions = async (userId: number) => {
  // Get all missions
  const [missions] = await sequelize.query(
    `SELECT id, type FROM missions`
  );

  // Check which missions user doesn't have
  for (const mission of missions as any[]) {
    const [existingMission] = await sequelize.query(
      'SELECT id FROM user_missions WHERE user_id = ? AND mission_id = ?',
      { replacements: [userId, mission.id] }
    );

    if (!existingMission || (existingMission as any[]).length === 0) {
      // Create mission record
      const resetAt = mission.type === 'daily' 
        ? new Date(Date.now() + 24 * 60 * 60 * 1000)
        : mission.type === 'weekly'
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        : null;

      await sequelize.query(
        `INSERT INTO user_missions (user_id, mission_id, progress, is_completed, reset_at)
        VALUES (?, ?, 0, FALSE, ?)`,
        { replacements: [userId, mission.id, resetAt] }
      );
    }
  }
};

export const updateMissionProgress = async (
  userId: number,
  missionType: string,
  amount: number = 1
) => {
  try {
    // Get missions of this type that are not completed or need reset
    const [missions] = await sequelize.query(
      `SELECT 
        m.id as mission_id,
        m.requirement_count,
        m.xp_reward,
        m.badge_reward,
        m.type,
        um.id as user_mission_id,
        um.progress,
        um.is_completed,
        um.reset_at
      FROM missions m
      LEFT JOIN user_missions um ON m.id = um.mission_id AND um.user_id = ?
      WHERE m.requirement_type = ?
      AND (um.is_completed = FALSE OR um.is_completed IS NULL OR um.reset_at IS NULL OR um.reset_at < NOW())`,
      { replacements: [userId, missionType] }
    );

    for (const mission of missions as any[]) {
      // If mission needs reset (daily/weekly)
      if (mission.reset_at && new Date(mission.reset_at) < new Date()) {
        const newResetAt = mission.type === 'daily' 
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : mission.type === 'weekly'
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          : null;

        await sequelize.query(
          `UPDATE user_missions 
          SET progress = 0, is_completed = FALSE, completed_at = NULL, reset_at = ?
          WHERE user_id = ? AND mission_id = ?`,
          { 
            replacements: [
              newResetAt,
              userId,
              mission.mission_id
            ] 
          }
        );
        mission.progress = 0;
        mission.is_completed = false;
      }

      // Update progress only if not completed
      if (!mission.is_completed) {
        const newProgress = (mission.progress || 0) + amount;
        
        // Update or create user_mission record
        if (mission.user_mission_id) {
          await sequelize.query(
            `UPDATE user_missions SET progress = ? WHERE user_id = ? AND mission_id = ?`,
            { replacements: [newProgress, userId, mission.mission_id] }
          );
        } else {
          const resetAt = mission.type === 'daily' 
            ? new Date(Date.now() + 24 * 60 * 60 * 1000)
            : mission.type === 'weekly'
            ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            : null;

          await sequelize.query(
            `INSERT INTO user_missions (user_id, mission_id, progress, is_completed, reset_at)
            VALUES (?, ?, ?, FALSE, ?)`,
            { replacements: [userId, mission.mission_id, newProgress, resetAt] }
          );
        }

        // Check if mission is completed
        if (newProgress >= mission.requirement_count) {
          await completeMission(userId, mission.mission_id, mission.xp_reward, mission.badge_reward);
        }
      }
    }
  } catch (error) {
    console.error('Error updating mission progress:', error);
  }
};

const completeMission = async (
  userId: number,
  missionId: number,
  xpReward: number,
  badgeReward?: number
) => {
  // Mark mission as completed
  await sequelize.query(
    `UPDATE user_missions 
    SET is_completed = TRUE, completed_at = NOW()
    WHERE user_id = ? AND mission_id = ?`,
    { replacements: [userId, missionId] }
  );

  // Give XP reward
  await addXP(userId, xpReward, 'mission_completed');

  // Give badge reward if any
  if (badgeReward) {
    await awardBadge(userId, badgeReward);
  }

  // Create notification
  await sequelize.query(
    `INSERT INTO notifications (user_id, type, title, message, is_read)
    VALUES (?, 'mission_completed', 'Misi Selesai!', ?, FALSE)`,
    { replacements: [userId, `Anda mendapatkan ${xpReward} XP!`] }
  );
};

export const awardBadge = async (userId: number, badgeId: number) => {
  // Check if already has badge
  const [existingBadge] = await sequelize.query(
    'SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?',
    { replacements: [userId, badgeId] }
  );

  if (!existingBadge || (existingBadge as any[]).length === 0) {
    // Award badge
    await sequelize.query(
      'INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES (?, ?, NOW())',
      { replacements: [userId, badgeId] }
    );

    // Get badge info
    const [badgeInfo] = await sequelize.query(
      'SELECT name FROM badges WHERE id = ?',
      { replacements: [badgeId] }
    );
    const badgeName = (badgeInfo as any)[0]?.name || 'Badge';

    // Create notification
    await sequelize.query(
      `INSERT INTO notifications (user_id, type, title, message, is_read)
      VALUES (?, 'badge_earned', 'Badge Baru!', ?, FALSE)`,
      { replacements: [userId, `Anda mendapatkan badge "${badgeName}"!`] }
    );
  }
};

export const addXP = async (userId: number, xpAmount: number, reason: string) => {
  try {
    // Insert XP history
    await sequelize.query(
      'INSERT INTO xp_history (user_id, xp_amount, reason) VALUES (?, ?, ?)',
      { replacements: [userId, xpAmount, reason] }
    );

    // Get current gamification data
    const [gamificationResult] = await sequelize.query(
      'SELECT * FROM user_gamification WHERE user_id = ?',
      { replacements: [userId] }
    );

    if (gamificationResult && (gamificationResult as any[]).length > 0) {
      const currentData = (gamificationResult as any)[0];
      const oldLevel = currentData.current_level;
      const newTotalXP = currentData.total_xp + xpAmount;

      // Update total XP
      await sequelize.query(
        'UPDATE user_gamification SET total_xp = ? WHERE user_id = ?',
        { replacements: [newTotalXP, userId] }
      );

      // Check for level up
      const [levelResult] = await sequelize.query(
        'SELECT level_number, level_name FROM levels WHERE xp_required <= ? ORDER BY xp_required DESC LIMIT 1',
        { replacements: [newTotalXP] }
      );

      if (levelResult && (levelResult as any[]).length > 0) {
        const newLevel = (levelResult as any)[0].level_number;
        const levelName = (levelResult as any)[0].level_name;

        if (newLevel > oldLevel) {
          // Level up!
          await sequelize.query(
            'UPDATE user_gamification SET current_level = ? WHERE user_id = ?',
            { replacements: [newLevel, userId] }
          );

          // Create notification
          await sequelize.query(
            `INSERT INTO notifications (user_id, type, title, message, is_read)
            VALUES (?, 'level_up', 'Naik Level!', ?, FALSE)`,
            { replacements: [userId, `Selamat! Anda naik ke level ${newLevel}: ${levelName}`] }
          );
        }
      }
    } else {
      // Create gamification record
      await sequelize.query(
        'INSERT INTO user_gamification (user_id, total_xp, current_level) VALUES (?, ?, 1)',
        { replacements: [userId, xpAmount] }
      );
    }

    // Update mission progress for XP-related missions
    await updateMissionProgress(userId, 'earn_xp', xpAmount);
  } catch (error) {
    console.error('Error adding XP:', error);
  }
};

export const getXPHistory = async (userId: number, page: number = 1, limit: number = 20) => {
  const offset = (page - 1) * limit;

  const [history] = await sequelize.query(
    `SELECT * FROM xp_history
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?`,
    { replacements: [userId, limit, offset] }
  );

  // Get total count
  const [countResult] = await sequelize.query(
    `SELECT COUNT(*) as total FROM xp_history WHERE user_id = ?`,
    { replacements: [userId] }
  );
  const total = (countResult as any)[0].total;

  return {
    history,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
      limit
    }
  };
};

export const checkAndAwardBadges = async (userId: number) => {
  // This function checks various conditions and awards badges automatically

  // Example: First Steps badge (complete first material)
  const [firstMaterialResult] = await sequelize.query(
    'SELECT COUNT(*) as total FROM material_progress WHERE user_id = ? AND is_completed = TRUE',
    { replacements: [userId] }
  );
  const completedMaterials = (firstMaterialResult as any)[0].total;

  if (completedMaterials >= 1) {
    await awardBadge(userId, 1); // Badge ID 1: First Steps
  }

  // Example: Course Completer badge (complete 1 course)
  const [coursesResult] = await sequelize.query(
    'SELECT COUNT(*) as total FROM enrollments WHERE user_id = ? AND completed_at IS NOT NULL',
    { replacements: [userId] }
  );
  const completedCourses = (coursesResult as any)[0].total;

  if (completedCourses >= 1) {
    await awardBadge(userId, 4); // Badge ID 4: Course Completer
  }

  // Add more badge conditions here...
};

