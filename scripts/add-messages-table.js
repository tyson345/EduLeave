const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sourabh161@',
  database: process.env.DB_NAME || 'leave_application_system',
};

async function addMessagesTable() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    console.log('Adding messages table to database...');

    // Create messages table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS messages (
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

    console.log('Messages table created successfully!');

    // Create indexes (with error handling for existing indexes)
    try {
      await connection.execute('CREATE INDEX idx_messages_sender ON messages(sender_id, sender_type)');
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') throw error;
    }

    try {
      await connection.execute('CREATE INDEX idx_messages_receiver ON messages(receiver_id, receiver_type)');
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') throw error;
    }

    try {
      await connection.execute('CREATE INDEX idx_messages_read ON messages(is_read)');
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') throw error;
    }

    try {
      await connection.execute('CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC)');
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') throw error;
    }

    console.log('Indexes created successfully!');

    // Insert sample messages
    await connection.execute(`
      INSERT INTO messages (sender_id, sender_type, receiver_id, receiver_type, subject, message, is_read) VALUES
      (1, 'hod', 1, 'student', 'Welcome Message', 'Welcome to the new semester! Please ensure you attend all classes regularly.', true),
      (1, 'hod', 2, 'student', 'Academic Performance', 'Your recent performance in Data Structures has been excellent. Keep up the good work!', false),
      (1, 'hod', 3, 'student', 'Leave Application', 'Your leave application has been approved. Please submit the required documents.', true),
      (1, 'hod', 4, 'student', 'Project Submission', 'Please submit your final year project proposal by next week.', false)
    `);

    console.log('Sample messages inserted successfully!');

    await connection.end();
    console.log('\nMessages table setup completed!');
  } catch (error) {
    console.error('Error setting up messages table:', error);
  }
}

// Run the setup
addMessagesTable();