import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import React from 'react'
import ThemeToggle from '../components/ThemeToggle'
import { NotificationProvider } from '../components/Notification'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EduLeave',
  description: 'Leave application system for educational institutions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NotificationProvider>
          <ThemeToggle />
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <main className="container mx-auto p-4">
              {children}
            </main>
            <footer className="bg-gray-200 dark:bg-gray-800 p-4 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>© {new Date().getFullYear()} EduLeave. All rights reserved.</p>
            </footer>
          </div>
        </NotificationProvider>
      </body>
    </html>
  )
}