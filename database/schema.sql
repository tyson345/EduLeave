-- Database Schema for Department Leave Application System
-- Tables for Students, Leave Applications, and Leave Tracking

-- Table for storing student information
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usn VARCHAR(20) UNIQUE NOT NULL,  -- University Seat Number
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    password VARCHAR(255) NOT NULL,   -- Hashed password
    semester INT NOT NULL,
    department VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for tracking student leave balances
CREATE TABLE leave_balances (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    semester INT NOT NULL,
    total_leave_allowed INT DEFAULT 10,  -- 10 days per semester
    leave_taken INT DEFAULT 0,           -- Days already taken
    leave_remaining INT DEFAULT 10,      -- Remaining leave balance
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_semester (student_id, semester)
);

-- Table for storing leave applications
CREATE TABLE leave_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    leave_type ENUM('full', 'half') NOT NULL,  -- Full day or half day
    half_day_session ENUM('morning', 'afternoon'),  -- Only for half day leave
    start_date DATE NOT NULL,
    end_date DATE,  -- NULL for half day leave
    reason TEXT NOT NULL,
    attachment_path VARCHAR(255),  -- Path to uploaded document
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT,  -- Reason for rejection if applicable
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    processed_by VARCHAR(100),  -- HOD who processed the application
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Table for special leave requests (when student is out of leave)
CREATE TABLE special_leave_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    reason VARCHAR(255) NOT NULL,  -- Brief reason
    explanation TEXT NOT NULL,     -- Detailed explanation
    attachment_path VARCHAR(255),  -- Path to supporting document
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT,  -- Reason for rejection if applicable
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    processed_by VARCHAR(100),  -- HOD who processed the request
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
-- Table for storing HOD information
CREATE TABLE hod (
    id INT PRIMARY KEY AUTO_INCREMENT,
    eid VARCHAR(20) UNIQUE NOT NULL,  -- Employee ID
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,   -- Hashed password
    department VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_students_usn ON students(usn);
CREATE INDEX idx_leave_applications_student ON leave_applications(student_id);
CREATE INDEX idx_leave_applications_status ON leave_applications(status);
CREATE INDEX idx_leave_applications_date ON leave_applications(start_date);
CREATE INDEX idx_special_requests_student ON special_leave_requests(student_id);
CREATE INDEX idx_special_requests_status ON special_leave_requests(status);

-- Sample data for testing - Real student data
INSERT INTO students (usn, name, email, phone, password, semester, department, cgpa) VALUES
('4PM22CG001', 'Aditya S', 'aditya.s@university.edu', '9876543201', 'student123', 6, 'Computer Science & Design', 8.21),
('4PM22CG002', 'Aiman Baig', 'aiman.baig@university.edu', '9876543202', 'student123', 6, 'Computer Science & Design', 7.48),
('4PM22CG003', 'Akshay V', 'akshay.v@university.edu', '9876543203', 'student123', 6, 'Computer Science & Design', 7.50),
('4PM22CG004', 'Ananya K', 'ananya.k@university.edu', '9876543204', 'student123', 6, 'Computer Science & Design', 8.76),
('4PM22CG005', 'Arpitha R', 'arpitha.r@university.edu', '9876543205', 'student123', 6, 'Computer Science & Design', 8.50),
('4PM22CG006', 'Arpitha S', 'arpitha.s@university.edu', '9876543206', 'student123', 6, 'Computer Science & Design', 7.96),
('4PM22CG007', 'Bhoomika R', 'bhoomika.r@university.edu', '9876543207', 'student123', 6, 'Computer Science & Design', 8.37),
('4PM22CG010', 'Chandana CS', 'chandana.cs@university.edu', '9876543210', 'student123', 6, 'Computer Science & Design', 8.60),
('4PM22CG012', 'Darshan S', 'darshan.s@university.edu', '9876543212', 'student123', 6, 'Computer Science & Design', 8.00),
('4PM22CG014', 'Deekshitha R', 'deekshitha.r@university.edu', '9876543214', 'student123', 6, 'Computer Science & Design', 6.98),
('4PM22CG015', 'Gopika E L', 'gopika.el@university.edu', '9876543215', 'student123', 6, 'Computer Science & Design', 7.97),
('4PM22CG018', 'Hithaishi U', 'hithaishi.u@university.edu', '9876543218', 'student123', 6, 'Computer Science & Design', 7.50),
('4PM22CG021', 'Kartik Gopal Madivala', 'kartik.madivala@university.edu', '9876543221', 'student123', 6, 'Computer Science & Design', 8.20),
('4PM22CG022', 'Kruthika B I', 'kruthika.bi@university.edu', '9876543222', 'student123', 6, 'Computer Science & Design', 8.53),
('4PM22CG024', 'Meghana K M', 'meghana.km@university.edu', '9876543224', 'student123', 6, 'Computer Science & Design', 7.45),
('4PM22CG027', 'Nishant', 'nishant@university.edu', '9876543227', 'student123', 6, 'Computer Science & Design', 7.30),
('4PM22CG028', 'NISHANTH K R', 'nishanth.kr@university.edu', '9876543228', 'student123', 6, 'Computer Science & Design', 7.51),
('4PM22CG029', 'Nithin A B', 'nithin.ab@university.edu', '9876543229', 'student123', 6, 'Computer Science & Design', 8.70),
('4PM22CG030', 'Nivedita Shankar Gouda', 'nivedita.gouda@university.edu', '9876543230', 'student123', 6, 'Computer Science & Design', 7.00),
('4PM22CG031', 'Padmini V', 'padmini.v@university.edu', '9876543231', 'student123', 6, 'Computer Science & Design', 7.90),
('4PM22CG032', 'Poornashree SV', 'poornashree.sv@university.edu', '9876543232', 'student123', 6, 'Computer Science & Design', 8.40),
('4PM22CG034', 'Prerana Ashok Raikar', 'prerana.raikar@university.edu', '9876543234', 'student123', 6, 'Computer Science & Design', 8.33),
('4PM22CG035', 'Priya Y M', 'priya.ym@university.edu', '9876543235', 'student123', 6, 'Computer Science & Design', 7.97),
('4PM22CG036', 'ROHAN K RAJOLI', 'rohan.rajoli@university.edu', '9876543236', 'student123', 6, 'Computer Science & Design', 6.79),
('4PM22CG037', 'Sachin K', 'sachin.k@university.edu', '9876543237', 'student123', 6, 'Computer Science & Design', 6.00),
('4PM22CG038', 'Sakshi S Y', 'sakshi.sy@university.edu', '9876543238', 'student123', 6, 'Computer Science & Design', 7.90),
('4PM22CG040', 'SHADABUR RAHAMAN', 'shadabur.rahaman@university.edu', '9876543240', 'student123', 6, 'Computer Science & Design', 8.71),
('4PM22CG041', 'Shamanth S Kumbar', 'shamanth.kumbar@university.edu', '9876543241', 'student123', 6, 'Computer Science & Design', 6.76),
('4PM22CG042', 'Shankar', 'shankar@university.edu', '9876543242', 'student123', 6, 'Computer Science & Design', 8.69),
('4PM22CG044', 'Shivshankar Ajit Awate', 'shivshankar.awate@university.edu', '9876543244', 'student123', 6, 'Computer Science & Design', 7.61),
('4PM22CG045', 'Shreya Janardhan Madival', 'shreya.madival@university.edu', '9876543245', 'student123', 6, 'Computer Science & Design', 8.79),
('4PM22CG046', 'Sinchana NS', 'sinchana.ns@university.edu', '9876543246', 'student123', 6, 'Computer Science & Design', 8.35),
('4PM22CG047', 'Sourabh Patil', 'sourabh.patil@university.edu', '9876543247', 'student123', 6, 'Computer Science & Design', 8.84),
('4PM22CG048', 'Srushti GP', 'srushti.gp@university.edu', '9876543248', 'student123', 6, 'Computer Science & Design', 8.01),
('4PM22CG049', 'Srushti N Y', 'srushti.ny@university.edu', '9876543249', 'student123', 6, 'Computer Science & Design', 7.50),
('4PM22CG051', 'Supritha GC', 'supritha.gc@university.edu', '9876543251', 'student123', 6, 'Computer Science & Design', 8.25),
('4PM22CG052', 'Suraj V', 'suraj.v@university.edu', '9876543252', 'student123', 6, 'Computer Science & Design', 8.69),
('4PM22CG053', 'Sushma KV', 'sushma.kv@university.edu', '9876543253', 'student123', 6, 'Computer Science & Design', 7.93),
('4PM22CG054', 'Sushmitha M J', 'sushmitha.mj@university.edu', '9876543254', 'student123', 6, 'Computer Science & Design', 8.00),
('4PM22CG056', 'Thoofik Usmaan A', 'thoofik.usmaan@university.edu', '9876543256', 'student123', 6, 'Computer Science & Design', 7.50),
('4PM22CG058', 'Uday P', 'uday.p@university.edu', '9876543258', 'student123', 6, 'Computer Science & Design', 6.00),
('4PM22CG059', 'Vaishnavi G K', 'vaishnavi.gk@university.edu', '9876543259', 'student123', 6, 'Computer Science & Design', 7.60),
('4PM22CG060', 'Vanishree M', 'vanishree.m@university.edu', '9876543260', 'student123', 6, 'Computer Science & Design', 8.70),
('4PM22CG061', 'Varsha S', 'varsha.s@university.edu', '9876543261', 'student123', 6, 'Computer Science & Design', 7.58);

-- Initialize leave balances for sample students
INSERT INTO leave_balances (student_id, semester, total_leave_allowed, leave_taken, leave_remaining) VALUES
(1, 6, 10, 3, 7),  -- John Doe
(3, 6, 10, 0, 10), -- Bob Smith
(4, 5, 10, 2, 8);  -- Sourabh Patil
-- Sample HOD data
INSERT INTO hod (eid, name, email, password, department) VALUES
('HOD001', 'Dr.Pramod', 'smith.hod@university.edu', '123456', 'Computer Science & Design');

-- Sample leave applications
INSERT INTO leave_applications (student_id, leave_type, start_date, end_date, reason, status) VALUES
(1, 'full', '2025-08-10', '2025-08-10', 'Medical Appointment', 'approved'),
(1, 'half', '2025-08-05', '2025-08-05', 'Personal Work', 'approved'),
(4, 'full', '2025-08-20', '2025-08-21', 'Hackathon Participation', 'pending'),
(4, 'half', '2025-08-15', '2025-08-15', 'Project Presentation', 'approved');

-- Sample special leave requests
INSERT INTO special_leave_requests (student_id, reason, explanation, status) VALUES
(1, 'Family Emergency', 'Detailed explanation of the family emergency that requires additional leave beyond my allocated balance.', 'pending'),
(4, 'Competition Travel', 'Need additional leave to travel for inter-college coding competition.', 'pending');

-- Table for storing messages between HOD and students
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,  -- HOD or Student ID
    sender_type ENUM('hod', 'student') NOT NULL,
    receiver_id INT NOT NULL,  -- HOD or Student ID
    receiver_type ENUM('hod', 'student') NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (sender_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX idx_messages_sender ON messages(sender_id, sender_type);
CREATE INDEX idx_messages_receiver ON messages(receiver_id, receiver_type);
CREATE INDEX idx_messages_read ON messages(is_read);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);

-- Sample messages for testing
INSERT INTO messages (sender_id, sender_type, receiver_id, receiver_type, subject, message, is_read) VALUES
(1, 'hod', 1, 'student', 'Welcome Message', 'Welcome to the new semester! Please ensure you attend all classes regularly.', true),
(1, 'hod', 2, 'student', 'Academic Performance', 'Your recent performance in Data Structures has been excellent. Keep up the good work!', false),
(1, 'hod', 3, 'student', 'Leave Application', 'Your leave application has been approved. Please submit the required documents.', true),
(1, 'hod', 4, 'student', 'Project Submission', 'Please submit your final year project proposal by next week.', false);

-- Table for storing course/subject information
CREATE TABLE subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    semester INT NOT NULL,
    department VARCHAR(50) NOT NULL,
    credits INT NOT NULL,
    total_marks INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing student marks for each subject
CREATE TABLE student_marks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    semester INT NOT NULL,
    marks_obtained DECIMAL(5,2) NOT NULL,
    total_marks DECIMAL(5,2) DEFAULT 100.00,
    grade VARCHAR(5) NOT NULL,
    grade_points DECIMAL(3,2) NOT NULL,
    exam_type ENUM('internal', 'external', 'practical') NOT NULL,
    exam_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_subject_exam (student_id, subject_id, exam_type)
);

