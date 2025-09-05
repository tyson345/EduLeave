const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sourabh161@',
  database: process.env.DB_NAME || 'leave_application_system',
};

async function addSampleMessages() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    console.log('Adding sample messages for new students...');

    // Add sample messages for various students
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

    console.log('✓ Added sample messages for testing');

    // Verify the messages were added
    const [messages] = await connection.execute('SELECT COUNT(*) as count FROM messages');
    console.log(`Total messages in database: ${messages[0].count}`);

    await connection.end();
    console.log('Sample messages added successfully!');

  } catch (error) {
    console.error('Error adding sample messages:', error);
  }
}

// Run the script
addSampleMessages();