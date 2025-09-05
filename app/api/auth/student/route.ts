import { NextResponse } from 'next/server'
import { getStudentByUSN } from '../../../../lib/db'

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
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}