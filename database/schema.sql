-- ============================================================
-- University Management System (UMS) - MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS ums_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ums_db;

-- ============================================================
-- ROLES & PERMISSIONS
-- ============================================================

CREATE TABLE roles (
    role_id   INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE permissions (
    permission_id INT AUTO_INCREMENT PRIMARY KEY,
    module        VARCHAR(50) NOT NULL,
    action        VARCHAR(50) NOT NULL,
    UNIQUE KEY uq_module_action (module, action)
);

CREATE TABLE role_permissions (
    role_id       INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id)       REFERENCES roles(role_id)       ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
);

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id       INT          NOT NULL,
    status        ENUM('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- ============================================================
-- DEPARTMENTS
-- ============================================================

CREATE TABLE departments (
    department_id   INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    hod_id          INT          NULL,  -- FK to faculty; added after faculty table
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- FACULTY
-- ============================================================

CREATE TABLE faculty (
    faculty_id    INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT          NOT NULL UNIQUE,
    name          VARCHAR(100) NOT NULL,
    qualification VARCHAR(100),
    department_id INT          NULL,
    contact       VARCHAR(20),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)       REFERENCES users(user_id)       ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
);

-- Now add the FK for HOD on departments
ALTER TABLE departments
    ADD CONSTRAINT fk_dept_hod FOREIGN KEY (hod_id) REFERENCES faculty(faculty_id) ON DELETE SET NULL;

-- ============================================================
-- STUDENTS
-- ============================================================

CREATE TABLE students (
    student_id      INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT          NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    dob             DATE,
    gender          ENUM('MALE','FEMALE','OTHER'),
    contact         VARCHAR(20),
    department_id   INT          NULL,
    enrollment_year INT,
    academic_status ENUM('ACTIVE','GRADUATED','SUSPENDED','DROPPED') NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)       REFERENCES users(user_id)       ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
);

