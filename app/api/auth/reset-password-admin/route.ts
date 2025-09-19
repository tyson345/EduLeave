import { NextRequest, NextResponse } from 'next/server'
import db from '../../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userType, usn, eid, newPassword } = await request.json()

    if (!userType || !newPassword) {
      return NextResponse.json({
        success: false,
        error: 'User type and new password are required'
      }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'New password must be at least 6 characters long'
      }, { status: 400 })
    }

    let userIdentifier = ''
    let user = null

    if (userType === 'student') {
      if (!usn) {
        return NextResponse.json({
          success: false,
          error: 'USN is required for student password reset'
        }, { status: 400 })
      }

      // Check if student exists
      const [rows] = await db.execute(
        'SELECT id, usn, name FROM students WHERE usn = ?',
        [usn]
      )

      if ((rows as any[]).length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No student found with the provided USN'
        }, { status: 404 })
      }

      user = (rows as any[])[0]
      userIdentifier = usn

      // Update password
      await db.execute(
        'UPDATE students SET password = ? WHERE usn = ?',
        [newPassword, usn]
      )
    } else if (userType === 'hod') {
      if (!eid) {
        return NextResponse.json({
          success: false,
          error: 'EID is required for HOD password reset'
        }, { status: 400 })
      }

      // Check if HOD exists
      const [rows] = await db.execute(
        'SELECT id, eid, name FROM hod WHERE eid = ?',
        [eid]
      )

      if ((rows as any[]).length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No HOD found with the provided EID'
        }, { status: 404 })
      }

      user = (rows as any[])[0]
      userIdentifier = eid

      // Update password
      await db.execute(
        'UPDATE hod SET password = ? WHERE eid = ?',
        [newPassword, eid]
      )
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid user type'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Password has been reset successfully for ${userType} ${userIdentifier}`,
      user: {
        identifier: userIdentifier,
        name: user.name
      }
    })

  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error. Please try again later.'
    }, { status: 500 })
  }
}