-- Table for storing semester-wise performance
CREATE TABLE semester_performance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    semester INT NOT NULL,
    sgpa DECIMAL(4,2) NOT NULL,
    cgpa DECIMAL(4,2) NOT NULL,
    total_credits INT NOT NULL,
    earned_credits INT NOT NULL,
    status ENUM('pass', 'fail', 'pending') DEFAULT 'pending',
    academic_year VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_semester (student_id, semester)
);

-- Table for storing attendance records
CREATE TABLE attendance_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    semester INT NOT NULL,
    total_classes INT NOT NULL,
    attended_classes INT NOT NULL,
    attendance_percentage DECIMAL(5,2) NOT NULL,
    month VARCHAR(20) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_subject_month (student_id, subject_id, month, academic_year)
);

-- Add CGPA column to students table
ALTER TABLE students ADD COLUMN cgpa DECIMAL(4,2) DEFAULT 0.00 AFTER department;

-- Indexes for better query performance
CREATE INDEX idx_subjects_semester ON subjects(semester);
CREATE INDEX idx_subjects_department ON subjects(department);
CREATE INDEX idx_student_marks_student ON student_marks(student_id);
CREATE INDEX idx_student_marks_subject ON student_marks(subject_id);
CREATE INDEX idx_student_marks_semester ON student_marks(semester);
CREATE INDEX idx_semester_performance_student ON semester_performance(student_id);
CREATE INDEX idx_attendance_records_student ON attendance_records(student_id);
CREATE INDEX idx_attendance_records_subject ON attendance_records(subject_id);

