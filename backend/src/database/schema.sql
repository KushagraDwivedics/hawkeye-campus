-- Hawkeye Campus Database Schema
-- PostgreSQL 12+

-- Drop existing tables (for fresh setup)
DROP TABLE IF EXISTS attendance_logs CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS lecture_sessions CASCADE;
DROP TABLE IF EXISTS lectures CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS semesters CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- Users Table (Base Table)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'faculty')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- Departments Table
-- ============================================
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    head_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_departments_code ON departments(code);

-- ============================================
-- Semesters Table
-- ============================================
CREATE TABLE semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    semester_number INT NOT NULL CHECK (semester_number > 0),
    year VARCHAR(9) NOT NULL, -- e.g., "2023-2024"
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(semester_number, year)
);

CREATE INDEX idx_semesters_active ON semesters(is_active);

-- ============================================
-- Sections Table
-- ============================================
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    capacity INT DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sections_department ON sections(department_id);
CREATE INDEX idx_sections_semester ON sections(semester_id);

-- ============================================
-- Students Table
-- ============================================
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id),
    section_id UUID NOT NULL REFERENCES sections(id),
    semester_id UUID NOT NULL REFERENCES semesters(id),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    current_location_lat DECIMAL(10, 8),
    current_location_lon DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_roll_number ON students(roll_number);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_department ON students(department_id);
CREATE INDEX idx_students_section ON students(section_id);

-- ============================================
-- Faculty Table
-- ============================================
CREATE TABLE faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    faculty_name VARCHAR(255) NOT NULL,
    faculty_code VARCHAR(100) UNIQUE NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id),
    phone VARCHAR(20),
    office_location VARCHAR(255),
    qualifications TEXT,
    specialization VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_faculty_code ON faculty(faculty_code);
CREATE INDEX idx_faculty_user_id ON faculty(user_id);
CREATE INDEX idx_faculty_department ON faculty(department_id);

-- ============================================
-- Subjects Table
-- ============================================
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    credits INT DEFAULT 3,
    department_id UUID NOT NULL REFERENCES departments(id),
    semester_id UUID NOT NULL REFERENCES semesters(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subjects_code ON subjects(code);
CREATE INDEX idx_subjects_department ON subjects(department_id);
CREATE INDEX idx_subjects_semester ON subjects(semester_id);

-- ============================================
-- Lectures Table
-- ============================================
CREATE TABLE lectures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    lecture_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    attendance_window_start TIME NOT NULL,
    attendance_window_end TIME NOT NULL,
    geo_latitude DECIMAL(10, 8) NOT NULL,
    geo_longitude DECIMAL(11, 8) NOT NULL,
    geo_radius INT NOT NULL DEFAULT 50, -- in meters
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lectures_subject ON lectures(subject_id);
CREATE INDEX idx_lectures_faculty ON lectures(faculty_id);
CREATE INDEX idx_lectures_section ON lectures(section_id);
CREATE INDEX idx_lectures_date ON lectures(lecture_date);
CREATE INDEX idx_lectures_active ON lectures(is_active);

-- ============================================
-- Lecture Sessions Table (For Active Sessions)
-- ============================================
CREATE TABLE lecture_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lecture_id UUID UNIQUE NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    qr_code_image TEXT,
    session_started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    session_ends_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lecture_sessions_lecture ON lecture_sessions(lecture_id);
CREATE INDEX idx_lecture_sessions_token ON lecture_sessions(session_token);
CREATE INDEX idx_lecture_sessions_active ON lecture_sessions(is_active);

-- ============================================
-- Attendance Table
-- ============================================
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lecture_id UUID NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'absent' CHECK (status IN ('present', 'absent', 'late')),
    marked_at TIMESTAMP,
    student_lat DECIMAL(10, 8),
    student_lon DECIMAL(11, 8),
    distance_from_venue INT, -- in meters
    qr_verified BOOLEAN DEFAULT false,
    is_modified BOOLEAN DEFAULT false,
    modified_at TIMESTAMP,
    modified_by UUID REFERENCES faculty(id),
    modification_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lecture_id, student_id)
);

CREATE INDEX idx_attendance_lecture ON attendance(lecture_id);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_attendance_marked_at ON attendance(marked_at);

