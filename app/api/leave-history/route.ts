import { NextResponse } from 'next/server'
import { getStudentLeaveApplications } from '../../../lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Handle GET request for student leave history
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }
    
    const leaveHistory = await getStudentLeaveApplications(parseInt(studentId))
    
    return NextResponse.json({
      success: true,
      data: leaveHistory
    })
  } catch (error) {
    console.error('Error fetching leave history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leave history' },
      { status: 500 }
    )
  }
}