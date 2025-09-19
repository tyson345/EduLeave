import { NextResponse } from 'next/server'
import { Pool } from 'pg'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  // Force using POSTGRES_URL connection string
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  
  try {
    if (!connectionString) {
      throw new Error('No database connection string found. Please set POSTGRES_URL environment variable.')
    }
    
    const dbConfig = {
      connectionString: connectionString,
      ssl: { 
        rejectUnauthorized: false,
        checkServerIdentity: () => undefined
      }
    }
    
    console.log('Using connection string:', connectionString.substring(0, 50) + '...')
    console.log('Full connection string available:', !!connectionString)

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
        connectionString: connectionString.substring(0, 50) + '...',
        sslEnabled: true,
        connectionMethod: 'POSTGRES_URL'
      }
    })
  } catch (error: any) {
    console.error('Database connection error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      config: {
        connectionString: connectionString ? connectionString.substring(0, 50) + '...' : 'Not available',
        sslEnabled: true,
        connectionMethod: 'POSTGRES_URL'
      }
    }, { status: 500 })
  }
}
