// Utility functions for cookie management

export function clearAllAuthCookies() {
  // Clear all possible cookie variations
  const cookies = [
    'student_auth',
    'hod_auth'
  ]
  
  const domains = [
    window.location.hostname,
    '.localhost',
    'localhost'
  ]
  
  const paths = [
    '/',
    ''
  ]
  
  cookies.forEach(cookieName => {
    domains.forEach(domain => {
      paths.forEach(path => {
        // Clear with different combinations
        document.cookie = `${cookieName}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        document.cookie = `${cookieName}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${domain}`
        document.cookie = `${cookieName}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict`
        document.cookie = `${cookieName}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${domain}; secure; samesite=strict`
      })
    })
  })
  
  // Also try to clear using the same attributes as when setting
  document.cookie = 'student_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict'
  document.cookie = 'hod_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict'
  
  console.log('All auth cookies cleared')
}

export function checkAuthCookies() {
  const cookies = document.cookie.split(';')
  const authCookies = cookies.filter(cookie => 
    cookie.trim().startsWith('student_auth=') || 
    cookie.trim().startsWith('hod_auth=')
  )
  
  console.log('Current auth cookies:', authCookies)
  return authCookies
}

export function forceLogout() {
  clearAllAuthCookies()
  
  // Force a hard reload to ensure cookies are cleared
  setTimeout(() => {
    window.location.href = '/login'
  }, 100)
}

