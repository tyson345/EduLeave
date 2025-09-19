'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useNotification } from '../../components/Notification'

export default function ForgotPasswordPage() {
  const { showNotification } = useNotification()
  const router = useRouter()

  // Remove automatic redirect - let users choose their option

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-blue-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Password Reset
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Choose how you'd like to reset your password
          </p>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Password Reset Options
              </h3>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                      <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Change Password (Recommended)
                    </h4>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                      If you're currently logged in, you can change your password using your current password.
                    </p>
                    <div className="mt-3">
                      <Link
                        href="/change-password"
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                      >
                        Change Password →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center">
                      <svg className="h-4 w-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      Reset Password (Forgot Current Password)
                    </h4>
                    <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
                      If you forgot your current password, you can reset it using your account details (USN/EID).
                    </p>
                    <div className="mt-3">
                      <Link
                        href="/reset-password-simple"
                        className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300"
                      >
                        Reset Password →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Need help? Contact your system administrator.
              </p>
              <Link
                href="/login"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}