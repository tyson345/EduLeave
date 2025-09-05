import { NextResponse } from 'next/server'
import { submitLeaveApplication, getStudentLeaveBalance } from '../../../lib/db'

// Handle POST request for leave application
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.studentId || !data.leaveType || !data.startDate || !data.reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Check leave balance for full day leave
    if (data.leaveType === 'full') {
      const leaveBalance = await getStudentLeaveBalance(data.studentId, data.semester)
      
      if (!leaveBalance || leaveBalance.leave_remaining <= 0) {
        return NextResponse.json(
          { error: 'No leave balance available. Please submit a special leave request.' },
          { status: 400 }
        )
      }
      
      // Calculate number of days
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)
      const timeDiff = endDate.getTime() - startDate.getTime()
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
      
      if (daysDiff > leaveBalance.leave_remaining) {
        return NextResponse.json(
          { error: `Insufficient leave balance. You only have ${leaveBalance.leave_remaining} days remaining.` },
          { status: 400 }
        )
      }
    }
    
    // Submit leave application
    const applicationId = await submitLeaveApplication({
      studentId: data.studentId,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
      attachmentPath: data.attachmentPath,
      halfDaySession: data.halfDaySession
    })
    
    // For half day leave, we don't deduct from balance
    // For full day leave, we would update the balance in a real implementation
    
    return NextResponse.json({
      success: true,
      applicationId,
      message: 'Leave application submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting leave application:', error)
    return NextResponse.json(
      { error: 'Failed to submit leave application' },
      { status: 500 }
    )
  }
}