-- Sample subjects data
INSERT INTO subjects (subject_code, subject_name, semester, department, credits, total_marks) VALUES
('CS401', 'Data Structures & Algorithms', 4, 'Computer Science & Design', 4, 100),
('CS402', 'Database Management Systems', 4, 'Computer Science & Design', 3, 100),
('CS403', 'Web Technologies', 4, 'Computer Science & Design', 3, 100),
('CS404', 'Software Engineering', 4, 'Computer Science & Design', 3, 100),
('CS501', 'Advanced Data Structures', 5, 'Computer Science & Design', 4, 100),
('CS502', 'Computer Networks', 5, 'Computer Science & Design', 3, 100),
('CS503', 'Operating Systems', 5, 'Computer Science & Design', 3, 100),
('CS504', 'Machine Learning', 5, 'Computer Science & Design', 3, 100),
('CS601', 'Advanced Algorithms', 6, 'Computer Science & Design', 4, 100),
('CS602', 'Cloud Computing', 6, 'Computer Science & Design', 3, 100),
('CS603', 'Cyber Security', 6, 'Computer Science & Design', 3, 100),
('CS604', 'Project Work', 6, 'Computer Science & Design', 4, 100);

-- Sample student marks data
INSERT INTO student_marks (student_id, subject_id, semester, marks_obtained, grade, grade_points, exam_type, exam_date) VALUES
-- Rushidhar (Semester 6)
(1, 9, 6, 85.00, 'A', 8.50, 'internal', '2025-01-15'),
(1, 9, 6, 88.00, 'A', 8.80, 'external', '2025-02-10'),
(1, 10, 6, 78.00, 'B+', 7.80, 'internal', '2025-01-16'),
(1, 10, 6, 82.00, 'A', 8.20, 'external', '2025-02-11'),
(1, 11, 6, 92.00, 'A+', 9.20, 'internal', '2025-01-17'),
(1, 11, 6, 89.00, 'A', 8.90, 'external', '2025-02-12'),
(1, 12, 6, 95.00, 'A+', 9.50, 'internal', '2025-01-18'),
(1, 12, 6, 91.00, 'A+', 9.10, 'external', '2025-02-13'),

