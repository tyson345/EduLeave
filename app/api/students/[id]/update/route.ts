import { NextRequest, NextResponse } from 'next/server'
import db from '../../../../../lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = parseInt(params.id)
    const { field, value, semester } = await request.json()

    if (!field || value === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Field and value are required'
      }, { status: 400 })
    }

    let result

    switch (field) {
      case 'cgpa':
        // Update student CGPA
        await db.execute(
          'UPDATE students SET cgpa = ? WHERE id = ?',
          [value, studentId]
        )
        result = { message: 'CGPA updated successfully' }
        break

      case 'attendance':
        // Update attendance for specific semester
        if (!semester) {
          return NextResponse.json({
            success: false,
            error: 'Semester is required for attendance update'
          }, { status: 400 })
        }
        
        const { total_classes, attended_classes } = value
        const percentage = (attended_classes / total_classes) * 100
        
        await db.execute(
          `INSERT INTO attendance (student_id, semester, total_classes, attended_classes, percentage) 
           VALUES (?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
           total_classes = VALUES(total_classes), 
           attended_classes = VALUES(attended_classes), 
           percentage = VALUES(percentage)`,
          [studentId, semester, total_classes, attended_classes, percentage]
        )
        result = { message: 'Attendance updated successfully' }
        break

      case 'marks':
        // Update marks for specific semester and subject
        if (!semester || !value.subject) {
          return NextResponse.json({
            success: false,
            error: 'Semester and subject are required for marks update'
          }, { status: 400 })
        }
        
        const { subject, marks, total } = value
        const grade = marks >= 90 ? 'A+' : 
                     marks >= 80 ? 'A' : 
                     marks >= 70 ? 'B+' : 
                     marks >= 60 ? 'B' : 
                     marks >= 50 ? 'C' : 'F'
        
        await db.execute(
          `INSERT INTO semester_marks (student_id, semester, subject_name, marks_obtained, total_marks, grade) 
           VALUES (?, ?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
           marks_obtained = VALUES(marks_obtained), 
           total_marks = VALUES(total_marks), 
           grade = VALUES(grade)`,
          [studentId, semester, subject, marks, total, grade]
        )
        result = { message: 'Marks updated successfully' }
        break

      case 'leave_balance':
        // Update leave balance
        if (!semester) {
          return NextResponse.json({
            success: false,
            error: 'Semester is required for leave balance update'
          }, { status: 400 })
        }
        
        const { total_leave_allowed, leave_taken } = value
        const leave_remaining = total_leave_allowed - leave_taken
        
        await db.execute(
          `INSERT INTO leave_balances (student_id, semester, total_leave_allowed, leave_taken, leave_remaining) 
           VALUES (?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
           total_leave_allowed = VALUES(total_leave_allowed), 
           leave_taken = VALUES(leave_taken), 
           leave_remaining = VALUES(leave_remaining)`,
          [studentId, semester, total_leave_allowed, leave_taken, leave_remaining]
        )
        result = { message: 'Leave balance updated successfully' }
        break

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid field specified'
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Error updating student information:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error. Please try again later.'
    }, { status: 500 })
  }
}

