import { NextResponse } from 'next/server'
import { Pool } from 'pg'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Database configuration for PostgreSQL
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'postgres',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }

    console.log('Database config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      password: dbConfig.password ? '***' : 'empty'
    })

    // Test database connection
    const pool = new Pool(dbConfig)
    const client = await pool.connect()
    
    // Test query
    const result = await client.query('SELECT 1 as test')
    client.release()
    await pool.end()

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: result.rows,
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