-- Metigouda (Semester 4)
(2, 1, 4, 75.00, 'B+', 7.50, 'internal', '2024-11-15'),
(2, 1, 4, 78.00, 'B+', 7.80, 'external', '2024-12-10'),
(2, 2, 4, 82.00, 'A', 8.20, 'internal', '2024-11-16'),
(2, 2, 4, 85.00, 'A', 8.50, 'external', '2024-12-11'),
(2, 3, 4, 88.00, 'A', 8.80, 'internal', '2024-11-17'),
(2, 3, 4, 90.00, 'A', 9.00, 'external', '2024-12-12'),
(2, 4, 4, 79.00, 'B+', 7.90, 'internal', '2024-11-18'),
(2, 4, 4, 83.00, 'A', 8.30, 'external', '2024-12-13'),

-- Anil (Semester 6)
(3, 9, 6, 90.00, 'A', 9.00, 'internal', '2025-01-15'),
(3, 9, 6, 92.00, 'A+', 9.20, 'external', '2025-02-10'),
(3, 10, 6, 85.00, 'A', 8.50, 'internal', '2025-01-16'),
(3, 10, 6, 88.00, 'A', 8.80, 'external', '2025-02-11'),
(3, 11, 6, 95.00, 'A+', 9.50, 'internal', '2025-01-17'),
(3, 11, 6, 93.00, 'A+', 9.30, 'external', '2025-02-12'),
(3, 12, 6, 98.00, 'A+', 9.80, 'internal', '2025-01-18'),
(3, 12, 6, 96.00, 'A+', 9.60, 'external', '2025-02-13'),

