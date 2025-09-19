'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navigation } from '../../components/Navigation'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { ErrorMessage } from '../../components/ErrorMessage'
import { EmptyState } from '../../components/EmptyState'

// Define TypeScript interfaces
interface LeaveApplication {
  id: number
  student_id: number
  leave_type: string
  half_day_session: string | null
  start_date: string
  end_date: string | null
  reason: string
  attachment_path: string | null
  status: string
  rejection_reason: string | null
  applied_at: string
  processed_at: string | null
  processed_by: string | null
}

interface LeaveBalance {
  id: number
  student_id: number
  semester: number
  total_leave_allowed: number
  leave_taken: number
  leave_remaining: number
}

export default function LeaveHistory() {
  const [leaveHistory, setLeaveHistory] = useState<LeaveApplication[]>([])
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  // Fetch leave history data
  useEffect(() => {
    const fetchLeaveHistory = async () => {
      try {
        // Get USN from cookie (set during login)
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`
          const parts = value.split(`; ${name}=`)
          if (parts.length === 2) return parts.pop()?.split(';').shift()
          return null
        }
        
        const usn = getCookie('student_auth')

        if (!usn) {
          // Redirect to login page if not authenticated
          window.location.href = '/login'
          return
        }

        // Fetch student data to get the ID and leave balance
        const studentResponse = await fetch(`/api/student?usn=${usn}`)
        const studentResult = await studentResponse.json()

        if (studentResult.success) {
          const studentId = studentResult.data.student.id
          setLeaveBalance(studentResult.data.leaveBalance)
          
          // Fetch leave history
          const response = await fetch(`/api/leave-history?studentId=${studentId}`)
          const result = await response.json()
          
          if (result.success) {
            setLeaveHistory(result.data)
          } else {
            setError(result.error || 'Failed to fetch leave history')
          }
        } else {
          setError(studentResult.error || 'Failed to fetch student data')
        }
      } catch (err) {
        setError('Failed to fetch leave history')
        console.error('Error fetching leave history:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaveHistory()
  }, [])

  const filteredHistory = filter === 'all' 
    ? leaveHistory 
    : leaveHistory.filter(leave => leave.status.toLowerCase() === filter)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navigation userType="student" />
        <LoadingSpinner className="h-64" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navigation userType="student" />
        <ErrorMessage 
          message={error}
          details={[
            'Your database is running and accessible',
            'Your database credentials in the .env file are correct',
            'You have run the database initialization script: npm run init-db'
          ]}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navigation userType="student" />
      
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leave History</h1>
          <Link
            href="/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Applications
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'approved' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'rejected' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>
        
        {filteredHistory.length === 0 ? (
          <EmptyState
            icon={
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            title="No leave applications"
            description={
              filter === 'all' 
                ? "You haven't submitted any leave applications yet." 
                : `You don't have any ${filter} leave applications.`
            }
            action={
              <Link 
                href="/apply-leave" 
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Apply for Leave
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied On
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistory.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {leave.start_date}
                        {leave.end_date && leave.start_date !== leave.end_date && ` to ${leave.end_date}`}
                        {leave.leave_type === 'half' && leave.half_day_session && (
                          <span className="ml-2">({leave.half_day_session})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        leave.leave_type === 'half' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {leave.leave_type === 'half' ? 'Half Day' : 'Full Day'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={leave.reason}>
                        {leave.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(leave.applied_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        leave.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : leave.status === 'rejected' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </span>
                      {leave.rejection_reason && (
                        <div className="text-xs text-gray-500 mt-1" title={leave.rejection_reason}>
                          Reason: {leave.rejection_reason.length > 20 ? `${leave.rejection_reason.substring(0, 20)}...` : leave.rejection_reason}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {leaveBalance && (
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">Leave Balance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Leave Allowed</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{leaveBalance.total_leave_allowed} days</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Leave Taken</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{leaveBalance.leave_taken} days</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Leave Remaining</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{leaveBalance.leave_remaining} days</p>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  )
}