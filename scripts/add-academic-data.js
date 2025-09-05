const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sourabh161@',
  database: process.env.DB_NAME || 'leave_application_system',
};

async function addAcademicData() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    console.log('Adding academic performance data to database...');

    // Add CGPA column to students table
    try {
      await connection.execute('ALTER TABLE students ADD COLUMN cgpa DECIMAL(4,2) DEFAULT 0.00 AFTER department');
      console.log('✓ Added CGPA column to students table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ CGPA column already exists');
      } else {
        throw error;
      }
    }

    // Create subjects table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subject_code VARCHAR(20) UNIQUE NOT NULL,
        subject_name VARCHAR(100) NOT NULL,
        semester INT NOT NULL,
        department VARCHAR(50) NOT NULL,
        credits INT NOT NULL,
        total_marks INT DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created subjects table');

    // Create student_marks table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS student_marks (
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
      )
    `);
    console.log('✓ Created student_marks table');

    // Create semester_performance table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS semester_performance (
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
      )
    `);
    console.log('✓ Created semester_performance table');

    // Create attendance_records table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS attendance_records (
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
      )
    `);
    console.log('✓ Created attendance_records table');

    // Insert subjects data
    await connection.execute(`
      INSERT IGNORE INTO subjects (subject_code, subject_name, semester, department, credits, total_marks) VALUES
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
      ('CS604', 'Project Work', 6, 'Computer Science & Design', 4, 100)
    `);
    console.log('✓ Inserted subjects data');

    // Insert student marks data
    await connection.execute(`
      INSERT IGNORE INTO student_marks (student_id, subject_id, semester, marks_obtained, grade, grade_points, exam_type, exam_date) VALUES
      (1, 9, 6, 85.00, 'A', 8.50, 'internal', '2025-01-15'),
      (1, 9, 6, 88.00, 'A', 8.80, 'external', '2025-02-10'),
      (1, 10, 6, 78.00, 'B+', 7.80, 'internal', '2025-01-16'),
      (1, 10, 6, 82.00, 'A', 8.20, 'external', '2025-02-11'),
      (1, 11, 6, 92.00, 'A+', 9.20, 'internal', '2025-01-17'),
      (1, 11, 6, 89.00, 'A', 8.90, 'external', '2025-02-12'),
      (1, 12, 6, 95.00, 'A+', 9.50, 'internal', '2025-01-18'),
      (1, 12, 6, 91.00, 'A+', 9.10, 'external', '2025-02-13'),
      (2, 1, 4, 75.00, 'B+', 7.50, 'internal', '2024-11-15'),
      (2, 1, 4, 78.00, 'B+', 7.80, 'external', '2024-12-10'),
      (2, 2, 4, 82.00, 'A', 8.20, 'internal', '2024-11-16'),
      (2, 2, 4, 85.00, 'A', 8.50, 'external', '2024-12-11'),
      (2, 3, 4, 88.00, 'A', 8.80, 'internal', '2024-11-17'),
      (2, 3, 4, 90.00, 'A', 9.00, 'external', '2024-12-12'),
      (2, 4, 4, 79.00, 'B+', 7.90, 'internal', '2024-11-18'),
      (2, 4, 4, 83.00, 'A', 8.30, 'external', '2024-12-13'),
      (3, 9, 6, 90.00, 'A', 9.00, 'internal', '2025-01-15'),
      (3, 9, 6, 92.00, 'A+', 9.20, 'external', '2025-02-10'),
      (3, 10, 6, 85.00, 'A', 8.50, 'internal', '2025-01-16'),
      (3, 10, 6, 88.00, 'A', 8.80, 'external', '2025-02-11'),
      (3, 11, 6, 95.00, 'A+', 9.50, 'internal', '2025-01-17'),
      (3, 11, 6, 93.00, 'A+', 9.30, 'external', '2025-02-12'),
      (3, 12, 6, 98.00, 'A+', 9.80, 'internal', '2025-01-18'),
      (3, 12, 6, 96.00, 'A+', 9.60, 'external', '2025-02-13'),
      (4, 5, 5, 87.00, 'A', 8.70, 'internal', '2024-09-15'),
      (4, 5, 5, 89.00, 'A', 8.90, 'external', '2024-10-10'),
      (4, 6, 5, 84.00, 'A', 8.40, 'internal', '2024-09-16'),
      (4, 6, 5, 86.00, 'A', 8.60, 'external', '2024-10-11'),
      (4, 7, 5, 91.00, 'A+', 9.10, 'internal', '2024-09-17'),
      (4, 7, 5, 93.00, 'A+', 9.30, 'external', '2024-10-12'),
      (4, 8, 5, 88.00, 'A', 8.80, 'internal', '2024-09-18'),
      (4, 8, 5, 90.00, 'A', 9.00, 'external', '2024-10-13')
    `);
    console.log('✓ Inserted student marks data');

    // Insert semester performance data
    await connection.execute(`
      INSERT IGNORE INTO semester_performance (student_id, semester, sgpa, cgpa, total_credits, earned_credits, status, academic_year) VALUES
      (1, 6, 8.90, 8.45, 14, 14, 'pass', '2024-25'),
      (1, 5, 8.60, 8.30, 13, 13, 'pass', '2023-24'),
      (1, 4, 8.20, 8.10, 13, 13, 'pass', '2023-24'),
      (2, 4, 8.30, 8.30, 13, 13, 'pass', '2024-25'),
      (2, 3, 8.10, 8.10, 14, 14, 'pass', '2023-24'),
      (3, 6, 9.20, 8.80, 14, 14, 'pass', '2024-25'),
      (3, 5, 8.90, 8.60, 13, 13, 'pass', '2023-24'),
      (3, 4, 8.70, 8.40, 13, 13, 'pass', '2023-24'),
      (4, 5, 8.80, 8.80, 13, 13, 'pass', '2024-25'),
      (4, 4, 8.50, 8.50, 13, 13, 'pass', '2023-24'),
      (4, 3, 8.20, 8.20, 14, 14, 'pass', '2023-24')
    `);
    console.log('✓ Inserted semester performance data');

    // Insert attendance records
    await connection.execute(`
      INSERT IGNORE INTO attendance_records (student_id, subject_id, semester, total_classes, attended_classes, attendance_percentage, month, academic_year) VALUES
      (1, 9, 6, 20, 18, 90.00, 'January', '2024-25'),
      (1, 10, 6, 18, 16, 88.89, 'January', '2024-25'),
      (1, 11, 6, 22, 20, 90.91, 'January', '2024-25'),
      (1, 12, 6, 15, 14, 93.33, 'January', '2024-25'),
      (2, 1, 4, 25, 22, 88.00, 'November', '2024-25'),
      (2, 2, 4, 20, 18, 90.00, 'November', '2024-25'),
      (2, 3, 4, 18, 16, 88.89, 'November', '2024-25'),
      (2, 4, 4, 22, 19, 86.36, 'November', '2024-25'),
      (3, 9, 6, 20, 19, 95.00, 'January', '2024-25'),
      (3, 10, 6, 18, 17, 94.44, 'January', '2024-25'),
      (3, 11, 6, 22, 21, 95.45, 'January', '2024-25'),
      (3, 12, 6, 15, 15, 100.00, 'January', '2024-25'),
      (4, 5, 5, 20, 18, 90.00, 'September', '2024-25'),
      (4, 6, 5, 18, 16, 88.89, 'September', '2024-25'),
      (4, 7, 5, 22, 20, 90.91, 'September', '2024-25'),
      (4, 8, 5, 15, 14, 93.33, 'September', '2024-25')
    `);
    console.log('✓ Inserted attendance records');

    // Update students with CGPA
    await connection.execute('UPDATE students SET cgpa = 8.45 WHERE id = 1');
    await connection.execute('UPDATE students SET cgpa = 8.30 WHERE id = 2');
    await connection.execute('UPDATE students SET cgpa = 8.80 WHERE id = 3');
    await connection.execute('UPDATE students SET cgpa = 8.80 WHERE id = 4');
    console.log('✓ Updated students with CGPA values');

    await connection.end();
    console.log('\n🎉 Academic performance data setup completed successfully!');
    console.log('\n📊 Added:');
    console.log('  • 12 subjects');
    console.log('  • 32 student marks records');
    console.log('  • 11 semester performance records');
    console.log('  • 16 attendance records');
    console.log('  • CGPA values for all students');

  } catch (error) {
    console.error('❌ Error setting up academic data:', error);
    process.exit(1);
  }
}

// Run the setup
addAcademicData();