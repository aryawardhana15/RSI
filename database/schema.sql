-- Table: users
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('pelajar', 'mentor', 'admin') NOT NULL,
  bio TEXT,
  photo_url VARCHAR(255),
  cv_url VARCHAR(255),
  expertise TEXT,
  experience TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: courses
CREATE TABLE courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  mentor_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  difficulty ENUM('beginner', 'intermediate', 'advanced'),
  thumbnail_url VARCHAR(255),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: enrollments
CREATE TABLE enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  progress INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (user_id, course_id)
);

-- Table: materials
CREATE TABLE materials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  video_url VARCHAR(255),
  file_url VARCHAR(255),
  order_index INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Table: material_progress
CREATE TABLE material_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  material_id INT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
  UNIQUE KEY unique_progress (user_id, material_id)
);

-- Table: assignments
CREATE TABLE assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('tugas', 'kuis') NOT NULL,
  deadline TIMESTAMP,
  max_score INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Table: quiz_questions (untuk kuis multiple choice)
CREATE TABLE quiz_questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  assignment_id INT NOT NULL,
  question_text TEXT NOT NULL,
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  option_c VARCHAR(255) NOT NULL,
  option_d VARCHAR(255) NOT NULL,
  correct_answer ENUM('a', 'b', 'c', 'd') NOT NULL,
  order_index INT NOT NULL,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
);

-- Table: submissions
CREATE TABLE submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  assignment_id INT NOT NULL,
  user_id INT NOT NULL,
  answer_text TEXT,
  file_url VARCHAR(255),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  score INT,
  feedback TEXT,
  graded_at TIMESTAMP NULL,
  graded_by INT,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table: quiz_answers (untuk menyimpan jawaban kuis)
CREATE TABLE quiz_answers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  submission_id INT NOT NULL,
  question_id INT NOT NULL,
  selected_answer ENUM('a', 'b', 'c', 'd') NOT NULL,
  is_correct BOOLEAN,
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

-- Table: forums
CREATE TABLE forums (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tags VARCHAR(255),
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  likes_count INT DEFAULT 0,
  replies_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: forum_replies
CREATE TABLE forum_replies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  forum_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (forum_id) REFERENCES forums(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: forum_likes
CREATE TABLE forum_likes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  forum_id INT,
  reply_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (forum_id) REFERENCES forums(id) ON DELETE CASCADE,
  FOREIGN KEY (reply_id) REFERENCES forum_replies(id) ON DELETE CASCADE,
  UNIQUE KEY unique_forum_like (user_id, forum_id),
  UNIQUE KEY unique_reply_like (user_id, reply_id)
);

-- Table: forum_reports
CREATE TABLE forum_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reporter_id INT NOT NULL,
  forum_id INT,
  reply_id INT,
  reason TEXT NOT NULL,
  status ENUM('pending', 'resolved', 'dismissed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (forum_id) REFERENCES forums(id) ON DELETE CASCADE,
  FOREIGN KEY (reply_id) REFERENCES forum_replies(id) ON DELETE CASCADE
);

-- Table: chats
CREATE TABLE chats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pelajar_id INT NOT NULL,
  mentor_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pelajar_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_chat (pelajar_id, mentor_id)
);

-- Table: messages
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  chat_id INT NOT NULL,
  sender_id INT NOT NULL,
  content TEXT NOT NULL,
  file_url VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: levels
CREATE TABLE levels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  level_number INT UNIQUE NOT NULL,
  level_name VARCHAR(100) NOT NULL,
  xp_required INT NOT NULL,
  badge_reward VARCHAR(255)
);

-- Table: user_gamification
CREATE TABLE user_gamification (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  total_xp INT DEFAULT 0,
  current_level INT DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (current_level) REFERENCES levels(level_number)
);

-- Table: xp_history
CREATE TABLE xp_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  xp_amount INT NOT NULL,
  reason VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: badges
CREATE TABLE badges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  requirement TEXT
);

-- Table: user_badges
CREATE TABLE user_badges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  badge_id INT NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_badge (user_id, badge_id)
);

