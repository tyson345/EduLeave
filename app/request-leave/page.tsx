'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RequestLeave() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    reason: '',
    explanation: '',
    attachment: null as File | null,
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for additional leave is required'
    } else if (formData.reason.trim().length < 5) {
      newErrors.reason = 'Reason must be at least 5 characters'
    }
    
    if (!formData.explanation.trim()) {
      newErrors.explanation = 'Detailed explanation is required'
    } else if (formData.explanation.trim().length < 20) {
      newErrors.explanation = 'Explanation must be at least 20 characters'
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
        // In a real application, you would get the student ID from authentication
        const studentId = 1 // Example student ID
        
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
          reason: formData.reason,
          explanation: formData.explanation,
          attachmentPath,
        }
        
        // Submit special leave request
        const response = await fetch('/api/request-leave', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        })
        
        const result = await response.json()
        
        if (result.success) {
          alert('Special leave request submitted successfully! The HOD will review your request.')
          router.push('/dashboard')
        } else {
          setSubmitError(result.error || 'Failed to submit special leave request')
        }
      } catch (err) {
        console.error('Error submitting special leave request:', err)
        setSubmitError('Failed to submit special leave request. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Request Additional Leave</h1>
            <p className="text-red-600 font-medium mt-2">No leave balance available</p>
          </div>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
        
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{submitError}</p>
          </div>
        )}
        
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                You have exhausted your allocated leave balance for this semester. 
                This form is for requesting special approval for additional leave.
              </p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reason */}
          <div>
            <label htmlFor="reason" className="block text-lg font-medium text-gray-700 mb-2">
              Reason for Additional Leave
            </label>
            <input
              type="text"
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-lg ${errors.reason ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., Medical emergency, Family crisis, etc."
            />
            {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
          </div>
          
          {/* Detailed Explanation */}
          <div>
            <label htmlFor="explanation" className="block text-lg font-medium text-gray-700 mb-2">
              Detailed Explanation
            </label>
            <textarea
              id="explanation"
              name="explanation"
              value={formData.explanation}
              onChange={handleInputChange}
              rows={6}
              className={`w-full p-3 border rounded-lg ${errors.explanation ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Please provide a detailed explanation of your circumstances and why you need additional leave beyond your allocated balance..."
            ></textarea>
            {errors.explanation && <p className="mt-1 text-sm text-red-600">{errors.explanation}</p>}
            <p className="mt-1 text-sm text-gray-500">
              Please be as detailed as possible. The HOD will review your request based on this information.
            </p>
          </div>
          
          {/* Attachment */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Supporting Document
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
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
            {errors.attachment && <p className="mt-1 text-sm text-red-600">{errors.attachment}</p>}
            {formData.attachment && (
              <p className="mt-2 text-sm text-gray-600">
                Selected file: {formData.attachment.name}
              </p>
            )}
          </div>
          
          {/* Important Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Special leave requests are reviewed on a case-by-case basis by the HOD. 
                    Approval is not guaranteed and depends on the merit of your request and 
                    supporting documentation.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting Request...
                </span>
              ) : (
                'Submit Special Leave Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}