'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useNotification } from '../../components/Notification'

export default function TestPasswordResetPage() {
  const { showNotification } = useNotification()
  const [testType, setTestType] = useState<'student' | 'hod'>('student')

  const testAccounts = {
    student: {
      usn: '4PM22CG001',
      name: 'Aditya S',
      currentPassword: 'password123',
      newPassword: 'newpass123'
    },
    hod: {
      eid: 'HOD001',
      name: 'Dr. Smith',
      currentPassword: '123456',
      newPassword: 'newpass456'
    }
  }

  const handleTestLogin = async (type: 'student' | 'hod') => {
    const account = testAccounts[type]
    
    try {
      const endpoint = type === 'student' ? '/api/auth/student' : '/api/auth/hod'
      const body = type === 'student' 
        ? { usn: (account as any).usn, password: account.currentPassword }
        : { eid: (account as any).eid, password: account.currentPassword }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const result = await response.json()
      
      if (result.success) {
        // Set cookie
        const cookieName = type === 'student' ? 'student_auth' : 'hod_auth'
        const cookieValue = type === 'student' ? (account as any).usn : (account as any).eid
        document.cookie = `${cookieName}=${cookieValue}; path=/; secure; samesite=strict; max-age=86400`
        
        showNotification({
          type: 'success',
          title: 'Login Successful',
          message: `Logged in as ${account.name} (${type.toUpperCase()})`
        })
        
        // Redirect to appropriate dashboard
        setTimeout(() => {
          window.location.href = type === 'student' ? '/dashboard' : '/hod'
        }, 1000)
      } else {
        showNotification({
          type: 'error',
          title: 'Login Failed',
          message: result.error || 'Login failed'
        })
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Login Error',
        message: 'Failed to login. Please try again.'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Password Reset Testing
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Test both student and HOD password reset functionality
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Student Testing */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Student Testing</h2>
            </div>

            <div className="space-y-3 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>USN:</strong> {testAccounts.student.usn}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Name:</strong> {testAccounts.student.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Current Password:</strong> {testAccounts.student.currentPassword}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleTestLogin('student')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Login as Student
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/change-password"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center text-sm"
                >
                  Change Password
                </Link>
                <Link
                  href="/reset-password-simple"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center text-sm"
                >
                  Reset Password
                </Link>
              </div>
            </div>
          </div>

          {/* HOD Testing */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">HOD Testing</h2>
            </div>

            <div className="space-y-3 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>EID:</strong> {testAccounts.hod.eid}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Name:</strong> {testAccounts.hod.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Current Password:</strong> {testAccounts.hod.currentPassword}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleTestLogin('hod')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Login as HOD
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/change-password"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center text-sm"
                >
                  Change Password
                </Link>
                <Link
                  href="/reset-password-simple"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center text-sm"
                >
                  Reset Password
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Testing Instructions</h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start">
              <span className="font-medium text-blue-600 dark:text-blue-400 mr-2">1.</span>
              <span>Click "Login as Student" or "Login as HOD" to authenticate</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium text-green-600 dark:text-green-400 mr-2">2.</span>
              <span>Click "Change Password" to test password change with current password verification</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium text-orange-600 dark:text-orange-400 mr-2">3.</span>
              <span>Click "Reset Password" to test password reset without current password (uses USN/EID)</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium text-purple-600 dark:text-purple-400 mr-2">4.</span>
              <span>Test both scenarios: knowing current password vs forgetting current password</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