-- Sourabh Patil (Semester 5)
(4, 5, 5, 87.00, 'A', 8.70, 'internal', '2024-09-15'),
(4, 5, 5, 89.00, 'A', 8.90, 'external', '2024-10-10'),
(4, 6, 5, 84.00, 'A', 8.40, 'internal', '2024-09-16'),
(4, 6, 5, 86.00, 'A', 8.60, 'external', '2024-10-11'),
(4, 7, 5, 91.00, 'A+', 9.10, 'internal', '2024-09-17'),
(4, 7, 5, 93.00, 'A+', 9.30, 'external', '2024-10-12'),
(4, 8, 5, 88.00, 'A', 8.80, 'internal', '2024-09-18'),
(4, 8, 5, 90.00, 'A', 9.00, 'external', '2024-10-13');

-- Sample semester performance data - Updated for real students
INSERT INTO semester_performance (student_id, semester, sgpa, cgpa, total_credits, earned_credits, status, academic_year) VALUES
-- Aditya S (ID: 1)
(1, 6, 8.21, 8.21, 14, 14, 'pass', '2024-25'),
(1, 5, 8.00, 8.00, 13, 13, 'pass', '2023-24'),
(1, 4, 7.50, 7.50, 13, 13, 'pass', '2023-24'),

-- Aiman Baig (ID: 2)
(2, 6, 7.48, 7.48, 14, 14, 'pass', '2024-25'),
(2, 5, 7.20, 7.20, 13, 13, 'pass', '2023-24'),
(2, 4, 7.00, 7.00, 13, 13, 'pass', '2023-24'),

-- Akshay V (ID: 3)
(3, 6, 7.50, 7.50, 14, 14, 'pass', '2024-25'),
(3, 5, 7.30, 7.30, 13, 13, 'pass', '2023-24'),
(3, 4, 7.00, 7.00, 13, 13, 'pass', '2023-24'),

-- Ananya K (ID: 4)
(4, 6, 8.76, 8.76, 14, 14, 'pass', '2024-25'),
(4, 5, 8.50, 8.50, 13, 13, 'pass', '2023-24'),
(4, 4, 8.20, 8.20, 13, 13, 'pass', '2023-24'),

-- Arpitha R (ID: 5)
(5, 6, 8.50, 8.50, 14, 14, 'pass', '2024-25'),
(5, 5, 8.30, 8.30, 13, 13, 'pass', '2023-24'),
(5, 4, 8.00, 8.00, 13, 13, 'pass', '2023-24'),

-- Arpitha S (ID: 6)
(6, 6, 7.96, 7.96, 14, 14, 'pass', '2024-25'),
(6, 5, 7.70, 7.70, 13, 13, 'pass', '2023-24'),
(6, 4, 7.50, 7.50, 13, 13, 'pass', '2023-24'),

-- Bhoomika R (ID: 7)
(7, 6, 8.37, 8.37, 14, 14, 'pass', '2024-25'),
(7, 5, 8.10, 8.10, 13, 13, 'pass', '2023-24'),
(7, 4, 7.80, 7.80, 13, 13, 'pass', '2023-24'),

-- Chandana CS (ID: 8)
(8, 6, 8.60, 8.60, 14, 14, 'pass', '2024-25'),
(8, 5, 8.30, 8.30, 13, 13, 'pass', '2023-24'),
(8, 4, 8.00, 8.00, 13, 13, 'pass', '2023-24'),

