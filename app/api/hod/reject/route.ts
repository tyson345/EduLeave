import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

// Handle POST request to reject a leave application
export async function POST(request: Request) {
  try {
    const { id, rejectionReason } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Leave application ID is required' },
        { status: 400 }
      )
    }
    
    // Update leave application status to rejected
    const result = await pool.query(
      `UPDATE leave_applications 
       SET status = 'rejected', processed_at = NOW(), processed_by = 'HOD', rejection_reason = $1
       WHERE id = $2`,
      [rejectionReason || null, id]
    )
    
    if (result.rowCount && result.rowCount > 0) {
      return NextResponse.json({
        success: true,
        message: 'Leave application rejected successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Leave application not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error rejecting leave application:', error)
    return NextResponse.json(
      { error: 'Failed to reject leave application' },
      { status: 500 }
    )
  }
}