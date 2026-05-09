-- CareerPilot AI Database Schema v2
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS careerpilot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE careerpilot_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    location VARCHAR(255),
    bio TEXT,
    linkedin VARCHAR(500),
    github VARCHAR(500),
    avatar_url VARCHAR(500),
    role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    plan ENUM('FREE', 'PRO', 'ENTERPRISE') NOT NULL DEFAULT 'FREE',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

CREATE TABLE IF NOT EXISTS resumes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_url VARCHAR(500),
    extracted_text LONGTEXT,
    ats_score INT,
    overall_score INT,
    analysis_result JSON,
    missing_keywords JSON,
    present_keywords JSON,
    suggestions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    type VARCHAR(100),
    salary_range VARCHAR(100),
    description TEXT,
    required_skills JSON,
    experience_level VARCHAR(100),
    posted_date VARCHAR(50),
    apply_url VARCHAR(500),
    source VARCHAR(100) DEFAULT 'CareerPilot',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_active (active),
    INDEX idx_title_company (title, company)
);

CREATE TABLE IF NOT EXISTS saved_jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_job (user_id, job_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    company VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    status ENUM('APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED', 'SAVED') NOT NULL DEFAULT 'APPLIED',
    salary VARCHAR(100),
    notes TEXT,
    job_url VARCHAR(500),
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_applied_date (applied_date)
);

CREATE TABLE IF NOT EXISTS interview_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(100),
    questions JSON,
    answers JSON,
    overall_score INT,
    technical_score INT,
    communication_score INT,
    confidence_score INT,
    clarity_score INT,
    strengths JSON,
    improvements JSON,
    ai_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS career_roadmaps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    career_path VARCHAR(255),
    estimated_time VARCHAR(100),
    progress INT DEFAULT 0,
    phases JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(100),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Demo users (password: demo123 — BCrypt hash)
INSERT IGNORE INTO users (name, email, password, role, plan, title, location, bio) VALUES
('Admin User', 'admin@careerpilot.ai', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', 'ENTERPRISE', 'Platform Administrator', 'San Francisco, CA', 'CareerPilot AI platform administrator.'),
('Alex Morgan', 'demo@careerpilot.ai', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER', 'PRO', 'Senior Frontend Engineer', 'New York, NY', 'Passionate software engineer with 5+ years building scalable web applications.');
