import { NextResponse } from 'next/server'
import { getStudentByUSN } from '../../../../lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Handle POST request for student authentication
export async function POST(request: Request) {
  try {
    const { usn, password } = await request.json()
    
    if (!usn || !password) {
      return NextResponse.json(
        { error: 'USN and password are required' },
        { status: 400 }
      )
    }
    
    // In a real application, you would validate the password against a hashed password in the database
    // For this example, we'll just check if the student exists
    const student = await getStudentByUSN(usn)
    
    if (!student) {
      return NextResponse.json(
        { error: 'Invalid USN or password' },
        { status: 401 }
      )
    }
    
    // Compare the provided password with the stored password
    // Note: In production, passwords should be hashed using bcrypt
    const isValidPassword = password === student.password
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid USN or password' },
        { status: 401 }
      )
    }
    
    // Return success response with student information
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      data: {
        student: {
          id: student.id,
          usn: student.usn,
          name: student.name,
          email: student.email,
          semester: student.semester,
          department: student.department
        }
      }
    })
  } catch (error: any) {
    console.error('Error during student authentication:', error)
    
    // Provide more specific error messages
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Database connection failed. Please check your database configuration.' },
        { status: 500 }
      )
    }
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      return NextResponse.json(
        { error: 'Database access denied. Please check your credentials.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: `Authentication failed: ${error.message}` },
      { status: 500 }
    )
  }
}