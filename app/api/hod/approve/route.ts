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

// Handle POST request to approve a leave application
export async function POST(request: Request) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Leave application ID is required' },
        { status: 400 }
      )
    }
    
    // Create database connection
    const connection = await mysql.createConnection(dbConfig)
    
    // Update leave application status to approved
    const [result]: any = await connection.execute(
      `UPDATE leave_applications 
       SET status = 'approved', processed_at = NOW(), processed_by = 'HOD'
       WHERE id = ?`,
      [id]
    )
    
    // If it's a full day leave, update the student's leave balance
    // First, get the leave application details
    const [rows]: any = await connection.execute(
      'SELECT student_id, start_date, end_date FROM leave_applications WHERE id = ?',
      [id]
    )
    
    if (rows.length > 0) {
      const leaveApplication = rows[0]
      
      // Calculate number of days taken
      if (leaveApplication.end_date) {
        const startDate = new Date(leaveApplication.start_date)
        const endDate = new Date(leaveApplication.end_date)
        const timeDiff = endDate.getTime() - startDate.getTime()
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
        
        // Update leave balance
        await connection.execute(
          `UPDATE leave_balances 
           SET leave_taken = leave_taken + ?, 
               leave_remaining = leave_remaining - ?
           WHERE student_id = ?`,
          [daysDiff, daysDiff, leaveApplication.student_id]
        )
      }
    }
    
    await connection.end()
    
    if (result.affectedRows > 0) {
      return NextResponse.json({
        success: true,
        message: 'Leave application approved successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Leave application not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error approving leave application:', error)
    return NextResponse.json(
      { error: 'Failed to approve leave application' },
      { status: 500 }
    )
  }
}