-- Darshan S (ID: 9)
(9, 6, 8.00, 8.00, 14, 14, 'pass', '2024-25'),
(9, 5, 7.80, 7.80, 13, 13, 'pass', '2023-24'),
(9, 4, 7.50, 7.50, 13, 13, 'pass', '2023-24'),

-- Deekshitha R (ID: 10)
(10, 6, 6.98, 6.98, 14, 14, 'pass', '2024-25'),
(10, 5, 6.80, 6.80, 13, 13, 'pass', '2023-24'),
(10, 4, 6.50, 6.50, 13, 13, 'pass', '2023-24'),

-- Gopika E L (ID: 11)
(11, 6, 7.97, 7.97, 14, 14, 'pass', '2024-25'),
(11, 5, 7.70, 7.70, 13, 13, 'pass', '2023-24'),
(11, 4, 7.50, 7.50, 13, 13, 'pass', '2023-24'),

-- Hithaishi U (ID: 12)
(12, 6, 7.50, 7.50, 14, 14, 'pass', '2024-25'),
(12, 5, 7.30, 7.30, 13, 13, 'pass', '2023-24'),
(12, 4, 7.00, 7.00, 13, 13, 'pass', '2023-24'),

-- Kartik Gopal Madivala (ID: 13)
(13, 6, 8.20, 8.20, 14, 14, 'pass', '2024-25'),
(13, 5, 8.00, 8.00, 13, 13, 'pass', '2023-24'),
(13, 4, 7.80, 7.80, 13, 13, 'pass', '2023-24'),

-- Kruthika B I (ID: 14)
(14, 6, 8.53, 8.53, 14, 14, 'pass', '2024-25'),
(14, 5, 8.30, 8.30, 13, 13, 'pass', '2023-24'),
(14, 4, 8.00, 8.00, 13, 13, 'pass', '2023-24'),

-- Meghana K M (ID: 15)
(15, 6, 7.45, 7.45, 14, 14, 'pass', '2024-25'),
(15, 5, 7.20, 7.20, 13, 13, 'pass', '2023-24'),
(15, 4, 7.00, 7.00, 13, 13, 'pass', '2023-24'),

-- Nishant (ID: 16)
(16, 6, 7.30, 7.30, 14, 14, 'pass', '2024-25'),
(16, 5, 7.10, 7.10, 13, 13, 'pass', '2023-24'),
(16, 4, 6.80, 6.80, 13, 13, 'pass', '2023-24'),

-- NISHANTH K R (ID: 17)
(17, 6, 7.51, 7.51, 14, 14, 'pass', '2024-25'),
(17, 5, 7.30, 7.30, 13, 13, 'pass', '2023-24'),
(17, 4, 7.00, 7.00, 13, 13, 'pass', '2023-24'),

-- Nithin A B (ID: 18)
(18, 6, 8.70, 8.70, 14, 14, 'pass', '2024-25'),
(18, 5, 8.50, 8.50, 13, 13, 'pass', '2023-24'),
(18, 4, 8.20, 8.20, 13, 13, 'pass', '2023-24'),

-- Nivedita Shankar Gouda (ID: 19)
(19, 6, 7.00, 7.00, 14, 14, 'pass', '2024-25'),
(19, 5, 6.80, 6.80, 13, 13, 'pass', '2023-24'),
(19, 4, 6.50, 6.50, 13, 13, 'pass', '2023-24'),

-- Padmini V (ID: 20)
(20, 6, 7.90, 7.90, 14, 14, 'pass', '2024-25'),
(20, 5, 7.60, 7.60, 13, 13, 'pass', '2023-24'),
(20, 4, 7.20, 7.20, 13, 13, 'pass', '2023-24'),

-- Poornashree SV (ID: 21)
(21, 6, 8.40, 8.40, 14, 14, 'pass', '2024-25'),
(21, 5, 8.20, 8.20, 13, 13, 'pass', '2023-24'),
(21, 4, 8.00, 8.00, 13, 13, 'pass', '2023-24'),

-- Prerana Ashok Raikar (ID: 22)
(22, 6, 8.33, 8.33, 14, 14, 'pass', '2024-25'),
(22, 5, 8.10, 8.10, 13, 13, 'pass', '2023-24'),
(22, 4, 7.90, 7.90, 13, 13, 'pass', '2023-24'),

