import { NextResponse } from 'next/server'
import { submitSpecialLeaveRequest } from '../../../lib/db'

// Handle POST request for special leave request
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.studentId || !data.reason || !data.explanation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Submit special leave request
    const requestId = await submitSpecialLeaveRequest({
      studentId: data.studentId,
      reason: data.reason,
      explanation: data.explanation,
      attachmentPath: data.attachmentPath
    })
    
    return NextResponse.json({
      success: true,
      requestId,
      message: 'Special leave request submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting special leave request:', error)
    return NextResponse.json(
      { error: 'Failed to submit special leave request' },
      { status: 500 }
    )
  }
}