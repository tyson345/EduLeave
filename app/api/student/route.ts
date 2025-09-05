import { NextResponse } from 'next/server'
import { getStudentByUSN, getStudentLeaveBalance } from '../../../lib/db'

// Handle GET request for student information
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const usn = searchParams.get('usn')
    
    if (!usn) {
      return NextResponse.json(
        { error: 'USN is required' },
        { status: 400 }
      )
    }
    
    const student = await getStudentByUSN(usn)
    
    if (!student) {
      return NextResponse.json(
        { error: `Student with USN ${usn} not found` },
        { status: 404 }
      )
    }
    
    // Get current semester leave balance
    const leaveBalance = await getStudentLeaveBalance(student.id, student.semester)
    
    return NextResponse.json({
      success: true,
      data: {
        student,
        leaveBalance
      }
    })
  } catch (error: any) {
    console.error('Error fetching student information:', error)
    // Provide more specific error message
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Database connection failed. Please check your database credentials in the .env file.' },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: `Failed to fetch student information: ${error.message || error}` },
      { status: 500 }
    )
  }
}