CREATE TABLE student_documents (
    document_id   INT AUTO_INCREMENT PRIMARY KEY,
    student_id    INT          NOT NULL,
    document_type VARCHAR(50)  NOT NULL,
    file_path     VARCHAR(255) NOT NULL,
    uploaded_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE TABLE student_academic_history (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT            NOT NULL,
    semester   VARCHAR(20)    NOT NULL,
    gpa        DECIMAL(4,2),
    cgpa       DECIMAL(4,2),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- ============================================================
-- COURSES
-- ============================================================

CREATE TABLE courses (
    course_id     INT AUTO_INCREMENT PRIMARY KEY,
    course_code   VARCHAR(20)  NOT NULL UNIQUE,
    course_name   VARCHAR(100) NOT NULL,
    credits       INT          NOT NULL DEFAULT 3,
    semester      VARCHAR(20),
    department_id INT          NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
);

CREATE TABLE course_prerequisites (
    id                    INT AUTO_INCREMENT PRIMARY KEY,
    course_id             INT NOT NULL,
    prerequisite_course_id INT NOT NULL,
    UNIQUE KEY uq_prereq (course_id, prerequisite_course_id),
    FOREIGN KEY (course_id)              REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (prerequisite_course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

CREATE TABLE student_course_registration (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT         NOT NULL,
    course_id  INT         NOT NULL,
    semester   VARCHAR(20) NOT NULL,
    status     ENUM('ENROLLED','DROPPED','COMPLETED') NOT NULL DEFAULT 'ENROLLED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_student_course_sem (student_id, course_id, semester),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id)  REFERENCES courses(course_id)  ON DELETE CASCADE
);

-- ============================================================
-- TIMETABLE
-- ============================================================

CREATE TABLE timetable (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    course_id  INT         NOT NULL,
    faculty_id INT         NOT NULL,
    room       VARCHAR(50),
    day        ENUM('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY') NOT NULL,
    start_time TIME        NOT NULL,
    end_time   TIME        NOT NULL,
    semester   VARCHAR(20) NOT NULL,
    FOREIGN KEY (course_id)  REFERENCES courses(course_id)  ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE
);

-- ============================================================
-- ATTENDANCE
-- ============================================================

CREATE TABLE attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id    INT  NOT NULL,
    course_id     INT  NOT NULL,
    faculty_id    INT  NOT NULL,
    date          DATE NOT NULL,
    status        ENUM('PRESENT','ABSENT','LATE') NOT NULL DEFAULT 'PRESENT',
    UNIQUE KEY uq_attendance (student_id, course_id, date),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id)  REFERENCES courses(course_id)  ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE
);

-- ============================================================
-- GRADES
-- ============================================================

CREATE TABLE grades (
    grade_id   INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT            NOT NULL,
    course_id  INT            NOT NULL,
    semester   VARCHAR(20)    NOT NULL,
    marks      DECIMAL(5,2),
    grade      VARCHAR(5),
    UNIQUE KEY uq_grade (student_id, course_id, semester),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id)  REFERENCES courses(course_id)  ON DELETE CASCADE
);

-- ============================================================
-- FEE MANAGEMENT
-- ============================================================

CREATE TABLE fee_structure (
    fee_id        INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT            NULL,
    semester      VARCHAR(20)    NOT NULL,
    amount        DECIMAL(10,2)  NOT NULL,
    description   VARCHAR(255),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
);

CREATE TABLE payments (
    payment_id   INT AUTO_INCREMENT PRIMARY KEY,
    student_id   INT           NOT NULL,
    fee_id       INT           NULL,
    amount       DECIMAL(10,2) NOT NULL,
    payment_date DATE          NOT NULL,
    method       VARCHAR(50),
    status       ENUM('PAID','PENDING','FAILED') NOT NULL DEFAULT 'PENDING',
    receipt_no   VARCHAR(50)   UNIQUE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (fee_id)     REFERENCES fee_structure(fee_id) ON DELETE SET NULL
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    message         TEXT         NOT NULL,
    target_role     INT          NULL,   -- NULL = all roles
    created_by      INT          NOT NULL,
    created_date    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_role) REFERENCES roles(role_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by)  REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE notification_reads (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    notification_id INT NOT NULL,
    user_id         INT NOT NULL,
    read_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_notif_user (notification_id, user_id),
    FOREIGN KEY (notification_id) REFERENCES notifications(notification_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)         REFERENCES users(user_id)                 ON DELETE CASCADE
);

-- ============================================================
-- TRANSCRIPTS
-- ============================================================

CREATE TABLE transcripts (
    transcript_id  INT AUTO_INCREMENT PRIMARY KEY,
    student_id     INT       NOT NULL,
    generated_date DATE      NOT NULL,
    file_path      VARCHAR(255),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
    log_id    INT AUTO_INCREMENT PRIMARY KEY,
    user_id   INT         NOT NULL,
    action    VARCHAR(255) NOT NULL,
    entity    VARCHAR(50),
    entity_id INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO roles (role_name) VALUES
    ('ADMIN'),
    ('ADMISSION_OFFICER'),
    ('FACULTY'),
    ('STUDENT'),
    ('FINANCE_OFFICER');

INSERT INTO permissions (module, action) VALUES
    ('STUDENT',       'READ'),   ('STUDENT',       'CREATE'), ('STUDENT',       'UPDATE'), ('STUDENT',       'DELETE'),
    ('FACULTY',       'READ'),   ('FACULTY',       'CREATE'), ('FACULTY',       'UPDATE'), ('FACULTY',       'DELETE'),
    ('DEPARTMENT',    'READ'),   ('DEPARTMENT',    'CREATE'), ('DEPARTMENT',    'UPDATE'), ('DEPARTMENT',    'DELETE'),
    ('COURSE',        'READ'),   ('COURSE',        'CREATE'), ('COURSE',        'UPDATE'), ('COURSE',        'DELETE'),
    ('ATTENDANCE',    'READ'),   ('ATTENDANCE',    'CREATE'), ('ATTENDANCE',    'UPDATE'),
    ('FEE',           'READ'),   ('FEE',           'CREATE'), ('FEE',           'UPDATE'),
    ('TIMETABLE',     'READ'),   ('TIMETABLE',     'CREATE'), ('TIMETABLE',     'UPDATE'),
    ('NOTIFICATION',  'READ'),   ('NOTIFICATION',  'CREATE'),
    ('REPORT',        'READ'),
    ('USER',          'READ'),   ('USER',          'CREATE'), ('USER',          'UPDATE'), ('USER',          'DELETE'),
    ('GRADE',         'READ'),   ('GRADE',         'CREATE'), ('GRADE',         'UPDATE');

-- Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
    SELECT 1, permission_id FROM permissions;

-- Default admin user (password: Admin@123 — change in production!)
INSERT INTO users (username, email, password_hash, role_id, status)
    VALUES ('admin', 'admin@university.edu',
            '$2a$12$G9rfV4c8qEtacQbUijPTK.8aj6MJcanMJ7xYuY6mCcXvJeabYgzFS',
            1, 'ACTIVE');
