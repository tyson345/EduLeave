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

// Handle GET request for detailed student information
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = parseInt(params.id)
    if (isNaN(studentId)) {
      return NextResponse.json(
        { error: 'Invalid student ID' },
        { status: 400 }
      )
    }

    // Create database connection
    const connection = await mysql.createConnection(dbConfig)

    // Fetch basic student information
    const [studentRows]: any = await connection.execute(`
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
      WHERE s.id = ?
    `, [studentId])

    if (studentRows.length === 0) {
      await connection.end()
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    const student = studentRows[0]

    // Fetch attendance data (sample data for demonstration)
    const attendanceData = []
    for (let sem = 1; sem <= student.semester; sem++) {
      // Generate realistic attendance data
      const totalClasses = 60 + Math.floor(Math.random() * 20) // 60-80 classes per semester
      const attendanceRate = 0.75 + Math.random() * 0.2 // 75-95% attendance
      const attendedClasses = Math.floor(totalClasses * attendanceRate)

      attendanceData.push({
        semester: sem,
        total_classes: totalClasses,
        attended_classes: attendedClasses,
        percentage: (attendedClasses / totalClasses) * 100
      })
    }

    // Fetch semester marks data (sample data for demonstration)
    const semesterMarksData = []
    for (let sem = 1; sem <= student.semester; sem++) {
      const subjects = [
        { name: 'Data Structures & Algorithms', marks: 75 + Math.floor(Math.random() * 25), total: 100 },
        { name: 'Database Management Systems', marks: 70 + Math.floor(Math.random() * 30), total: 100 },
        { name: 'Computer Networks', marks: 72 + Math.floor(Math.random() * 28), total: 100 },
        { name: 'Software Engineering', marks: 78 + Math.floor(Math.random() * 22), total: 100 },
        { name: 'Web Technologies', marks: 80 + Math.floor(Math.random() * 20), total: 100 },
        { name: 'Operating Systems', marks: 73 + Math.floor(Math.random() * 27), total: 100 }
      ]

      // Calculate grades and SGPA
      const gradedSubjects = subjects.map(subject => {
        const percentage = (subject.marks / subject.total) * 100
        let grade = 'F'
        if (percentage >= 90) grade = 'O'
        else if (percentage >= 80) grade = 'A+'
        else if (percentage >= 70) grade = 'A'
        else if (percentage >= 60) grade = 'B+'
        else if (percentage >= 50) grade = 'B'
        else if (percentage >= 40) grade = 'C'

        return { ...subject, grade }
      })

      // Calculate SGPA (simplified calculation)
      const totalPoints = gradedSubjects.reduce((sum, subject) => {
        const gradePoints = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0 }
        return sum + gradePoints[subject.grade as keyof typeof gradePoints]
      }, 0)

      const sgpa = totalPoints / gradedSubjects.length

      semesterMarksData.push({
        semester: sem,
        subjects: gradedSubjects,
        sgpa: Math.round(sgpa * 100) / 100
      })
    }

    // Fetch leave history
    const [leaveRows]: any = await connection.execute(`
      SELECT
        id,
        leave_type,
        start_date,
        end_date,
        status,
        reason
      FROM leave_applications
      WHERE student_id = ?
      ORDER BY applied_at DESC
    `, [studentId])

    await connection.end()

    // Transform the data
    const studentData = {
      id: student.id,
      usn: student.usn,
      name: student.name,
      email: student.email,
      semester: student.semester,
      department: student.department,
      cgpa: student.cgpa,
      leave_balance: student.leave_balance_id ? {
        id: student.leave_balance_id,
        student_id: student.id,
        semester: student.leave_semester,
        total_leave_allowed: student.total_leave_allowed,
        leave_taken: student.leave_taken,
        leave_remaining: student.leave_remaining,
        last_updated: student.last_updated
      } : null,
      attendance: attendanceData,
      semester_marks: semesterMarksData,
      leave_history: leaveRows.map((leave: any) => ({
        id: leave.id,
        leave_type: leave.leave_type,
        start_date: leave.start_date,
        end_date: leave.end_date,
        status: leave.status,
        reason: leave.reason
      }))
    }

    return NextResponse.json({
      success: true,
      data: studentData
    })
  } catch (error: any) {
    console.error('Error fetching student details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student details' },
      { status: 500 }
    )
  }
}