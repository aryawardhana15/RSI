-- Migration: Make course_id nullable in chats table
-- This allows chats between pelajar and mentor without requiring a course

ALTER TABLE chats MODIFY COLUMN course_id INT NULL;

-- Update foreign key constraint if needed (MySQL may require dropping and recreating)
-- If you encounter errors, you may need to:
-- 1. ALTER TABLE chats DROP FOREIGN KEY chats_ibfk_3;
-- 2. ALTER TABLE chats MODIFY COLUMN course_id INT NULL;
-- 3. ALTER TABLE chats ADD CONSTRAINT chats_ibfk_3 FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL;