-- ============================================
-- Attendance Logs Table (Audit Trail)
-- ============================================
CREATE TABLE attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_id UUID NOT NULL REFERENCES attendance(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    modified_by_user_id UUID NOT NULL REFERENCES users(id),
    modification_reason TEXT,
    modification_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attendance_logs_attendance ON attendance_logs(attendance_id);
CREATE INDEX idx_attendance_logs_modified_by ON attendance_logs(modified_by_user_id);
CREATE INDEX idx_attendance_logs_timestamp ON attendance_logs(modification_timestamp);

-- ============================================
-- Refresh Tokens Table
-- ============================================
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- ============================================
-- Password Reset Tokens Table
-- ============================================
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

-- ============================================
-- Views for Common Queries
-- ============================================

-- Student Attendance Summary View
CREATE VIEW student_attendance_summary AS
SELECT 
    s.id as student_id,
    s.roll_number,
    s.full_name,
    subj.code as subject_code,
    subj.name as subject_name,
    COUNT(a.id) as total_lectures,
    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
    SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
    SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
    ROUND(100.0 * SUM(CASE WHEN a.status IN ('present', 'late') THEN 1 ELSE 0 END) / NULLIF(COUNT(a.id), 0), 2) as attendance_percentage
FROM students s
JOIN sections sec ON s.section_id = sec.id
JOIN subjects subj ON subj.semester_id = s.semester_id AND subj.department_id = s.department_id
LEFT JOIN lectures l ON l.section_id = sec.id AND l.subject_id = subj.id
LEFT JOIN attendance a ON a.lecture_id = l.id AND a.student_id = s.id
GROUP BY s.id, s.roll_number, s.full_name, subj.code, subj.name;

-- Faculty Lecture Statistics View
CREATE VIEW faculty_lecture_statistics AS
SELECT 
    f.id as faculty_id,
    f.faculty_name,
    COUNT(DISTINCT l.id) as total_lectures,
    COUNT(DISTINCT l.subject_id) as subjects_taught,
    COUNT(DISTINCT l.section_id) as sections_taught,
    AVG(subquery.attendance_percentage) as average_attendance
FROM faculty f
LEFT JOIN lectures l ON l.faculty_id = f.id
LEFT JOIN (
    SELECT 
        l.id,
        ROUND(100.0 * SUM(CASE WHEN a.status IN ('present', 'late') THEN 1 ELSE 0 END) / NULLIF(COUNT(a.id), 0), 2) as attendance_percentage
    FROM lectures l
    LEFT JOIN attendance a ON a.lecture_id = l.id
    GROUP BY l.id
) subquery ON subquery.id = l.id
GROUP BY f.id, f.faculty_name;

-- Active Sessions View
CREATE VIEW active_sessions AS
SELECT 
    ls.id,
    ls.lecture_id,
    ls.session_token,
    ls.session_started_at,
    ls.session_ends_at,
    l.subject_id,
    l.geo_latitude,
    l.geo_longitude,
    l.geo_radius,
    f.faculty_name
FROM lecture_sessions ls
JOIN lectures l ON ls.lecture_id = l.id
JOIN faculty f ON l.faculty_id = f.id
WHERE ls.is_active = true AND ls.session_ends_at > CURRENT_TIMESTAMP;

-- ============================================
-- Triggers for Audit and Automatic Updates
-- ============================================

-- Update updated_at timestamp on users table
CREATE OR REPLACE FUNCTION update_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_timestamp();

-- Update updated_at timestamp on students table
CREATE OR REPLACE FUNCTION update_students_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_students_timestamp
BEFORE UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION update_students_timestamp();

-- Update updated_at timestamp on faculty table
CREATE OR REPLACE FUNCTION update_faculty_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_faculty_timestamp
BEFORE UPDATE ON faculty
FOR EACH ROW
EXECUTE FUNCTION update_faculty_timestamp();

-- Create attendance log when attendance is modified
CREATE OR REPLACE FUNCTION log_attendance_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO attendance_logs(
            attendance_id,
            previous_status,
            new_status,
            modified_by_user_id,
            modification_reason,
            modification_timestamp
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            (SELECT id FROM users WHERE id = NEW.modified_by),
            NEW.modification_reason,
            CURRENT_TIMESTAMP
        );
        NEW.is_modified = true;
        NEW.modified_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_attendance_modification
BEFORE UPDATE ON attendance
FOR EACH ROW
EXECUTE FUNCTION log_attendance_modification();

-- Clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM password_reset_tokens WHERE expires_at < CURRENT_TIMESTAMP AND is_used = false;
    DELETE FROM refresh_tokens WHERE expires_at < CURRENT_TIMESTAMP AND is_revoked = false;
END;
$$ LANGUAGE plpgsql;