-- Priya Y M (ID: 23)
(23, 6, 7.97, 7.97, 14, 14, 'pass', '2024-25'),
(23, 5, 7.70, 7.70, 13, 13, 'pass', '2023-24'),
(23, 4, 7.50, 7.50, 13, 13, 'pass', '2023-24'),

-- ROHAN K RAJOLI (ID: 24)
(24, 6, 6.79, 6.79, 14, 14, 'pass', '2024-25'),
(24, 5, 6.60, 6.60, 13, 13, 'pass', '2023-24'),
(24, 4, 6.40, 6.40, 13, 13, 'pass', '2023-24'),

-- Sachin K (ID: 25)
(25, 6, 6.00, 6.00, 14, 14, 'pass', '2024-25'),
(25, 5, 6.00, 6.00, 13, 13, 'pass', '2023-24'),
(25, 4, 6.00, 6.00, 13, 13, 'pass', '2023-24'),

-- Sakshi S Y (ID: 26)
(26, 6, 7.90, 7.90, 14, 14, 'pass', '2024-25'),
(26, 5, 7.60, 7.60, 13, 13, 'pass', '2023-24'),
(26, 4, 7.30, 7.30, 13, 13, 'pass', '2023-24'),

-- SHADABUR RAHAMAN (ID: 27)
(27, 6, 8.71, 8.71, 14, 14, 'pass', '2024-25'),
(27, 5, 8.50, 8.50, 13, 13, 'pass', '2023-24'),
(27, 4, 8.20, 8.20, 13, 13, 'pass', '2023-24'),

-- Shamanth S Kumbar (ID: 28)
(28, 6, 6.76, 6.76, 14, 14, 'pass', '2024-25'),
(28, 5, 6.50, 6.50, 13, 13, 'pass', '2023-24'),
(28, 4, 6.30, 6.30, 13, 13, 'pass', '2023-24'),

-- Shankar (ID: 29)
(29, 6, 8.69, 8.69, 14, 14, 'pass', '2024-25'),
(29, 5, 8.40, 8.40, 13, 13, 'pass', '2023-24'),
(29, 4, 8.10, 8.10, 13, 13, 'pass', '2023-24'),

-- Shivshankar Ajit Awate (ID: 30)
(30, 6, 7.61, 7.61, 14, 14, 'pass', '2024-25'),
(30, 5, 7.40, 7.40, 13, 13, 'pass', '2023-24'),
(30, 4, 7.10, 7.10, 13, 13, 'pass', '2023-24'),

-- Shreya Janardhan Madival (ID: 31)
(31, 6, 8.79, 8.79, 14, 14, 'pass', '2024-25'),
(31, 5, 8.50, 8.50, 13, 13, 'pass', '2023-24'),
(31, 4, 8.20, 8.20, 13, 13, 'pass', '2023-24'),

-- Sinchana NS (ID: 32)
(32, 6, 8.35, 8.35, 14, 14, 'pass', '2024-25'),
(32, 5, 8.10, 8.10, 13, 13, 'pass', '2023-24'),
(32, 4, 7.90, 7.90, 13, 13, 'pass', '2023-24'),

-- Sourabh Patil (ID: 33)
(33, 6, 8.84, 8.84, 14, 14, 'pass', '2024-25'),
(33, 5, 8.60, 8.60, 13, 13, 'pass', '2023-24'),
(33, 4, 8.30, 8.30, 13, 13, 'pass', '2023-24'),

-- Srushti GP (ID: 34)
(34, 6, 8.01, 8.01, 14, 14, 'pass', '2024-25'),
(34, 5, 7.80, 7.80, 13, 13, 'pass', '2023-24'),
(34, 4, 7.60, 7.60, 13, 13, 'pass', '2023-24'),

-- Srushti N Y (ID: 35)
(35, 6, 7.50, 7.50, 14, 14, 'pass', '2024-25'),
(35, 5, 7.30, 7.30, 13, 13, 'pass', '2023-24'),
(35, 4, 7.00, 7.00, 13, 13, 'pass', '2023-24'),

-- Supritha GC (ID: 36)
(36, 6, 8.25, 8.25, 14, 14, 'pass', '2024-25'),
(36, 5, 8.00, 8.00, 13, 13, 'pass', '2023-24'),
(36, 4, 7.80, 7.80, 13, 13, 'pass', '2023-24'),

