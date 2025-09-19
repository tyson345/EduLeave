import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

// Handle POST request to approve a leave application
export async function POST(request: Request) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Leave application ID is required' },
        { status: 400 }
      )
    }
    
    // Update leave application status to approved
    const result = await pool.query(
      `UPDATE leave_applications 
       SET status = 'approved', processed_at = NOW(), processed_by = 'HOD'
       WHERE id = $1`,
      [id]
    )
    
    // If it's a full day leave, update the student's leave balance
    // First, get the leave application details
    const rows = await pool.query(
      'SELECT student_id, start_date, end_date FROM leave_applications WHERE id = $1',
      [id]
    )
    
    if (rows.rows.length > 0) {
      const leaveApplication = rows.rows[0]
      
      // Calculate number of days taken
      if (leaveApplication.end_date) {
        const startDate = new Date(leaveApplication.start_date)
        const endDate = new Date(leaveApplication.end_date)
        const timeDiff = endDate.getTime() - startDate.getTime()
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
        
        // Update leave balance
        await pool.query(
          `UPDATE leave_balances 
           SET leave_taken = leave_taken + $1, 
               leave_remaining = leave_remaining - $2
           WHERE student_id = $3`,
          [daysDiff, daysDiff, leaveApplication.student_id]
        )
      }
    }
    
    if (result.rowCount && result.rowCount > 0) {
      return NextResponse.json({
        success: true,
        message: 'Leave application approved successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Leave application not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error approving leave application:', error)
    return NextResponse.json(
      { error: 'Failed to approve leave application' },
      { status: 500 }
    )
  }
}