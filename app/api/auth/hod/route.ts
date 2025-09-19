import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'leave_application_system',
}

// Handle POST request for HOD authentication
export async function POST(request: Request) {
  try {
    const { eid, password } = await request.json()
    
    if (!eid || !password) {
      return NextResponse.json(
        { error: 'EID and password are required' },
        { status: 400 }
      )
    }
    
    // Create database connection
    const connection = await mysql.createConnection(dbConfig)
    
    // Check if HOD exists with the provided EID
    const [rows]: any = await connection.execute(
      'SELECT * FROM hod WHERE eid = ?',
      [eid]
    )
    
    await connection.end()
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid EID or password' },
        { status: 401 }
      )
    }
    
    const hod = rows[0]
    
    // Compare the provided password with the stored password
    // Note: In production, passwords should be hashed using bcrypt
    const isValidPassword = password === hod.password
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid EID or password' },
        { status: 401 }
      )
    }
    
    // Return success response with HOD information
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      data: {
        hod: {
          id: hod.id,
          eid: hod.eid,
          name: hod.name,
          email: hod.email,
          department: hod.department
        }
      }
    })
  } catch (error: any) {
    console.error('Error during HOD authentication:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}