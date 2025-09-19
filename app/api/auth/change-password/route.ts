import { NextRequest, NextResponse } from 'next/server'
import db from '../../../../lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userType, currentPassword, newPassword } = await request.json()

    if (!userType || !currentPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        error: 'User type, current password, and new password are required'
      }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'New password must be at least 6 characters long'
      }, { status: 400 })
    }

    if (currentPassword === newPassword) {
      return NextResponse.json({
        success: false,
        error: 'New password must be different from current password'
      }, { status: 400 })
    }

    // Get user identifier from cookies
    const cookies = request.headers.get('cookie') || ''
    let userIdentifier = ''
    
    if (userType === 'student') {
      const studentAuth = cookies.split(';').find(c => c.trim().startsWith('student_auth='))
      if (!studentAuth) {
        return NextResponse.json({
          success: false,
          error: 'Student authentication required'
        }, { status: 401 })
      }
      userIdentifier = studentAuth.split('=')[1]
    } else if (userType === 'hod') {
      const hodAuth = cookies.split(';').find(c => c.trim().startsWith('hod_auth='))
      if (!hodAuth) {
        return NextResponse.json({
          success: false,
          error: 'HOD authentication required'
        }, { status: 401 })
      }
      userIdentifier = hodAuth.split('=')[1]
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid user type'
      }, { status: 400 })
    }

    let userResult

    if (userType === 'student') {
      // Verify current password for student
      const result = await db.query(
        'SELECT id, usn, password FROM students WHERE usn = $1',
        [userIdentifier]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Student not found'
        }, { status: 404 })
      }

      const student = result.rows[0]
      
      // In a real application, you would hash and compare passwords
      // For now, we'll do a simple comparison (you should use bcrypt in production)
      if (student.password !== currentPassword) {
        return NextResponse.json({
          success: false,
          error: 'Current password is incorrect'
        }, { status: 401 })
      }

      // Update password
      await db.query(
        'UPDATE students SET password = $1 WHERE usn = $2',
        [newPassword, userIdentifier]
      )
    } else if (userType === 'hod') {
      // Verify current password for HOD
      const hodResult = await db.query(
        'SELECT id, eid, password FROM hod WHERE eid = $1',
        [userIdentifier]
      )

      if (hodResult.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'HOD not found'
        }, { status: 404 })
      }

      const hod = hodResult.rows[0]
      
      // In a real application, you would hash and compare passwords
      // For now, we'll do a simple comparison (you should use bcrypt in production)
      if (hod.password !== currentPassword) {
        return NextResponse.json({
          success: false,
          error: 'Current password is incorrect'
        }, { status: 401 })
      }

      // Update password
      await db.query(
        'UPDATE hod SET password = $1 WHERE eid = $2',
        [newPassword, userIdentifier]
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been changed successfully'
    })

  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error. Please try again later.'
    }, { status: 500 })
  }
}
