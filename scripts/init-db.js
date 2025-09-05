const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sourabh161@',
  database: process.env.DB_NAME || 'leave_application_system',
};

async function initDatabase() {
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim() !== '');
    
    // Create connection to MySQL server (without specifying database)
    const connectionConfig = { 
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    };
    
    const connection = await mysql.createConnection(connectionConfig);
    
    // Create database if it doesn't exist
    console.log('Creating database...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await connection.end();

    // Now connect **with the database already selected**
    const dbConnection = await mysql.createConnection(dbConfig);

    // Execute each statement
    console.log('Executing schema statements...');
    for (const statement of statements) {
      if (statement.trim() !== '') {
        try {
          await dbConnection.execute(statement);
          console.log('Executed statement:', statement.substring(0, 50) + '...');
        } catch (error) {
          // If it's a "table already exists" error, we can ignore it
          if (error.code !== 'ER_TABLE_EXISTS_ERROR') {
            throw error;
          }
          console.log('Skipped statement (table already exists):', statement.substring(0, 50) + '...');
        }
      }
    }
    
    // Close connection
    await dbConnection.end();
    
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    if (error.code === 'ECONNREFUSED') {
      console.error('Database connection refused. Please check:');
      console.error('1. MySQL is running on your system');
      console.error('2. Your database credentials in the .env file are correct');
      console.error('3. The host and port are correct');
    }
    process.exit(1);
  }
}

// Run the initialization
initDatabase();
