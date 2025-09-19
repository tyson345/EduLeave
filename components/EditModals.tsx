'use client'

import { useState } from 'react'
import { useNotification } from './Notification'

interface EditCGPAModalProps {
  isOpen: boolean
  onClose: () => void
  studentId: number
  currentCGPA: number
  studentName: string
  onUpdate: () => void
}

export function EditCGPAModal({ isOpen, onClose, studentId, currentCGPA, studentName, onUpdate }: EditCGPAModalProps) {
  const { showNotification } = useNotification()
  const [cgpa, setCgpa] = useState(currentCGPA.toString())
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const cgpaValue = parseFloat(cgpa)
    if (isNaN(cgpaValue) || cgpaValue < 0 || cgpaValue > 10) {
      showNotification({
        type: 'error',
        title: 'Invalid CGPA',
        message: 'CGPA must be between 0 and 10'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/students/${studentId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'cgpa', value: cgpaValue })
      })

      const result = await response.json()
      
      if (result.success) {
        showNotification({
          type: 'success',
          title: 'CGPA Updated',
          message: `${studentName}'s CGPA has been updated successfully!`
        })
        onUpdate()
        onClose()
      } else {
        showNotification({
          type: 'error',
          title: 'Update Failed',
          message: result.error || 'Failed to update CGPA'
        })
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Update Error',
        message: 'Failed to update CGPA. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Edit CGPA - {studentName}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current CGPA: {currentCGPA}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={cgpa}
              onChange={(e) => setCgpa(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter new CGPA"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Updating...' : 'Update CGPA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface EditAttendanceModalProps {
  isOpen: boolean
  onClose: () => void
  studentId: number
  semester: number
  studentName: string
  currentAttendance: { total_classes: number; attended_classes: number; percentage: number }
  onUpdate: () => void
}

export function EditAttendanceModal({ isOpen, onClose, studentId, semester, studentName, currentAttendance, onUpdate }: EditAttendanceModalProps) {
  const { showNotification } = useNotification()
  const [totalClasses, setTotalClasses] = useState(currentAttendance.total_classes.toString())
  const [attendedClasses, setAttendedClasses] = useState(currentAttendance.attended_classes.toString())
  const [loading, setLoading] = useState(false)

  const attendancePercentage = totalClasses && attendedClasses ? 
    ((parseInt(attendedClasses) / parseInt(totalClasses)) * 100).toFixed(1) : '0'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const total = parseInt(totalClasses)
    const attended = parseInt(attendedClasses)
    
    if (isNaN(total) || isNaN(attended) || total < 0 || attended < 0 || attended > total) {
      showNotification({
        type: 'error',
        title: 'Invalid Attendance',
        message: 'Attended classes cannot exceed total classes'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/students/${studentId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          field: 'attendance', 
          semester,
          value: { total_classes: total, attended_classes: attended }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        showNotification({
          type: 'success',
          title: 'Attendance Updated',
          message: `${studentName}'s attendance has been updated successfully!`
        })
        onUpdate()
        onClose()
      } else {
        showNotification({
          type: 'error',
          title: 'Update Failed',
          message: result.error || 'Failed to update attendance'
        })
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Update Error',
        message: 'Failed to update attendance. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Edit Attendance - {studentName} (Semester {semester})
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Classes
            </label>
            <input
              type="number"
              min="0"
              value={totalClasses}
              onChange={(e) => setTotalClasses(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Attended Classes
            </label>
            <input
              type="number"
              min="0"
              max={totalClasses || undefined}
              value={attendedClasses}
              onChange={(e) => setAttendedClasses(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Attendance Percentage:</strong> {attendancePercentage}%
            </p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Updating...' : 'Update Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface EditMarksModalProps {
  isOpen: boolean
  onClose: () => void
  studentId: number
  semester: number
  studentName: string
  subject: string
  currentMarks?: { marks: number; total: number }
  onUpdate: () => void
}

export function EditMarksModal({ isOpen, onClose, studentId, semester, studentName, subject, currentMarks, onUpdate }: EditMarksModalProps) {
  const { showNotification } = useNotification()
  const [marks, setMarks] = useState(currentMarks?.marks?.toString() || '0')
  const [total, setTotal] = useState(currentMarks?.total?.toString() || '100')
  const [loading, setLoading] = useState(false)

  const grade = marks && total ? 
    (parseInt(marks) >= 90 ? 'A+' : 
     parseInt(marks) >= 80 ? 'A' : 
     parseInt(marks) >= 70 ? 'B+' : 
     parseInt(marks) >= 60 ? 'B' : 
     parseInt(marks) >= 50 ? 'C' : 'F') : 'F'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const marksValue = parseInt(marks)
    const totalValue = parseInt(total)
    
    if (isNaN(marksValue) || isNaN(totalValue) || marksValue < 0 || totalValue < 0 || marksValue > totalValue) {
      showNotification({
        type: 'error',
        title: 'Invalid Marks',
        message: 'Marks cannot exceed total marks'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/students/${studentId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          field: 'marks', 
          semester,
          value: { subject, marks: marksValue, total: totalValue }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        showNotification({
          type: 'success',
          title: 'Marks Updated',
          message: `${studentName}'s ${subject} marks have been updated successfully!`
        })
        onUpdate()
        onClose()
      } else {
        showNotification({
          type: 'error',
          title: 'Update Failed',
          message: result.error || 'Failed to update marks'
        })
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Update Error',
        message: 'Failed to update marks. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Edit Marks - {studentName} (Semester {semester})
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Subject:</strong> {subject}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Marks
            </label>
            <input
              type="number"
              min="0"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Marks Obtained
            </label>
            <input
              type="number"
              min="0"
              max={total || undefined}
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Grade:</strong> {grade}
            </p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Updating...' : 'Update Marks'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface EditLeaveBalanceModalProps {
  isOpen: boolean
  onClose: () => void
  studentId: number
  semester: number
  studentName: string
  currentBalance: { total_leave_allowed: number; leave_taken: number; leave_remaining: number }
  onUpdate: () => void
}

export function EditLeaveBalanceModal({ isOpen, onClose, studentId, semester, studentName, currentBalance, onUpdate }: EditLeaveBalanceModalProps) {
  const { showNotification } = useNotification()
  const [totalAllowed, setTotalAllowed] = useState(currentBalance.total_leave_allowed.toString())
  const [leaveTaken, setLeaveTaken] = useState(currentBalance.leave_taken.toString())
  const [loading, setLoading] = useState(false)

  const leaveRemaining = totalAllowed && leaveTaken ? 
    parseInt(totalAllowed) - parseInt(leaveTaken) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const total = parseInt(totalAllowed)
    const taken = parseInt(leaveTaken)
    
    if (isNaN(total) || isNaN(taken) || total < 0 || taken < 0 || taken > total) {
      showNotification({
        type: 'error',
        title: 'Invalid Leave Balance',
        message: 'Leave taken cannot exceed total leave allowed'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/students/${studentId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          field: 'leave_balance', 
          semester,
          value: { total_leave_allowed: total, leave_taken: taken }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        showNotification({
          type: 'success',
          title: 'Leave Balance Updated',
          message: `${studentName}'s leave balance has been updated successfully!`
        })
        onUpdate()
        onClose()
      } else {
        showNotification({
          type: 'error',
          title: 'Update Failed',
          message: result.error || 'Failed to update leave balance'
        })
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Update Error',
        message: 'Failed to update leave balance. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Edit Leave Balance - {studentName} (Semester {semester})
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Leave Allowed
            </label>
            <input
              type="number"
              min="0"
              value={totalAllowed}
              onChange={(e) => setTotalAllowed(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Leave Taken
            </label>
            <input
              type="number"
              min="0"
              max={totalAllowed || undefined}
              value={leaveTaken}
              onChange={(e) => setLeaveTaken(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Leave Remaining:</strong> {leaveRemaining} days
            </p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Updating...' : 'Update Leave Balance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
