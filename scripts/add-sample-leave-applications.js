require('dotenv').config()
const mysql = require('mysql2/promise')

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'leave_application_system',
}

async function addSampleLeaveApplications() {
  try {
    const connection = await mysql.createConnection(dbConfig)
    console.log('Database connected successfully')

    // Get student ID 1 (assuming it exists)
    const [students] = await connection.execute('SELECT id, name, usn FROM students WHERE id = 1')
    
    if (students.length === 0) {
      console.log('No student found with ID 1')
      return
    }

    const student = students[0]
    console.log(`Adding sample leave applications for student: ${student.name} (${student.usn})`)

    // Sample leave applications
    const sampleLeaves = [
      {
        student_id: student.id,
        leave_type: 'full',
        start_date: '2024-01-15',
        end_date: '2024-01-15',
        reason: 'Medical appointment',
        status: 'approved',
        applied_at: '2024-01-14 10:00:00',
        processed_at: '2024-01-14 15:30:00',
        processed_by: 'HOD001'
      },
      {
        student_id: student.id,
        leave_type: 'half',
        half_day_session: 'morning',
        start_date: '2024-01-20',
        end_date: null,
        reason: 'Family function',
        status: 'approved',
        applied_at: '2024-01-19 09:00:00',
        processed_at: '2024-01-19 11:00:00',
        processed_by: 'HOD001'
      },
      {
        student_id: student.id,
        leave_type: 'full',
        start_date: '2024-01-25',
        end_date: '2024-01-26',
        reason: 'Personal work',
        status: 'pending',
        applied_at: '2024-01-24 14:00:00',
        processed_at: null,
        processed_by: null
      },
      {
        student_id: student.id,
        leave_type: 'half',
        half_day_session: 'afternoon',
        start_date: '2024-01-30',
        end_date: null,
        reason: 'Doctor visit',
        status: 'rejected',
        rejection_reason: 'Insufficient documentation',
        applied_at: '2024-01-29 16:00:00',
        processed_at: '2024-01-30 10:00:00',
        processed_by: 'HOD001'
      }
    ]

    // Insert sample leave applications
    for (const leave of sampleLeaves) {
      await connection.execute(`
        INSERT INTO leave_applications 
        (student_id, leave_type, half_day_session, start_date, end_date, reason, status, applied_at, processed_at, processed_by, rejection_reason)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        leave.student_id,
        leave.leave_type,
        leave.half_day_session,
        leave.start_date,
        leave.end_date,
        leave.reason,
        leave.status,
        leave.applied_at,
        leave.processed_at,
        leave.processed_by,
        leave.rejection_reason
      ])
    }

    console.log(`Added ${sampleLeaves.length} sample leave applications`)

    // Verify the data
    const [leaveHistory] = await connection.execute(`
      SELECT * FROM leave_applications WHERE student_id = ? ORDER BY applied_at DESC
    `, [student.id])

    console.log(`Leave history for student ${student.name}:`)
    leaveHistory.forEach((leave, index) => {
      console.log(`${index + 1}. ${leave.leave_type} day leave - ${leave.start_date} - Status: ${leave.status}`)
    })

    await connection.end()
    console.log('Sample leave applications added successfully!')

  } catch (error) {
    console.error('Error adding sample leave applications:', error)
  }
}

addSampleLeaveApplications()

