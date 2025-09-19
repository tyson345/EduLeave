import mysql from 'mysql2/promise'

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'leave_application_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Create a connection pool
const pool = mysql.createPool(dbConfig)

// Test the connection only in development
if (process.env.NODE_ENV !== 'production') {
  pool.getConnection()
    .then(connection => {
      console.log('Database connected successfully')
      connection.release()
    })
    .catch(err => {
      console.error('Error connecting to database:', err)
      console.error('Please check your database credentials in the .env file')
    })
}

// Function to get all students
export async function getStudents() {
  try {
    const [rows] = await pool.execute('SELECT * FROM students')
    return rows as mysql.RowDataPacket[]
  } catch (error) {
    console.error('Error fetching students:', error)
    throw error
  }
}

// Function to get student by USN
export async function getStudentByUSN(usn: string) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM students WHERE usn = ?',
      [usn]
    )
    const result = rows as mysql.RowDataPacket[]
    return result[0] || null
  } catch (error) {
    console.error('Error fetching student by USN:', error)
    throw error
  }
}

// Function to get student leave balance
export async function getStudentLeaveBalance(studentId: number, semester: number) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM leave_balances WHERE student_id = ? AND semester = ?',
      [studentId, semester]
    )
    const result = rows as mysql.RowDataPacket[]
    return result[0] || null
  } catch (error) {
    console.error('Error fetching student leave balance:', error)
    throw error
  }
}

// Function to get student leave applications
export async function getStudentLeaveApplications(studentId: number) {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM leave_applications 
       WHERE student_id = ? 
       ORDER BY applied_at DESC`,
      [studentId]
    )
    return rows as mysql.RowDataPacket[]
  } catch (error) {
    console.error('Error fetching student leave applications:', error)
    throw error
  }
}

// Function to get pending leave applications for HOD
export async function getPendingLeaveApplications() {
  try {
    const [rows] = await pool.execute(
      `SELECT la.*, s.name, s.usn 
       FROM leave_applications la
       JOIN students s ON la.student_id = s.id
       WHERE la.status = 'pending'
       ORDER BY la.applied_at ASC`
    )
    return rows as mysql.RowDataPacket[]
  } catch (error) {
    console.error('Error fetching pending leave applications:', error)
    throw error
  }
}

// Function to get approved leave applications for HOD
export async function getApprovedLeaveApplications() {
  try {
    const [rows] = await pool.execute(
      `SELECT la.*, s.name, s.usn 
       FROM leave_applications la
       JOIN students s ON la.student_id = s.id
       WHERE la.status = 'approved'
       ORDER BY la.processed_at DESC
       LIMIT 10`
    )
    return rows as mysql.RowDataPacket[]
  } catch (error) {
    console.error('Error fetching approved leave applications:', error)
    throw error
  }
}

// Function to submit a leave application
export async function submitLeaveApplication(data: {
  studentId: number
  leaveType: string
  startDate: string
  endDate: string | null
  reason: string
  attachmentPath: string | null
  halfDaySession?: string
}) {
  try {
    const { studentId, leaveType, startDate, endDate, reason, attachmentPath, halfDaySession } = data
    
    const [result]: any = await pool.execute(
      `INSERT INTO leave_applications 
       (student_id, leave_type, half_day_session, start_date, end_date, reason, attachment_path)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        leaveType,
        leaveType === 'half' ? halfDaySession : null,
        startDate,
        endDate,
        reason,
        attachmentPath
      ]
    )
    
    return result.insertId
  } catch (error) {
    console.error('Error submitting leave application:', error)
    throw error
  }
}

// Function to submit a special leave request
export async function submitSpecialLeaveRequest(data: {
  studentId: number
  reason: string
  explanation: string
  attachmentPath: string | null
}) {
  try {
    const { studentId, reason, explanation, attachmentPath } = data
    
    const [result]: any = await pool.execute(
      `INSERT INTO special_leave_requests 
       (student_id, reason, explanation, attachment_path)
       VALUES (?, ?, ?, ?)`,
      [studentId, reason, explanation, attachmentPath]
    )
    
    return result.insertId
  } catch (error) {
    console.error('Error submitting special leave request:', error)
    throw error
  }
}

// Function to update leave balance
export async function updateLeaveBalance(studentId: number, daysTaken: number) {
  try {
    await pool.execute(
      `UPDATE leave_balances 
       SET leave_taken = leave_taken + ?, 
           leave_remaining = leave_remaining - ?
       WHERE student_id = ?`,
      [daysTaken, daysTaken, studentId]
    )
  } catch (error) {
    console.error('Error updating leave balance:', error)
    throw error
  }
}

// Export the pool for use in other files
export default pool