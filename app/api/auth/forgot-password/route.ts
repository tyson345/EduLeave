import { NextRequest, NextResponse } from 'next/server'
import db from '../../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userType, usn, eid, email } = await request.json()

    if (!userType || !email) {
      return NextResponse.json({
        success: false,
        error: 'User type and email are required'
      }, { status: 400 })
    }

    let user = null
    let userIdentifier = ''

    if (userType === 'student') {
      if (!usn) {
        return NextResponse.json({
          success: false,
          error: 'USN is required for student password reset'
        }, { status: 400 })
      }

      // Check if student exists
      const [studentRows] = await db.execute(
        'SELECT id, usn, name, email FROM students WHERE usn = ? AND email = ?',
        [usn, email]
      )

      if ((studentRows as any[]).length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No student found with the provided USN and email address'
        }, { status: 404 })
      }

      user = (studentRows as any[])[0]
      userIdentifier = usn
    } else if (userType === 'hod') {
      if (!eid) {
        return NextResponse.json({
          success: false,
          error: 'EID is required for HOD password reset'
        }, { status: 400 })
      }

      // Check if HOD exists
      const [hodRows] = await db.execute(
        'SELECT id, eid, name, email FROM hod WHERE eid = ? AND email = ?',
        [eid, email]
      )

      if ((hodRows as any[]).length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No HOD found with the provided EID and email address'
        }, { status: 404 })
      }

      user = (hodRows as any[])[0]
      userIdentifier = eid
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid user type'
      }, { status: 400 })
    }

    // Generate a simple reset token (in production, use a more secure method)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const resetExpires = new Date(Date.now() + 3600000) // 1 hour from now

    // Store reset token in database
    if (userType === 'student') {
      await db.execute(
        'UPDATE students SET reset_token = ?, reset_expires = ? WHERE id = ?',
        [resetToken, resetExpires, user.id]
      )
    } else {
      await db.execute(
        'UPDATE hod SET reset_token = ?, reset_expires = ? WHERE id = ?',
        [resetToken, resetExpires, user.id]
      )
    }

    // In a real application, you would send an email here
    // For now, we'll just log the reset link (in production, send via email service)
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&type=${userType}`
    
    console.log(`Password reset link for ${userType} ${userIdentifier}: ${resetLink}`)
    
    // TODO: Send email with reset link
    // await sendPasswordResetEmail(user.email, user.name, resetLink)

    return NextResponse.json({
      success: true,
      message: 'Password reset instructions have been sent to your email address',
      // In development, include the reset link in the response
      ...(process.env.NODE_ENV === 'development' && { resetLink })
    })

  } catch (error) {
    console.error('Error in forgot password:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error. Please try again later.'
    }, { status: 500 })
  }
}
