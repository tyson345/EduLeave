import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sourabh161@',
  database: process.env.DB_NAME || 'leave_application_system',
}

// POST - Mark message as read
export async function POST(request: Request) {
  try {
    const { messageId } = await request.json()

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    const connection = await mysql.createConnection(dbConfig)

    await connection.execute(
      'UPDATE messages SET is_read = TRUE, read_at = NOW() WHERE id = ?',
      [messageId]
    )

    await connection.end()

    return NextResponse.json({
      success: true,
      message: 'Message marked as read'
    })
  } catch (error: any) {
    console.error('Error marking message as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark message as read' },
      { status: 500 }
    )
  }
}