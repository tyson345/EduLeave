'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
  name: string
  usn: string
}

export default function HODDashboard() {
  const [pendingLeaves, setPendingLeaves] = useState<LeaveApplication[]>([])
  const [approvedLeaves, setApprovedLeaves] = useState<LeaveApplication[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectId, setRejectId] = useState<number | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Fetch leave data
// Check if HOD is authenticated
      const eid = localStorage.getItem('hod_eid')
      
      if (!eid) {
        // Redirect to login page if not authenticated
        window.location.href = '/login'
        return
      }
  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        // Fetch pending leave applications
        const pendingResponse = await fetch('/api/hod/pending')
        const pendingResult = await pendingResponse.json()
        
        // Fetch approved leave applications
        const approvedResponse = await fetch('/api/hod/approved')
        const approvedResult = await approvedResponse.json()
        
        if (pendingResult.success && approvedResult.success) {
          setPendingLeaves(pendingResult.data)
          setApprovedLeaves(approvedResult.data)
        } else {
          setError(pendingResult.error || approvedResult.error || 'Failed to fetch leave data')
        }
      } catch (err) {
        setError('Failed to fetch leave data')
        console.error('Error fetching leave data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaveData()
  }, [])

  const handleApprove = async (id: number) => {
    try {
      setProcessingId(id)
      
      // Call the approve API
      const response = await fetch('/api/hod/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Refresh the data after approval
        const pendingResponse = await fetch('/api/hod/pending')
        const pendingResult = await pendingResponse.json()
        
        const approvedResponse = await fetch('/api/hod/approved')
        const approvedResult = await approvedResponse.json()
        
        if (pendingResult.success && approvedResult.success) {
          setPendingLeaves(pendingResult.data)
          setApprovedLeaves(approvedResult.data)
          alert(`Leave application ${id} approved!`)
        } else {
          throw new Error(pendingResult.error || approvedResult.error || 'Failed to refresh data')
        }
      } else {
        throw new Error(result.error || 'Failed to approve leave application')
      }
    } catch (err) {
      console.error('Error approving leave:', err)
      alert('Failed to approve leave application')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: number, reason: string) => {
    try {
      setProcessingId(id)
      setShowRejectModal(false)
      setRejectId(null)
      setRejectionReason('')
      
      // Call the reject API
      const response = await fetch('/api/hod/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, rejectionReason: reason }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Refresh the data after rejection
        const pendingResponse = await fetch('/api/hod/pending')
        const pendingResult = await pendingResponse.json()
        
        const approvedResponse = await fetch('/api/hod/approved')
        const approvedResult = await approvedResponse.json()
        
        if (pendingResult.success && approvedResult.success) {
          setPendingLeaves(pendingResult.data)
          setApprovedLeaves(approvedResult.data)
          alert(`Leave application ${id} rejected!`)
        } else {
          throw new Error(pendingResult.error || approvedResult.error || 'Failed to refresh data')
        }
      } else {
        throw new Error(result.error || 'Failed to reject leave application')
      }
    } catch (err) {
      console.error('Error rejecting leave:', err)
      alert('Failed to reject leave application')
    } finally {
      setProcessingId(null)
    }
  }

  const openRejectModal = (id: number) => {
    setRejectId(id)
    setShowRejectModal(true)
  }

  const closeRejectModal = () => {
    setShowRejectModal(false)
    setRejectId(null)
    setRejectionReason('')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HOD Dashboard</h1>
          <div className="flex gap-3">
            <Link
              href="/hod/students"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              View All Students
            </Link>
            <Link
              href="/"
              className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              Student View
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('hod_eid')
                window.location.href = '/'
              }}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">Manage student leave applications</p>
        
        {/* Pending Leaves Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Leave Applications</h2>
            <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 py-1 px-3 rounded-full font-semibold">
              {pendingLeaves.length} pending
            </span>
          </div>

          {pendingLeaves.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-600">
              <p className="text-gray-600 dark:text-gray-400">No pending leave applications</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingLeaves.map((leave) => (
                <div key={leave.id} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{leave.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{leave.usn}</p>
                    </div>
                    <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 py-1 px-3 rounded-full text-sm font-semibold">
                      {leave.leave_type === 'half' ? 'Half Day' : 'Full Day'}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="font-medium text-gray-700 dark:text-gray-300">Leave Dates:</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {leave.start_date} {leave.end_date && leave.start_date !== leave.end_date ? `to ${leave.end_date}` : ''}
                      {leave.leave_type === 'half' && leave.half_day_session && (
                        <span className="ml-2">({leave.half_day_session})</span>
                      )}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="font-medium text-gray-700 dark:text-gray-300">Reason:</p>
                    <p className="text-gray-600 dark:text-gray-400">{leave.reason}</p>
                  </div>

                  {leave.attachment_path && (
                    <div className="mb-4">
                      <p className="font-medium text-gray-700 dark:text-gray-300">Attachment:</p>
                      <Link href={leave.attachment_path} className="text-blue-600 dark:text-blue-400 hover:underline">
                        View Document
                      </Link>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(leave.id)}
                      disabled={processingId === leave.id}
                      className={`flex-1 ${
                        processingId === leave.id 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white font-bold py-2 px-4 rounded-lg transition duration-300`}
                    >
                      {processingId === leave.id ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => openRejectModal(leave.id)}
                      disabled={processingId === leave.id}
                      className={`flex-1 ${
                        processingId === leave.id 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-red-600 hover:bg-red-700'
                      } text-white font-bold py-2 px-4 rounded-lg transition duration-300`}
                    >
                      {processingId === leave.id ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Messaging Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Student Messages
            </h2>
            <Link
              href="/hod/students"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-center shadow-md hover:shadow-lg"
            >
              View All Students
            </Link>
          </div>

          <div className="space-y-4">
            {/* Sample messages - in a real app, this would be fetched from the API */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100">From: Rushidhar (4PM22CG001)</p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">Subject: Leave Extension Request</p>
                  <p className="text-blue-700 dark:text-blue-300 mt-2">I would like to request an extension for my medical leave...</p>
                </div>
                <div className="text-right">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                    New
                  </span>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">2 hours ago</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">From: Metigouda (4PM22CG002)</p>
                  <p className="text-sm text-green-800 dark:text-green-200 mt-1">Subject: Project Submission</p>
                  <p className="text-green-700 dark:text-green-300 mt-2">I have submitted my project documentation as requested...</p>
                </div>
                <div className="text-right">
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                    Read
                  </span>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">1 day ago</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-yellow-900 dark:text-yellow-100">From: Sourabh Patil (CS2023001)</p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">Subject: Academic Performance</p>
                  <p className="text-yellow-700 dark:text-yellow-300 mt-2">Thank you for the feedback on my recent performance...</p>
                </div>
                <div className="text-right">
                  <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded-full">
                    Read
                  </span>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Approved Leaves Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recent Approved Leaves</h2>

          {approvedLeaves.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-600">
              <p className="text-gray-600 dark:text-gray-400">No approved leave applications</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left text-gray-900 dark:text-white font-semibold">Student</th>
                    <th className="py-3 px-4 text-left text-gray-900 dark:text-white font-semibold">USN</th>
                    <th className="py-3 px-4 text-left text-gray-900 dark:text-white font-semibold">Leave Type</th>
                    <th className="py-3 px-4 text-left text-gray-900 dark:text-white font-semibold">Dates</th>
                    <th className="py-3 px-4 text-left text-gray-900 dark:text-white font-semibold">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedLeaves.map((leave) => (
                    <tr key={leave.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{leave.name}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{leave.usn}</td>
                      <td className="py-3 px-4">
                        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 py-1 px-2 rounded-full text-xs">
                          {leave.leave_type === 'half' ? 'Half Day' : 'Full Day'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {leave.start_date} {leave.end_date && leave.start_date !== leave.end_date ? `to ${leave.end_date}` : ''}
                        {leave.leave_type === 'half' && leave.half_day_session && (
                          <span className="ml-2">({leave.half_day_session})</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{leave.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Reject Leave Application</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this leave application:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              rows={4}
              placeholder="Enter rejection reason..."
            ></textarea>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => rejectId && handleReject(rejectId, rejectionReason)}
                disabled={!rejectionReason.trim()}
                className={`px-4 py-2 rounded-lg text-white ${
                  !rejectionReason.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}