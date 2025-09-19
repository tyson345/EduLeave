'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useNotification } from '../../../components/Notification'
import { Navigation } from '../../../components/Navigation'
import { forceLogout } from '../../../lib/cookie-utils'

export default function HODPasswordResetPage() {
  const { showNotification } = useNotification()
  const router = useRouter()
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordChanged, setPasswordChanged] = useState(false)
  const [hodEid, setHodEid] = useState('')

  useEffect(() => {
    // Get HOD EID from cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(';').shift()
      return null
    }

    const eid = getCookie('hod_auth')
    if (!eid) {
      showNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in as HOD to access this page.'
      })
      router.push('/login')
      return
    }
    
    setHodEid(eid)
  }, [router, showNotification])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      showNotification({
        type: 'error',
        title: 'Password Mismatch',
        message: 'New passwords do not match. Please try again.'
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

    if (currentPassword === newPassword) {
      showNotification({
        type: 'error',
        title: 'Same Password',
        message: 'New password must be different from current password.'
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userType: 'hod', 
          currentPassword, 
          newPassword 
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setPasswordChanged(true)
        showNotification({
          type: 'success',
          title: 'Password Changed',
          message: 'Your password has been updated successfully!'
        })
      } else {
        showNotification({
          type: 'error',
          title: 'Change Failed',
          message: result.error || 'Failed to change password'
        })
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Change Error',
        message: 'Failed to change password. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  if (passwordChanged) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation userType="hod" userName="HOD" userIdentifier={hodEid} />
        
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-green-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                Password Changed Successfully
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                Your password has been updated. You can now log in with your new password.
              </p>
            </div>

            <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  For security reasons, you will need to log in again with your new password.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      forceLogout()
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-lg transition-colors duration-200"
                  >
                    Log In Again
                  </button>
                  <Link
                    href="/hod"
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-center"
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation userType="hod" userName="HOD" userIdentifier={hodEid} />
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Change HOD Password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Enter your current password and new password
            </p>
            <div className="mt-2 text-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                HOD Account: {hodEid}
              </span>
            </div>
          </div>

          <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
            <form className="space-y-6" onSubmit={handleChangePassword}>
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <div className="mt-1">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 sm:text-sm font-medium"
                    placeholder="Enter your current password"
                  />
                </div>
              </div>

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
                      Changing Password...
                    </span>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>

              <div className="text-center space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Forgot your current password?</p>
                </div>
                <Link
                  href="/reset-password-simple"
                  className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 transition-colors duration-200"
                >
                  Reset Password (Without Current Password) →
                </Link>
                <div className="pt-2">
                  <Link
                    href="/hod"
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200"
                  >
                    ← Back to HOD Dashboard
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
