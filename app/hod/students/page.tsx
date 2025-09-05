'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Define TypeScript interfaces
interface Student {
  id: number
  usn: string
  name: string
  email: string
  semester: number
  department: string
  cgpa: number
}

interface LeaveBalance {
  id: number
  student_id: number
  semester: number
  total_leave_allowed: number
  leave_taken: number
  leave_remaining: number
}

interface StudentWithLeave extends Student {
  leave_balance: LeaveBalance | null
}

export default function StudentsOverview() {
  const [students, setStudents] = useState<StudentWithLeave[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all')

  // Messaging state
  const [selectedStudent, setSelectedStudent] = useState<StudentWithLeave | null>(null)
  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [messageSubject, setMessageSubject] = useState('')
  const [messageContent, setMessageContent] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  // Check if HOD is authenticated
  useEffect(() => {
    const eid = localStorage.getItem('hod_eid')
    if (!eid) {
      window.location.href = '/login'
      return
    }
  }, [])

  // Fetch all students with their leave balances
  useEffect(() => {
    const fetchStudentsData = async () => {
      try {
        const response = await fetch('/api/students/all')
        const result = await response.json()

        if (result.success) {
          setStudents(result.data)
        } else {
          setError(result.error || 'Failed to fetch students data')
        }
      } catch (err: any) {
        setError('Failed to fetch students data')
        console.error('Error fetching students data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentsData()
  }, [])

  // Filter students based on search and semester
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.usn.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSemester = selectedSemester === 'all' || student.semester === selectedSemester
    return matchesSearch && matchesSemester
  })

  // Open message modal
  const openMessageModal = (student: StudentWithLeave) => {
    setSelectedStudent(student)
    setMessageModalOpen(true)
    setMessageSubject('')
    setMessageContent('')
  }

  // Close message modal
  const closeMessageModal = () => {
    setMessageModalOpen(false)
    setSelectedStudent(null)
    setMessageSubject('')
    setMessageContent('')
  }

  // Send message
  const sendMessage = async () => {
    if (!selectedStudent || !messageSubject.trim() || !messageContent.trim()) {
      alert('Please fill in all fields')
      return
    }

    setSendingMessage(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: 1, // HOD ID (assuming HOD ID is 1)
          senderType: 'hod',
          receiverId: selectedStudent.id,
          receiverType: 'student',
          subject: messageSubject,
          message: messageContent
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('Message sent successfully!')
        closeMessageModal()
      } else {
        alert('Failed to send message: ' + result.error)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSendingMessage(false)
    }
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
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Error</h2>
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Students Overview</h1>
            <p className="text-gray-600 dark:text-gray-400">Comprehensive view of all students and their academic status</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <Link
              href="/hod"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('hod_eid')
                window.location.href = '/'
              }}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or USN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>{sem}th Semester</option>
              ))}
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="py-4 px-6 text-left text-gray-900 dark:text-white font-semibold">Student Details</th>
                <th className="py-4 px-6 text-left text-gray-900 dark:text-white font-semibold">Academic Info</th>
                <th className="py-4 px-6 text-left text-gray-900 dark:text-white font-semibold">Leave Status</th>
                <th className="py-4 px-6 text-left text-gray-900 dark:text-white font-semibold">Performance</th>
                <th className="py-4 px-6 text-left text-gray-900 dark:text-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                  {/* Student Details */}
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{student.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{student.usn}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">{student.email}</p>
                    </div>
                  </td>

                  {/* Academic Info */}
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{student.semester}th Semester</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{student.department}</p>
                    </div>
                  </td>

                  {/* Leave Status */}
                  <td className="py-4 px-6">
                    <div>
                      {student.leave_balance ? (
                        <div>
                          <div className="flex items-center mb-1">
                            <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${((student.leave_balance.total_leave_allowed - student.leave_balance.leave_remaining) / student.leave_balance.total_leave_allowed) * 100}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {student.leave_balance.leave_taken}/{student.leave_balance.total_leave_allowed}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {student.leave_balance.leave_remaining} days remaining
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-500">No data</p>
                      )}
                    </div>
                  </td>

                  {/* Performance */}
                  <td className="py-4 px-6">
                    <div>
                      <div className="flex items-center mb-1">
                        <span className="text-lg font-semibold text-orange-600 dark:text-orange-400 mr-2">
                          {student.cgpa || 'N/A'}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">CGPA</span>
                      </div>
                      <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${student.cgpa ? (student.cgpa / 10) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Current Semester</p>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <Link
                        href={`/hod/students/${student.id}`}
                        className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors inline-block"
                      >
                        View Details
                      </Link>
                      <button className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors">
                        Edit Marks
                      </button>
                      <button
                        onClick={() => openMessageModal(student)}
                        className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded text-sm hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                      >
                        Message
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{students.length}</p>
            <p className="text-sm text-blue-800 dark:text-blue-200">Total Students</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {students.filter(s => s.leave_balance && s.leave_balance.leave_remaining > 5).length}
            </p>
            <p className="text-sm text-green-800 dark:text-green-200">Good Leave Balance</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {students.filter(s => s.semester >= 5).length}
            </p>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">Senior Students</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {students.length > 0 ? (students.reduce((acc, s) => acc + (s.cgpa || 0), 0) / students.length).toFixed(2) : '0.00'}
            </p>
            <p className="text-sm text-purple-800 dark:text-purple-200">Average CGPA</p>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {messageModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Send Message to {selectedStudent.name}
                </h3>
                <button
                  onClick={closeMessageModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter message subject..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your message..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeMessageModal}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendMessage}
                  disabled={sendingMessage || !messageSubject.trim() || !messageContent.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}