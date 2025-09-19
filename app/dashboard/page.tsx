'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navigation } from '../../components/Navigation'
import { StatsCard } from '../../components/StatsCard'
import { PageHeader } from '../../components/PageHeader'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { ErrorMessage } from '../../components/ErrorMessage'
import { EmptyState } from '../../components/EmptyState'
import { useNotification } from '../../components/Notification'

// Define TypeScript interfaces
interface Student {
  id: number
  usn: string
  name: string
  email: string
  semester: number
  department: string
}

interface LeaveBalance {
  id: number
  student_id: number
  semester: number
  total_leave_allowed: number
  leave_taken: number
  leave_remaining: number
}

interface Message {
  id: number
  sender_id: number
  sender_type: string
  receiver_id: number
  receiver_type: string
  subject: string
  message: string
  is_read: boolean
  sent_at: string
  read_at: string | null
}

export default function StudentDashboard() {
  const { showNotification } = useNotification()
  const [student, setStudent] = useState<Student | null>(null)
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [messageModalOpen, setMessageModalOpen] = useState(false)

  // Fetch student data, leave balance, and messages
  useEffect(() => {
    const fetchStudentData = async () => {
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

        // Fetch student data
        const studentResponse = await fetch(`/api/student?usn=${usn}`)
        const studentResult = await studentResponse.json()

        if (studentResult.success) {
          setStudent(studentResult.data.student)
          setLeaveBalance(studentResult.data.leaveBalance)

          // Fetch messages for this student
          const messagesResponse = await fetch(`/api/messages?studentId=${studentResult.data.student.id}`)
          const messagesResult = await messagesResponse.json()

          if (messagesResult.success) {
            setMessages(messagesResult.data)
            // Only show notification if there are new unread messages
            const unreadCount = messagesResult.data.filter((msg: any) => !msg.is_read).length
            if (unreadCount > 0) {
              showNotification({
                type: 'info',
                title: 'New Messages',
                message: `You have ${unreadCount} new message${unreadCount > 1 ? 's' : ''} from HOD`
              })
            }
          }
        } else {
          setError(studentResult.error || 'Failed to fetch student data')
        }
      } catch (err: any) {
        setError(`Failed to fetch student data: ${err.message || err}`)
        console.error('Error fetching student data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [])

  // Open message modal
  const openMessageModal = async (message: Message) => {
    setSelectedMessage(message)
    setMessageModalOpen(true)

    // Mark message as read if it's not already read
    if (!message.is_read) {
      try {
        const response = await fetch('/api/messages/read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messageId: message.id }),
        })

        if (response.ok) {
          // Update the message in the local state
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.id === message.id ? { ...msg, is_read: true } : msg
            )
          )
        }
      } catch (error) {
        console.error('Error marking message as read:', error)
      }
    }
  }

  // Close message modal
  const closeMessageModal = () => {
    setMessageModalOpen(false)
    setSelectedMessage(null)
  }

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
      <Navigation 
        userType="student" 
        userName={student?.name} 
        userIdentifier={student?.usn} 
      />
      
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header Section */}
          <PageHeader
            title="Student Dashboard"
            subtitle={`Welcome back, ${student?.name}! Here's your academic overview for Semester ${student?.semester}`}
            actions={
              <>
                {leaveBalance && leaveBalance.leave_remaining > 0 ? (
                  <Link
                    href="/apply-leave"
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-center shadow-md hover:shadow-lg"
                  >
                    Apply for Leave
                  </Link>
                ) : (
                  <Link
                    href="/request-leave"
                    className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-center shadow-md hover:shadow-lg"
                  >
                    Request Leave
                  </Link>
                )}
                <Link
                  href="/leave-history"
                  className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-center shadow-md hover:shadow-lg"
                >
                  Leave History
                </Link>
              </>
            }
          />

        {/* Quick Stats */}
        {student && leaveBalance && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard
              title="Profile"
              value={student?.name || ''}
              subtitle={student?.usn}
              color="blue"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
            <StatsCard
              title="Leave Balance"
              value={`${leaveBalance?.leave_remaining} days`}
              subtitle={`Used: ${leaveBalance?.leave_taken}`}
              color="green"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatsCard
              title="Semester"
              value={`${student?.semester}th`}
              subtitle={student?.department}
              color="purple"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
            />
            <StatsCard
              title="Status"
              value="Active"
              color="yellow"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Timetable Section */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Today's Timetable - {student?.name}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">Semester {student?.semester}</span>
            </div>
            <div className="space-y-3">
              {[
                { time: '9:00 AM', subject: 'Data Structures & Algorithms', room: 'CS-101', status: 'current' },
                { time: '10:00 AM', subject: 'Database Management', room: 'CS-102', status: 'upcoming' },
                { time: '11:00 AM', subject: 'Web Technologies', room: 'CS-103', status: 'upcoming' },
                { time: '2:00 PM', subject: 'Software Engineering', room: 'CS-104', status: 'upcoming' },
              ].map((class_, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                  class_.status === 'current'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${class_.status === 'current' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{class_.subject}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{class_.time} • {class_.room}</p>
                    </div>
                  </div>
                  {class_.status === 'current' && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Attendance - {student?.name}
            </h2>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">87%</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Semester {student?.semester} Attendance</p>
              </div>
              <div className="space-y-2">
                {[
                  { subject: 'Data Structures & Algorithms', attendance: '92%' },
                  { subject: 'Database Management', attendance: '85%' },
                  { subject: 'Web Technologies', attendance: '90%' },
                  { subject: 'Software Engineering', attendance: '82%' },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.subject}</span>
                    <span className={`text-sm font-semibold ${
                      parseInt(item.attendance) >= 85 ? 'text-green-600 dark:text-green-400' :
                      parseInt(item.attendance) >= 75 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {item.attendance}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Courses and Marks Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Current Courses */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Semester {student?.semester} Courses - {student?.department}
            </h2>
            <div className="space-y-4">
              {[
                { code: `CS${student?.semester}01`, name: 'Data Structures & Algorithms', credits: 4, instructor: 'Dr. Smith' },
                { code: `CS${student?.semester}02`, name: 'Database Management', credits: 3, instructor: 'Prof. Johnson' },
                { code: `CS${student?.semester}03`, name: 'Web Technologies', credits: 3, instructor: 'Dr. Davis' },
                { code: `CS${student?.semester}04`, name: 'Software Engineering', credits: 3, instructor: 'Prof. Wilson' },
              ].map((course, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{course.code}: {course.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{course.instructor} • {course.credits} credits</p>
                  </div>
                  <div className="text-right">
                    <div className="w-12 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                      <div className="w-8 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">75%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Semester Marks */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Semester {student?.semester} Performance - {student?.name}
            </h2>
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">8.4</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current SGPA - {student?.usn}</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '84%' }}></div>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { subject: 'Data Structures & Algorithms', marks: '85/100', grade: 'A' },
                  { subject: 'Database Management', marks: '78/100', grade: 'B+' },
                  { subject: 'Web Technologies', marks: '92/100', grade: 'A+' },
                  { subject: 'Software Engineering', marks: '88/100', grade: 'A' },
                ].map((mark, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{mark.subject}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{mark.marks}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      mark.grade === 'A+' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                      mark.grade === 'A' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                      'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {mark.grade}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Messages from HOD */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Messages from HOD - {student?.name}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {messages.filter(m => !m.is_read).length} unread
            </span>
          </div>

          {messages.length === 0 ? (
            <EmptyState
              icon={
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
              title="No messages yet"
              description="Messages from your HOD will appear here"
            />
          ) : (
            <div className="space-y-4">
              {messages.slice(0, 5).map((message) => (
                <div
                  key={message.id}
                  onClick={() => openMessageModal(message)}
                  className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
                    message.is_read
                      ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {message.subject}
                        </h4>
                        {!message.is_read && (
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                        {message.message.length > 100 ? `${message.message.substring(0, 100)}...` : message.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(message.sent_at).toLocaleDateString()} at {new Date(message.sent_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="ml-4">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}

              {messages.length > 5 && (
                <div className="text-center pt-4">
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
                    View all {messages.length} messages →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/apply-leave" className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Apply Leave</span>
            </Link>

            <Link href="/leave-history" className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Leave History</span>
            </Link>

            <div className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200 cursor-pointer">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Timetable</span>
            </div>

            <div className="flex flex-col items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors duration-200 cursor-pointer">
              <svg className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Results</span>
            </div>
          </div>
        </div>

        {/* Department Policy */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Department Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Leave Policy</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Maximum 10 days leave per semester</li>
                <li>• Half-day leave available</li>
                <li>• 24-hour advance notice required</li>
                <li>• Medical certificates mandatory</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Academic Rules</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• 85% attendance mandatory</li>
                <li>• Minimum 7.0 SGPA required</li>
                <li>• Regular assessment submissions</li>
                <li>• Code of conduct compliance</li>
              </ul>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Message Modal - Always rendered at root level */}
      {messageModalOpen && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedMessage.subject}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>From: HOD</span>
                    <span>•</span>
                    <span>{new Date(selectedMessage.sent_at).toLocaleDateString()}</span>
                    <span>at</span>
                    <span>{new Date(selectedMessage.sent_at).toLocaleTimeString()}</span>
                  </div>
                </div>
                <button
                  onClick={closeMessageModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-4"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={closeMessageModal}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}