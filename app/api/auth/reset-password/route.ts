import { NextRequest, NextResponse } from 'next/server'
import db from '../../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const { token, userType, newPassword } = await request.json()

    if (!token || !userType || !newPassword) {
      return NextResponse.json({
        success: false,
        error: 'Token, user type, and new password are required'
      }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Password must be at least 6 characters long'
      }, { status: 400 })
    }

    let result

    if (userType === 'student') {
      // Check if token is valid and not expired
      const [rows] = await db.execute(
        'SELECT id, usn, name, email FROM students WHERE reset_token = ? AND reset_expires > NOW()',
        [token]
      )

      if ((rows as any[]).length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Invalid or expired reset token'
        }, { status: 404 })
      }

      // Update password and clear reset token
      await db.execute(
        'UPDATE students SET password = ?, reset_token = NULL, reset_expires = NULL WHERE reset_token = ?',
        [newPassword, token]
      )
    } else if (userType === 'hod') {
      // Check if token is valid and not expired
      const [rows] = await db.execute(
        'SELECT id, eid, name, email FROM hod WHERE reset_token = ? AND reset_expires > NOW()',
        [token]
      )

      if ((rows as any[]).length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Invalid or expired reset token'
        }, { status: 404 })
      }

      // Update password and clear reset token
      await db.execute(
        'UPDATE hod SET password = ?, reset_token = NULL, reset_expires = NULL WHERE reset_token = ?',
        [newPassword, token]
      )
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid user type'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    })

  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error. Please try again later.'
    }, { status: 500 })
  }
}
