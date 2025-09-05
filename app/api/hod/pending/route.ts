import { NextResponse } from 'next/server'
import { getPendingLeaveApplications } from '../../../../lib/db'

// Handle GET request for pending leave applications
export async function GET() {
  try {
    const pendingApplications = await getPendingLeaveApplications()
    
    return NextResponse.json({
      success: true,
      data: pendingApplications
    })
  } catch (error) {
    console.error('Error fetching pending leave applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending leave applications' },
      { status: 500 }
    )
  }
}