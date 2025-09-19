import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Database configuration
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'leave_application_system',
    }

    console.log('Database config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      password: dbConfig.password ? '***' : 'empty'
    })

    // Test database connection
    const connection = await mysql.createConnection(dbConfig)
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test')
    await connection.end()

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: rows,
      config: {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        database: dbConfig.database,
        hasPassword: !!dbConfig.password
      }
    })
  } catch (error: any) {
    console.error('Database connection error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      config: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '3306',
        user: process.env.DB_USER || 'root',
        database: process.env.DB_NAME || 'leave_application_system',
        hasPassword: !!process.env.DB_PASSWORD
      }
    }, { status: 500 })
  }
}
