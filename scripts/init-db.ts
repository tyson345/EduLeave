import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sourabh161@',
  database: process.env.DB_NAME || 'leave_application_system',
}

async function initDatabase() {
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Split the schema into individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim() !== '')
    
    // Create connection to MySQL server (without specifying database)
    const connectionConfig = { 
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    }
    
    const connection = await mysql.createConnection(connectionConfig)
    
    // Create database if it doesn't exist
    console.log('Creating database...')
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``)
    await connection.execute(`USE \`${dbConfig.database}\``)
    
    // Execute each statement
    console.log('Executing schema statements...')
    for (const statement of statements) {
      if (statement.trim() !== '') {
        await connection.execute(statement)
        console.log('Executed statement:', statement.substring(0, 50) + '...')
      }
    }
    
    // Close connection
    await connection.end()
    
    console.log('Database initialized successfully!')
  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  }
}

// Run the initialization
initDatabase()