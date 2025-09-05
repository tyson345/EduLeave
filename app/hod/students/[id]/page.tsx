'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

interface AttendanceData {
  semester: number
  total_classes: number
  attended_classes: number
  percentage: number
}

interface SemesterMarks {
  semester: number
  subjects: {
    name: string
    marks: number
    total: number
    grade: string
  }[]
  sgpa: number
}

interface LeaveApplication {
  id: number
  leave_type: string
  start_date: string
  end_date: string | null
  status: string
  reason: string
}

interface StudentDetails extends Student {
  leave_balance: LeaveBalance | null
  attendance: AttendanceData[]
  semester_marks: SemesterMarks[]
  leave_history: LeaveApplication[]
}

export default function StudentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<StudentDetails | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'marks' | 'leaves'>('overview')

  // Check if HOD is authenticated
  useEffect(() => {
    const eid = localStorage.getItem('hod_eid')
    if (!eid) {
      router.push('/login')
      return
    }
  }, [router])

  // Fetch student details
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await fetch(`/api/students/${params.id}`)
        const result = await response.json()

        if (result.success) {
          setStudent(result.data)
        } else {
          setError(result.error || 'Failed to fetch student details')
        }
      } catch (err: any) {
        setError('Failed to fetch student details')
        console.error('Error fetching student details:', err)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchStudentDetails()
    }
  }, [params.id])

  // Calculate leave statistics for pie chart
  const getLeaveStats = () => {
    if (!student?.leave_balance) return { taken: 0, remaining: 0, total: 0 }

    const taken = student.leave_balance.leave_taken
    const remaining = student.leave_balance.leave_remaining
    const total = student.leave_balance.total_leave_allowed

    return { taken, remaining, total }
  }

  // Calculate attendance statistics
  const getAttendanceStats = () => {
    if (!student?.attendance || student.attendance.length === 0) {
      return { average: 0, totalClasses: 0, totalAttended: 0 }
    }

    const totalClasses = student.attendance.reduce((sum, sem) => sum + sem.total_classes, 0)
    const totalAttended = student.attendance.reduce((sum, sem) => sum + sem.attended_classes, 0)
    const average = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0

    return { average, totalClasses, totalAttended }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Error</h2>
          <p className="text-red-600 dark:text-red-400">{error || 'Student not found'}</p>
          <Link
            href="/hod/students"
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
          >
            Back to Students List
          </Link>
        </div>
      </div>
    )
  }

  const leaveStats = getLeaveStats()
  const attendanceStats = getAttendanceStats()

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-4 mb-2">
              <Link
                href="/hod/students"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                ← Back to Students
              </Link>
              <span className="text-gray-400 dark:text-gray-500">|</span>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{student.name}</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{student.usn} • {student.semester}th Semester</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'attendance'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => setActiveTab('marks')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'marks'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Marks
            </button>
            <button
              onClick={() => setActiveTab('leaves')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'leaves'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Leaves
            </button>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Student Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                <span className="font-medium text-gray-900 dark:text-white">{student.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">USN:</span>
                <span className="font-medium text-gray-900 dark:text-white">{student.usn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                <span className="font-medium text-gray-900 dark:text-white">{student.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Semester:</span>
                <span className="font-medium text-gray-900 dark:text-white">{student.semester}th</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Department:</span>
                <span className="font-medium text-gray-900 dark:text-white">{student.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">CGPA:</span>
                <span className="font-medium text-orange-600 dark:text-orange-400">{student.cgpa}</span>
              </div>
            </div>
          </div>

          {/* Leave Statistics Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Leave Statistics</h2>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  {/* Taken leave arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="8"
                    strokeDasharray={`${(leaveStats.taken / leaveStats.total) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                  {/* Remaining leave arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeDasharray={`${(leaveStats.remaining / leaveStats.total) * 251.2} 251.2`}
                    strokeDashoffset={`-${(leaveStats.taken / leaveStats.total) * 251.2}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{leaveStats.remaining}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">days left</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Taken: {leaveStats.taken}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Remaining: {leaveStats.remaining}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Attendance Overview</h2>

          {/* Attendance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{attendanceStats.average.toFixed(1)}%</p>
              <p className="text-sm text-blue-800 dark:text-blue-200">Overall Attendance</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{attendanceStats.totalAttended}</p>
              <p className="text-sm text-green-800 dark:text-green-200">Classes Attended</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{attendanceStats.totalClasses}</p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">Total Classes</p>
            </div>
          </div>

          {/* Semester-wise Attendance */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-6 text-left text-gray-900 dark:text-white font-semibold">Semester</th>
                  <th className="py-3 px-6 text-left text-gray-900 dark:text-white font-semibold">Total Classes</th>
                  <th className="py-3 px-6 text-left text-gray-900 dark:text-white font-semibold">Attended</th>
                  <th className="py-3 px-6 text-left text-gray-900 dark:text-white font-semibold">Percentage</th>
                  <th className="py-3 px-6 text-left text-gray-900 dark:text-white font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {student.attendance?.map((sem) => (
                  <tr key={sem.semester} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-6 text-gray-900 dark:text-white">{sem.semester}th Semester</td>
                    <td className="py-3 px-6 text-gray-900 dark:text-white">{sem.total_classes}</td>
                    <td className="py-3 px-6 text-gray-900 dark:text-white">{sem.attended_classes}</td>
                    <td className="py-3 px-6">
                      <span className={`font-medium ${sem.percentage >= 75 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {sem.percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sem.percentage >= 75
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {sem.percentage >= 75 ? 'Good' : 'Low'}
                      </span>
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={5} className="py-8 px-6 text-center text-gray-500 dark:text-gray-400">
                      No attendance data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'marks' && (
        <div className="space-y-6">
          {student.semester_marks?.map((semester) => (
            <div key={semester.semester} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{semester.semester}th Semester Performance</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject-wise marks */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Subject Marks</h4>
                  <div className="space-y-3">
                    {semester.subjects.map((subject, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{subject.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{subject.marks}/{subject.total}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-blue-600 dark:text-blue-400">{subject.grade}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {((subject.marks / subject.total) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SGPA Visualization */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Semester GPA</h4>
                  <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="8"
                          strokeDasharray={`${(semester.sgpa / 10) * 251.2} 251.2`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{semester.sgpa}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">SGPA</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )) || (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-500 dark:text-gray-400">No marks data available</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Leave History</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-6 text-left text-gray-900 dark:text-white font-semibold">Type</th>
                  <th className="py-3 px-6 text-left text-gray-900 dark:text-white font-semibold">Dates</th>
                  <th className="py-3 px-6 text-left text-gray-900 dark:text-white font-semibold">Status</th>
                  <th className="py-3 px-6 text-left text-gray-900 dark:text-white font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody>
                {student.leave_history?.map((leave) => (
                  <tr key={leave.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        leave.leave_type === 'full'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {leave.leave_type === 'full' ? 'Full Day' : 'Half Day'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-gray-900 dark:text-white">
                      {leave.start_date}
                      {leave.end_date && leave.start_date !== leave.end_date && ` to ${leave.end_date}`}
                    </td>
                    <td className="py-3 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        leave.status === 'approved'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : leave.status === 'rejected'
                          ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-gray-900 dark:text-white max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={4} className="py-8 px-6 text-center text-gray-500 dark:text-gray-400">
                      No leave history available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}