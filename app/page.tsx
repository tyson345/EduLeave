'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()

  // Removed auto-redirect to allow users to choose login type
  // Users can now click the login button to go to the login page

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <img src="/logo.svg" alt="EduLeave Logo" className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            EduLeave
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Leave Management System
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center mb-4">
                Choose your login type
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Link
                href="/login"
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login to Your Account
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Quick Access
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <svg className="mx-auto h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Students</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Apply for leave</p>
              </div>

              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <svg className="mx-auto h-8 w-8 text-green-600 dark:text-green-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-gray-900 dark:text-white">HOD</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Approve requests</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2025 EduLeave. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
