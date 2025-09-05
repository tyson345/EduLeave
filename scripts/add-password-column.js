const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sourabh161@',
  database: process.env.DB_NAME || 'leave_application_system',
};

async function addPasswordColumn() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    console.log('Adding password column to students table...');

    // Add password column to students table
    await connection.execute(`
      ALTER TABLE students
      ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT 'student123' AFTER phone
    `);

    console.log('Password column added successfully!');

    // Close connection
    await connection.end();

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Password column already exists.');
    } else {
      process.exit(1);
    }
  }
}

// Run the migration
addPasswordColumn();