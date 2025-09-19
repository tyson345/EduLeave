'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useNotification } from '../../components/Notification'

export default function ResetPasswordSimplePage() {
  const { showNotification } = useNotification()
  const router = useRouter()
  
  const [userType, setUserType] = useState<'student' | 'hod'>('student')
  const [usn, setUsn] = useState('')
  const [eid, setEid] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordReset, setPasswordReset] = useState(false)

  // Check if user is already logged in and set appropriate default
  React.useEffect(() => {
    const studentAuth = document.cookie.split(';').find(c => c.trim().startsWith('student_auth='))
    const hodAuth = document.cookie.split(';').find(c => c.trim().startsWith('hod_auth='))
    
    if (hodAuth) {
      setUserType('hod')
      // Pre-fill EID if HOD is logged in
      const eidValue = hodAuth.split('=')[1]
      setEid(eidValue)
    } else if (studentAuth) {
      setUserType('student')
      // Pre-fill USN if student is logged in
      const usnValue = studentAuth.split('=')[1]
      setUsn(usnValue)
    }
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      showNotification({
        type: 'error',
        title: 'Password Mismatch',
        message: 'Passwords do not match. Please try again.'
      })
      return
    }

    if (newPassword.length < 6) {
      showNotification({
        type: 'error',
        title: 'Password Too Short',
        message: 'Password must be at least 6 characters long.'
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userType, 
          usn: userType === 'student' ? usn : undefined,
          eid: userType === 'hod' ? eid : undefined,
          newPassword 
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setPasswordReset(true)
        showNotification({
          type: 'success',
          title: 'Password Reset',
          message: `Password has been reset successfully for ${result.user.name}!`
        })
      } else {
        showNotification({
          type: 'error',
          title: 'Reset Failed',
          message: result.error || 'Failed to reset password'
        })
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Reset Error',
        message: 'Failed to reset password. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  if (passwordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-green-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Password Reset Successfully
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Your password has been reset. You can now log in with your new password.
            </p>
          </div>

          <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <Link
                href="/login"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your account details to reset your password
          </p>
          <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Security Notice
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>This will reset your password without requiring your current password. Make sure you have access to this account.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-center mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setUserType('student')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  userType === 'student'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => setUserType('hod')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  userType === 'hod'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                HOD
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleResetPassword}>
            {userType === 'student' ? (
              <div>
                <label htmlFor="usn" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  University Seat Number (USN)
                </label>
                <div className="mt-1">
                  <input
                    id="usn"
                    name="usn"
                    type="text"
                    required
                    value={usn}
                    onChange={(e) => setUsn(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 sm:text-sm font-medium"
                    placeholder="Enter your USN (e.g., 4PM22CG001)"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="eid" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Employee ID (EID)
                </label>
                <div className="mt-1">
                  <input
                    id="eid"
                    name="eid"
                    type="text"
                    required
                    value={eid}
                    onChange={(e) => setEid(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 sm:text-sm font-medium"
                    placeholder="Enter your EID (e.g., HOD001)"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <div className="mt-1">
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 sm:text-sm font-medium"
                  placeholder="Enter your new password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm New Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 sm:text-sm font-medium"
                  placeholder="Confirm your new password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting Password...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200"
              >
                ← Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
