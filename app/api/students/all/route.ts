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

// Handle GET request for all students with leave balances
export async function GET() {
  try {
    // Create database connection
    const connection = await mysql.createConnection(dbConfig)

    // Fetch all students with their leave balances
    const [rows]: any = await connection.execute(`
      SELECT
        s.id,
        s.usn,
        s.name,
        s.email,
        s.phone,
        s.semester,
        s.department,
        s.cgpa,
        lb.id as leave_balance_id,
        lb.semester as leave_semester,
        lb.total_leave_allowed,
        lb.leave_taken,
        lb.leave_remaining,
        lb.last_updated
      FROM students s
      LEFT JOIN leave_balances lb ON s.id = lb.student_id AND s.semester = lb.semester
      ORDER BY s.semester DESC, s.name ASC
    `)

    await connection.end()

    // Transform the data to match our interface
    const students = rows.map((row: any) => ({
      id: row.id,
      usn: row.usn,
      name: row.name,
      email: row.email,
      semester: row.semester,
      department: row.department,
      cgpa: parseFloat(row.cgpa) || 0, // Ensure CGPA is a number
      leave_balance: row.leave_balance_id ? {
        id: row.leave_balance_id,
        student_id: row.id,
        semester: row.leave_semester,
        total_leave_allowed: row.total_leave_allowed,
        leave_taken: row.leave_taken,
        leave_remaining: row.leave_remaining,
        last_updated: row.last_updated
      } : null
    }))

    return NextResponse.json({
      success: true,
      data: students
    })
  } catch (error: any) {
    console.error('Error fetching all students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students data' },
      { status: 500 }
    )
  }
}