-- Suraj V (ID: 37)
(37, 6, 8.69, 8.69, 14, 14, 'pass', '2024-25'),
(37, 5, 8.40, 8.40, 13, 13, 'pass', '2023-24'),
(37, 4, 8.10, 8.10, 13, 13, 'pass', '2023-24'),

-- Sushma KV (ID: 38)
(38, 6, 7.93, 7.93, 14, 14, 'pass', '2024-25'),
(38, 5, 7.70, 7.70, 13, 13, 'pass', '2023-24'),
(38, 4, 7.50, 7.50, 13, 13, 'pass', '2023-24'),

-- Sushmitha M J (ID: 39)
(39, 6, 8.00, 8.00, 14, 14, 'pass', '2024-25'),
(39, 5, 7.80, 7.80, 13, 13, 'pass', '2023-24'),
(39, 4, 7.50, 7.50, 13, 13, 'pass', '2023-24'),

-- Thoothik Usmaan A (ID: 40)
(40, 6, 7.50, 7.50, 14, 14, 'pass', '2024-25'),
(40, 5, 7.30, 7.30, 13, 13, 'pass', '2023-24'),
(40, 4, 7.00, 7.00, 13, 13, 'pass', '2023-24'),

-- Uday P (ID: 41)
(41, 6, 6.00, 6.00, 14, 14, 'pass', '2024-25'),
(41, 5, 6.00, 6.00, 13, 13, 'pass', '2023-24'),
(41, 4, 6.00, 6.00, 13, 13, 'pass', '2023-24'),

-- Vaishnavi G K (ID: 42)
(42, 6, 7.60, 7.60, 14, 14, 'pass', '2024-25'),
(42, 5, 7.40, 7.40, 13, 13, 'pass', '2023-24'),
(42, 4, 7.20, 7.20, 13, 13, 'pass', '2023-24'),

-- Vanishree M (ID: 43)
(43, 6, 8.70, 8.70, 14, 14, 'pass', '2024-25'),
(43, 5, 8.40, 8.40, 13, 13, 'pass', '2023-24'),
(43, 4, 8.10, 8.10, 13, 13, 'pass', '2023-24'),

-- Varsha S (ID: 44)
(44, 6, 7.58, 7.58, 14, 14, 'pass', '2024-25'),
(44, 5, 7.30, 7.30, 13, 13, 'pass', '2023-24'),
(44, 4, 7.10, 7.10, 13, 13, 'pass', '2023-24');

-- Sample attendance records
INSERT INTO attendance_records (student_id, subject_id, semester, total_classes, attended_classes, attendance_percentage, month, academic_year) VALUES
-- Rushidhar (Semester 6)
(1, 9, 6, 20, 18, 90.00, 'January', '2024-25'),
(1, 10, 6, 18, 16, 88.89, 'January', '2024-25'),
(1, 11, 6, 22, 20, 90.91, 'January', '2024-25'),
(1, 12, 6, 15, 14, 93.33, 'January', '2024-25'),

-- Metigouda (Semester 4)
(2, 1, 4, 25, 22, 88.00, 'November', '2024-25'),
(2, 2, 4, 20, 18, 90.00, 'November', '2024-25'),
(2, 3, 4, 18, 16, 88.89, 'November', '2024-25'),
(2, 4, 4, 22, 19, 86.36, 'November', '2024-25'),

-- Anil (Semester 6)
(3, 9, 6, 20, 19, 95.00, 'January', '2024-25'),
(3, 10, 6, 18, 17, 94.44, 'January', '2024-25'),
(3, 11, 6, 22, 21, 95.45, 'January', '2024-25'),
(3, 12, 6, 15, 15, 100.00, 'January', '2024-25'),

-- Sourabh Patil (Semester 5)
(4, 5, 5, 20, 18, 90.00, 'September', '2024-25'),
(4, 6, 5, 18, 16, 88.89, 'September', '2024-25'),
(4, 7, 5, 22, 20, 90.91, 'September', '2024-25'),
(4, 8, 5, 15, 14, 93.33, 'September', '2024-25');

-- Update students with CGPA
UPDATE students SET cgpa = 8.45 WHERE id = 1; -- Rushidhar
UPDATE students SET cgpa = 8.30 WHERE id = 2; -- Metigouda
UPDATE students SET cgpa = 8.80 WHERE id = 3; -- Anil
UPDATE students SET cgpa = 8.80 WHERE id = 4; -- Sourabh Patil
