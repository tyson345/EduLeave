'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ApplyLeave() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    leaveType: 'full',
    startDate: '',
    endDate: '',
    reason: '',
    attachment: null as File | null,
    halfDaySession: 'morning'
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        attachment: e.target.files[0]
      })
    }
  }
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }
    
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required'
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters'
    }
    
    if (!formData.attachment) {
      newErrors.attachment = 'Please upload a supporting document'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (result.success) {
        return result.filePath
      } else {
        throw new Error(result.error || 'Failed to upload file')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      return null
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      setIsSubmitting(true)
      setSubmitError(null)
      
      try {
        // Get student ID from localStorage (set during login)
        const usn = localStorage.getItem('student_usn')

        if (!usn) {
          alert('Please login to submit leave application')
          router.push('/login')
          return
        }

        // Get student data to get the ID
        const studentResponse = await fetch(`/api/student?usn=${usn}`)
        const studentResult = await studentResponse.json()

        if (!studentResult.success) {
          throw new Error('Failed to get student information')
        }

        const studentId = studentResult.data.student.id
        const semester = studentResult.data.student.semester

        // Upload attachment if provided
        let attachmentPath: string | null = null
        if (formData.attachment) {
          attachmentPath = await uploadFile(formData.attachment)
          if (!attachmentPath) {
            throw new Error('Failed to upload attachment')
          }
        }

        // Prepare form data for submission
        const submitData = {
          studentId,
          leaveType: formData.leaveType,
          startDate: formData.startDate,
          endDate: formData.leaveType === 'full' ? formData.endDate : formData.startDate,
          reason: formData.reason,
          attachmentPath,
          halfDaySession: formData.leaveType === 'half' ? formData.halfDaySession : undefined,
          semester
        }
        
        // Submit leave application
        const response = await fetch('/api/apply-leave', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        })
        
        const result = await response.json()
        
        if (result.success) {
          alert('Leave application submitted successfully!')
          router.push('/dashboard')
        } else {
          setSubmitError(result.error || 'Failed to submit leave application')
        }
      } catch (err) {
        console.error('Error submitting leave application:', err)
        setSubmitError('Failed to submit leave application. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Apply for Leave</h1>
          <Link
            href="/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
        
        {submitError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Leave Type */}
          <div>
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Leave Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800">
                <input
                  type="radio"
                  name="leaveType"
                  value="full"
                  checked={formData.leaveType === 'full'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-3 text-gray-700 dark:text-gray-300">Full Day Leave</span>
              </label>

              <label className="flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800">
                <input
                  type="radio"
                  name="leaveType"
                  value="half"
                  checked={formData.leaveType === 'half'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-3 text-gray-700 dark:text-gray-300">Half Day Leave</span>
              </label>
            </div>
          </div>
          
          {/* Date Selection */}
          <div>
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              {formData.leaveType === 'half' ? 'Date' : 'Leave Dates'}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                {errors.startDate && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate}</p>}
              </div>

              {formData.leaveType === 'full' && (
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}
            </div>
            
            {formData.leaveType === 'half' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Half Day Session
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800">
                    <input
                      type="radio"
                      name="halfDaySession"
                      value="morning"
                      checked={formData.halfDaySession === 'morning'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-3 text-gray-700 dark:text-gray-300">Morning (9:00 AM - 1:00 PM)</span>
                  </label>

                  <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800">
                    <input
                      type="radio"
                      name="halfDaySession"
                      value="afternoon"
                      checked={formData.halfDaySession === 'afternoon'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-3 text-gray-700 dark:text-gray-300">Afternoon (1:00 PM - 5:00 PM)</span>
                  </label>
                </div>
              </div>
            )}
          </div>
          
          {/* Reason */}
          <div>
            <label htmlFor="reason" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Leave
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows={4}
              className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.reason ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              placeholder="Please provide a detailed reason for your leave application..."
            ></textarea>
            {errors.reason && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.reason}</p>}
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Supporting Document
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF, DOC, DOCX (MAX. 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  name="attachment"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                />
              </label>
            </div>
            {errors.attachment && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.attachment}</p>}
            {formData.attachment && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected file: {formData.attachment.name}
              </p>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Leave Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}