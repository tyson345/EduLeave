import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get authentication tokens from cookies or headers
  const studentToken = request.cookies.get('student_auth')?.value
  const hodToken = request.cookies.get('hod_auth')?.value
  
  // Protected routes that require authentication
  const protectedRoutes = {
    student: ['/dashboard', '/apply-leave', '/request-leave', '/leave-history'],
    hod: ['/hod', '/hod/students']
  }
  
  // Check if the current path requires student authentication
  const requiresStudentAuth = protectedRoutes.student.some(route => 
    pathname.startsWith(route)
  )
  
  // Check if the current path requires HOD authentication
  const requiresHODAuth = protectedRoutes.hod.some(route => 
    pathname.startsWith(route)
  )
  
  // If accessing student routes without student auth
  if (requiresStudentAuth && !studentToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // If accessing HOD routes without HOD auth
  if (requiresHODAuth && !hodToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Prevent cross-role access
  if (requiresStudentAuth && hodToken) {
    return NextResponse.redirect(new URL('/hod', request.url))
  }
  
  if (requiresHODAuth && studentToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/apply-leave/:path*',
    '/request-leave/:path*',
    '/leave-history/:path*',
    '/hod/:path*'
  ]
}
