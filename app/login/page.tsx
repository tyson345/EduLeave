'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [userType, setUserType] = useState<'student' | 'hod'>('student')
  const [usn, setUsn] = useState('')
  const [eid, setEid] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (userType === 'student') {
        if (!usn || !password) {
          throw new Error('USN and password are required')
        }
        
        // Call student authentication API
        const response = await fetch('/api/auth/student', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ usn, password }),
        })
        
        const result = await response.json()
        
        if (result.success) {
          // Store USN in localStorage for use in the dashboard
          localStorage.setItem('student_usn', usn)
          router.push('/dashboard')
        } else {
          throw new Error(result.error || 'Login failed')
        }
      } else {
        if (!eid || !password) {
          throw new Error('EID and password are required')
        }
        
        // Call HOD authentication API
        const response = await fetch('/api/auth/hod', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ eid, password }),
        })
        
        const result = await response.json()
        
        if (result.success) {
          // Store EID in localStorage for use in the dashboard
          localStorage.setItem('hod_eid', eid)
          router.push('/hod')
        } else {
          throw new Error(result.error || 'Login failed')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Department Leave Application System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
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

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleLogin}>
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 sm:text-sm font-medium"
                  placeholder="Enter your password"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200">
                  Forgot your password?
                </a>
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
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            &copy; 2025 Department Leave Application System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}