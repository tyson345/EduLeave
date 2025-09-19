import { NextRequest, NextResponse } from 'next/server'
import db from '../../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const { token, userType } = await request.json()

    if (!token || !userType) {
      return NextResponse.json({
        success: false,
        error: 'Token and user type are required'
      }, { status: 400 })
    }

    let result

    if (userType === 'student') {
      const [rows] = await db.execute(
        'SELECT id, usn, name, email FROM students WHERE reset_token = ? AND reset_expires > NOW()',
        [token]
      )
      result = rows
    } else if (userType === 'hod') {
      const [rows] = await db.execute(
        'SELECT id, eid, name, email FROM hod WHERE reset_token = ? AND reset_expires > NOW()',
        [token]
      )
      result = rows
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid user type'
      }, { status: 400 })
    }

    if ((result as any[]).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired reset token'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Token is valid',
      user: (result as any[])[0]
    })

  } catch (error) {
    console.error('Error validating reset token:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error. Please try again later.'
    }, { status: 500 })
  }
}
