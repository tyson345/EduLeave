import { NextResponse } from 'next/server'
import { getApprovedLeaveApplications } from '../../../../lib/db'

export const dynamic = 'force-dynamic'

// Handle GET request for approved leave applications
export async function GET() {
  try {
    const approvedApplications = await getApprovedLeaveApplications()
    
    return NextResponse.json({
      success: true,
      data: approvedApplications
    })
  } catch (error) {
    console.error('Error fetching approved leave applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch approved leave applications' },
      { status: 500 }
    )
  }
}