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

// GET - Fetch messages for a student or HOD
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const hodId = searchParams.get('hodId')

    if (!studentId && !hodId) {
      return NextResponse.json(
        { error: 'Either studentId or hodId is required' },
        { status: 400 }
      )
    }

    const connection = await mysql.createConnection(dbConfig)

    let query: string
    let params: any[]

    if (studentId) {
      // Get messages for a specific student
      query = `
        SELECT m.*, s.name as sender_name, r.name as receiver_name
        FROM messages m
        LEFT JOIN students s ON m.sender_id = s.id AND m.sender_type = 'student'
        LEFT JOIN students r ON m.receiver_id = r.id AND m.receiver_type = 'student'
        WHERE (m.receiver_id = ? AND m.receiver_type = 'student')
        OR (m.sender_id = ? AND m.sender_type = 'student')
        ORDER BY m.sent_at DESC
      `
      params = [studentId, studentId]
    } else {
      // Get messages for HOD (all messages)
      query = `
        SELECT m.*, s.name as sender_name, r.name as receiver_name
        FROM messages m
        LEFT JOIN students s ON m.sender_id = s.id AND m.sender_type = 'student'
        LEFT JOIN students r ON m.receiver_id = r.id AND m.receiver_type = 'student'
        ORDER BY m.sent_at DESC
      `
      params = []
    }

    const [rows] = await connection.execute(query, params)
    await connection.end()

    return NextResponse.json({
      success: true,
      data: rows
    })
  } catch (error: any) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST - Send a new message
export async function POST(request: Request) {
  try {
    const { senderId, senderType, receiverId, receiverType, subject, message } = await request.json()

    if (!senderId || !senderType || !receiverId || !receiverType || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const connection = await mysql.createConnection(dbConfig)

    const [result]: any = await connection.execute(
      'INSERT INTO messages (sender_id, sender_type, receiver_id, receiver_type, subject, message) VALUES (?, ?, ?, ?, ?, ?)',
      [senderId, senderType, receiverId, receiverType, subject, message]
    )

    await connection.end()

    return NextResponse.json({
      success: true,
      messageId: result.insertId,
      message: 'Message sent successfully'
    })
  } catch (error: any) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}