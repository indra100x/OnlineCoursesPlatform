CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_users_role (role)
);

CREATE TABLE courses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    teacher_id BIGINT UNSIGNED NOT NULL,
    enrollment_code VARCHAR(24) NOT NULL UNIQUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT fk_courses_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_courses_teacher_id (teacher_id)
);

CREATE TABLE enrollments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL,
    course_id BIGINT UNSIGNED NOT NULL,
    enrolled_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT uq_enrollments_student_course UNIQUE (student_id, course_id),
    INDEX idx_enrollments_student_id (student_id),
    INDEX idx_enrollments_course_id (course_id)
);

CREATE TABLE chapters (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    position INT UNSIGNED NOT NULL,
    content_type ENUM('text', 'video', 'file') NOT NULL DEFAULT 'text',
    content LONGTEXT NULL,
    video_url VARCHAR(2048) NULL,
    file_path VARCHAR(255) NULL,
    file_name VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT fk_chapters_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT uq_chapters_course_position UNIQUE (course_id, position),
    INDEX idx_chapters_course_id (course_id)
);

CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    course_id BIGINT UNSIGNED NULL,
    chapter_id BIGINT UNSIGNED NULL,
    type ENUM('chapter_created') NOT NULL DEFAULT 'chapter_created',
    data JSON NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    CONSTRAINT fk_notifications_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL,
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_course_id (course_id),
    INDEX idx_notifications_chapter_id (chapter_id),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_is_read (is_read)
);
