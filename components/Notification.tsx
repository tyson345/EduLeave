'use client'

import { useState, useEffect } from 'react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

interface NotificationProps {
  notification: Notification
  onClose: (id: string) => void
}

export function NotificationComponent({ notification, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(notification.id), 300) // Wait for animation to complete
    }, notification.duration || 5000)

    return () => clearTimeout(timer)
  }, [notification.id, notification.duration, onClose])

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return (
          <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-6 h-6 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case 'info':
        return (
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const getStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-800 border-green-300 dark:border-green-600'
      case 'error':
        return 'bg-red-100 dark:bg-red-800 border-red-300 dark:border-red-600'
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-800 border-yellow-300 dark:border-yellow-600'
      case 'info':
        return 'bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-600'
    }
  }

  return (
    <div
      className={`fixed top-20 right-4 z-[9999] max-w-sm w-full transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${getStyles()} border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${
              notification.type === 'success' ? 'text-green-800 dark:text-green-100' :
              notification.type === 'error' ? 'text-red-800 dark:text-red-100' :
              notification.type === 'warning' ? 'text-yellow-800 dark:text-yellow-100' :
              'text-blue-800 dark:text-blue-100'
            }`}>
              {notification.title}
            </p>
            <p className={`mt-1 text-sm ${
              notification.type === 'success' ? 'text-green-700 dark:text-green-200' :
              notification.type === 'error' ? 'text-red-700 dark:text-red-200' :
              notification.type === 'warning' ? 'text-yellow-700 dark:text-yellow-200' :
              'text-blue-700 dark:text-blue-200'
            }`}>
              {notification.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => {
                setIsVisible(false)
                setTimeout(() => onClose(notification.id), 300)
              }}
              className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Notification Context and Hook
import { createContext, useContext, useCallback } from 'react'

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { ...notification, id }])
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed top-20 right-4 z-[9999] space-y-2">
        {notifications.map(notification => (
          <NotificationComponent
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}
