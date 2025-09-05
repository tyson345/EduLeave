const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sourabh161@',
  database: process.env.DB_NAME || 'leave_application_system',
};

async function freshDatabaseSetup() {
  try {
    console.log('Setting up fresh database...');

    // Connect without specifying database to create it
    const rootConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    // Drop database if exists and create fresh
    console.log('Dropping existing database...');
    await rootConnection.execute(`DROP DATABASE IF EXISTS \`${dbConfig.database}\``);

    console.log('Creating fresh database...');
    await rootConnection.execute(`CREATE DATABASE \`${dbConfig.database}\``);

    await rootConnection.end();

    // Now connect to the fresh database
    const connection = await mysql.createConnection(dbConfig);

    console.log('Creating tables...');

    // Create students table
    await connection.execute(`
      CREATE TABLE students (
        id INT PRIMARY KEY AUTO_INCREMENT,
        usn VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        phone VARCHAR(15),
        password VARCHAR(255) NOT NULL,
        semester INT NOT NULL,
        department VARCHAR(50) NOT NULL,
        cgpa DECIMAL(4,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create leave_balances table
    await connection.execute(`
      CREATE TABLE leave_balances (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        semester INT NOT NULL,
        total_leave_allowed INT DEFAULT 10,
        leave_taken INT DEFAULT 0,
        leave_remaining INT DEFAULT 10,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE KEY unique_student_semester (student_id, semester)
      )
    `);

    // Create leave_applications table
    await connection.execute(`
      CREATE TABLE leave_applications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        leave_type ENUM('full', 'half') NOT NULL,
        half_day_session ENUM('morning', 'afternoon'),
        start_date DATE NOT NULL,
        end_date DATE,
        reason TEXT NOT NULL,
        attachment_path VARCHAR(255),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        rejection_reason TEXT,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP NULL,
        processed_by VARCHAR(100),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);

    // Create special_leave_requests table
    await connection.execute(`
      CREATE TABLE special_leave_requests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        reason VARCHAR(255) NOT NULL,
        explanation TEXT NOT NULL,
        attachment_path VARCHAR(255),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        rejection_reason TEXT,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP NULL,
        processed_by VARCHAR(100),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);

    // Create hod table
    await connection.execute(`
      CREATE TABLE hod (
        id INT PRIMARY KEY AUTO_INCREMENT,
        eid VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255) NOT NULL,
        department VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create subjects table
    await connection.execute(`
      CREATE TABLE subjects (
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

    // Create student_marks table
    await connection.execute(`
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
      )
    `);

    // Create semester_performance table
    await connection.execute(`
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
      )
    `);

    // Create attendance_records table
    await connection.execute(`
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
      )
    `);

    // Create messages table
    await connection.execute(`
      CREATE TABLE messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sender_id INT NOT NULL,
        sender_type ENUM('hod', 'student') NOT NULL,
        receiver_id INT NOT NULL,
        receiver_type ENUM('hod', 'student') NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL,
        FOREIGN KEY (sender_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);

    console.log('✓ All tables created successfully');

    // Insert real student data
    console.log('Inserting real student data...');
    await connection.execute(`
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
      ('4PM22CG061', 'Varsha S', 'varsha.s@university.edu', '9876543261', 'student123', 6, 'Computer Science & Design', 7.58)
    `);

    console.log('✓ Real student data inserted');

    // Insert HOD data
    await connection.execute(`
      INSERT INTO hod (eid, name, email, password, department) VALUES
      ('HOD001', 'Dr. Smith', 'smith.hod@university.edu', '123456', 'Computer Science & Design')
    `);

    console.log('✓ HOD data inserted');

    // Insert leave balances
    await connection.execute(`
      INSERT INTO leave_balances (student_id, semester, total_leave_allowed, leave_taken, leave_remaining) VALUES
      (1, 6, 10, 2, 8), (2, 6, 10, 1, 9), (3, 6, 10, 3, 7), (4, 6, 10, 0, 10),
      (5, 6, 10, 1, 9), (6, 6, 10, 2, 8), (7, 6, 10, 0, 10), (8, 6, 10, 1, 9),
      (9, 6, 10, 2, 8), (10, 6, 10, 4, 6), (11, 6, 10, 1, 9), (12, 6, 10, 3, 7),
      (13, 6, 10, 0, 10), (14, 6, 10, 1, 9), (15, 6, 10, 2, 8), (16, 6, 10, 3, 7),
      (17, 6, 10, 1, 9), (18, 6, 10, 0, 10), (19, 6, 10, 4, 6), (20, 6, 10, 2, 8),
      (21, 6, 10, 0, 10), (22, 6, 10, 1, 9), (23, 6, 10, 2, 8), (24, 6, 10, 5, 5),
      (25, 6, 10, 6, 4), (26, 6, 10, 1, 9), (27, 6, 10, 0, 10), (28, 6, 10, 7, 3),
      (29, 6, 10, 0, 10), (30, 6, 10, 2, 8), (31, 6, 10, 0, 10), (32, 6, 10, 1, 9),
      (33, 6, 10, 0, 10), (34, 6, 10, 1, 9), (35, 6, 10, 3, 7), (36, 6, 10, 0, 10),
      (37, 6, 10, 0, 10), (38, 6, 10, 2, 8), (39, 6, 10, 1, 9), (40, 6, 10, 3, 7),
      (41, 6, 10, 6, 4), (42, 6, 10, 2, 8), (43, 6, 10, 0, 10), (44, 6, 10, 2, 8)
    `);

    console.log('✓ Leave balances inserted');

    // Insert sample messages
    await connection.execute(`
      INSERT INTO messages (sender_id, sender_type, receiver_id, receiver_type, subject, message, is_read) VALUES
      (1, 'hod', 1, 'student', 'Welcome to Semester 6', 'Welcome Aditya! Congratulations on reaching your final semester. Please ensure you complete all your project work on time.', false),
      (1, 'hod', 4, 'student', 'Academic Excellence Award', 'Congratulations Ananya! You have been selected for the Academic Excellence Award for your outstanding performance in Semester 6.', false),
      (1, 'hod', 33, 'student', 'Project Submission Reminder', 'Dear Sourabh, please submit your final year project proposal by next Friday. The deadline is approaching.', false),
      (1, 'hod', 18, 'student', 'Leave Application Approved', 'Your leave application for the hackathon has been approved. Please submit the participation certificate upon return.', true),
      (1, 'hod', 29, 'student', 'Performance Review', 'Shankar, your performance in the recent assessments has been excellent. Keep up the good work!', false),
      (1, 'hod', 43, 'student', 'Semester Completion', 'Vanishree, congratulations on successfully completing all your coursework. Your CGPA of 8.70 is commendable.', true),
      (1, 'hod', 7, 'student', 'Attendance Warning', 'Bhoomika, your attendance percentage is currently at 87%. Please ensure you attend all remaining classes.', false),
      (1, 'hod', 2, 'student', 'Department Meeting', 'All students are requested to attend the department meeting tomorrow at 10 AM in the main auditorium.', false)
    `);

    console.log('✓ Sample messages inserted');

    await connection.end();
    console.log('\n🎉 Fresh database setup completed successfully!');
    console.log('\n📊 Database Summary:');
    console.log('  • 44 Real students with authentic data');
    console.log('  • 1 HOD account');
    console.log('  • 44 Individual leave balances');
    console.log('  • 8 Sample messages for testing');
    console.log('  • All tables properly structured');

  } catch (error) {
    console.error('❌ Error setting up fresh database:', error);
    process.exit(1);
  }
}

// Run the setup
freshDatabaseSetup();