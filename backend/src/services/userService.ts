import sequelize from '../config/database';

export const getVerifiedMentors = async () => {
  const [mentors] = await sequelize.query(
    `SELECT 
      id,
      name,
      email,
      photo_url,
      bio,
      expertise,
      experience,
      created_at
    FROM users 
    WHERE role = 'mentor' 
      AND is_verified = TRUE 
      AND is_suspended = FALSE
    ORDER BY name ASC`
  );

  return mentors;
};

