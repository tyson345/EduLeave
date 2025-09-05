import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'leave_application_system',
}

// Handle POST request to reject a leave application
export async function POST(request: Request) {
  try {
    const { id, rejectionReason } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Leave application ID is required' },
        { status: 400 }
      )
    }
    
    // Create database connection
    const connection = await mysql.createConnection(dbConfig)
    
    // Update leave application status to rejected
    const [result]: any = await connection.execute(
      `UPDATE leave_applications 
       SET status = 'rejected', processed_at = NOW(), processed_by = 'HOD', rejection_reason = ?
       WHERE id = ?`,
      [rejectionReason || null, id]
    )
    
    await connection.end()
    
    if (result.affectedRows > 0) {
      return NextResponse.json({
        success: true,
        message: 'Leave application rejected successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Leave application not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error rejecting leave application:', error)
    return NextResponse.json(
      { error: 'Failed to reject leave application' },
      { status: 500 }
    )
  }
}