import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Configure the runtime to use Node.js APIs
export const runtime = 'nodejs'

// Handle POST request for file upload
export async function POST(request: Request) {
  try {
    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    
    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Generate unique filename
    const timestamp = new Date().getTime()
    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `leave_attachment_${timestamp}.${fileExtension}`
    const filePath = join(uploadDir, uniqueFileName)
    
    // Save file to disk
    await writeFile(filePath, buffer)
    
    // Return the relative path to the uploaded file
    const relativePath = `/uploads/${uniqueFileName}`
    
    return NextResponse.json({
      success: true,
      filePath: relativePath,
      message: 'File uploaded successfully'
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}