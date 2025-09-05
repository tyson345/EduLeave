const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sourabh161@',
  database: process.env.DB_NAME || 'leave_application_system',
};

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Configuration:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database
    });
    
    // Create connection to MySQL server (without specifying database)
    const connectionConfig = { 
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    };
    
    const connection = await mysql.createConnection(connectionConfig);
    console.log('Database connection successful!');
    
    // Test if database exists
    try {
      await connection.execute(`USE \`${dbConfig.database}\``);
      console.log(`Database '${dbConfig.database}' exists and is accessible.`);
      
      // Test a simple query
      const [rows] = await connection.execute('SELECT 1 as test');
      console.log('Simple query test result:', rows);
    } catch (error) {
      console.log(`Database '${dbConfig.database}' does not exist yet. This is OK for initial setup.`);
    }
    
    // Close connection
    await connection.end();
    console.log('Database connection test completed successfully!');
  } catch (error) {
    console.error('Database connection test failed:', error);
    if (error.code === 'ECONNREFUSED') {
      console.error('Database connection refused. Please check:');
      console.error('1. MySQL is running on your system');
      console.error('2. Your database credentials in the .env file are correct');
      console.error('3. The host and port are correct');
    }
  }
}

// Run the test
testDatabaseConnection();