-- Table: missions
CREATE TABLE missions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('daily', 'weekly', 'achievement') NOT NULL,
  requirement_type VARCHAR(100) NOT NULL,
  requirement_count INT NOT NULL,
  xp_reward INT NOT NULL,
  badge_reward INT,
  FOREIGN KEY (badge_reward) REFERENCES badges(id) ON DELETE SET NULL
);

-- Table: user_missions
CREATE TABLE user_missions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  mission_id INT NOT NULL,
  progress INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  reset_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_mission (user_id, mission_id)
);

-- Table: notifications
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSON,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default levels
INSERT INTO levels (level_number, level_name, xp_required, badge_reward) VALUES
(1, 'Pemula', 0, NULL),
(2, 'Pelajar Aktif', 100, NULL),
(3, 'Pelajar Berdedikasi', 250, NULL),
(4, 'Pelajar Berbakat', 500, NULL),
(5, 'Pelajar Ahli', 1000, NULL),
(6, 'Master Pelajar', 2000, NULL),
(7, 'Guru Muda', 3500, NULL),
(8, 'Guru Senior', 5500, NULL),
(9, 'Profesor', 8000, NULL),
(10, 'Legenda', 12000, NULL);

-- Insert default badges
INSERT INTO badges (name, description, icon_url, requirement) VALUES
('First Steps', 'Selesaikan materi pertama', NULL, 'Complete first material'),
('Quiz Master', 'Raih nilai 100 pada kuis', NULL, 'Score 100 on any quiz'),
('Discussion Hero', 'Post 10 kali di forum', NULL, 'Create 10 forum posts'),
('Course Completer', 'Selesaikan 1 kursus lengkap', NULL, 'Complete 1 full course'),
('Speed Learner', 'Selesaikan 5 materi dalam 1 hari', NULL, 'Complete 5 materials in one day'),
('Week Warrior', 'Login 7 hari berturut-turut', NULL, 'Login streak 7 days'),
('Social Butterfly', 'Dapat 50 likes di forum', NULL, 'Receive 50 likes on forum posts'),
('Helping Hand', 'Reply 20 kali di forum', NULL, 'Reply 20 times in forums'),
('Top Scorer', 'Raih rata-rata 90+ di 5 tugas', NULL, 'Average 90+ score on 5 assignments'),
('Dedicated Learner', 'Ikuti 5 kursus', NULL, 'Enroll in 5 courses');

-- Insert default missions
INSERT INTO missions (title, description, type, requirement_type, requirement_count, xp_reward, badge_reward) VALUES
('Daily Login', 'Login hari ini', 'daily', 'login', 1, 5, NULL),
('Complete 3 Materials', 'Selesaikan 3 materi hari ini', 'daily', 'complete_material', 3, 20, NULL),
('Forum Participant', 'Post 2 kali di forum hari ini', 'daily', 'forum_post', 2, 10, NULL),
('Weekly Learner', 'Selesaikan 10 materi minggu ini', 'weekly', 'complete_material', 10, 50, NULL),
('Weekly Socializer', 'Post 5 kali di forum minggu ini', 'weekly', 'forum_post', 5, 30, NULL),
('Submit Assignment', 'Submit 2 tugas minggu ini', 'weekly', 'submit_assignment', 2, 40, NULL),
('First Course', 'Selesaikan kursus pertama', 'achievement', 'complete_course', 1, 100, 4),
('Master Student', 'Selesaikan 5 kursus', 'achievement', 'complete_course', 5, 500, 10),
('Discussion Master', 'Buat 50 post di forum', 'achievement', 'forum_post', 50, 200, 3),
('Perfect Score', 'Raih nilai 100 pada kuis', 'achievement', 'perfect_quiz', 1, 50, 2);

-- Insert default admin user (password: admin123)
-- Note: You need to generate bcrypt hash for 'admin123' password
-- You can use: https://bcrypt-generator.com/ or generate it programmatically
-- Example hash: $2b$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq
INSERT INTO users (name, email, password, role, is_verified) VALUES
('Admin', 'admin@rsi.com', '$2b$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'admin', TRUE);

