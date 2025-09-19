const mysql = require('mysql2/promise');
require('dotenv').config();

async function addResetTokenFields() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'eduleave'
    });

    console.log('Connected to database successfully');

    // Add reset token fields to students table
    await connection.execute(`
      ALTER TABLE students 
      ADD COLUMN reset_token VARCHAR(255) NULL,
      ADD COLUMN reset_expires TIMESTAMP NULL
    `);
    console.log('Added reset token fields to students table');

    // Add reset token fields to hod table
    await connection.execute(`
      ALTER TABLE hod 
      ADD COLUMN reset_token VARCHAR(255) NULL,
      ADD COLUMN reset_expires TIMESTAMP NULL
    `);
    console.log('Added reset token fields to hod table');

    console.log('✅ Reset token fields added successfully to all tables');

  } catch (error) {
    console.error('❌ Error adding reset token fields:', error.message);
    
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️  Reset token fields already exist in the tables');
    } else {
      throw error;
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the function
addResetTokenFields()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
