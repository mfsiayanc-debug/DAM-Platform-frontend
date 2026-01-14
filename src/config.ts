// API Configuration
export const config = {
  // API base URL - can be overridden via environment variable
  apiBaseUrl: typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
    ? import.meta.env.VITE_API_URL 
    : 'http://localhost:3001/api',
  
  // Upload settings
  upload: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 10,
    allowedTypes: {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/mpeg', 'video/quicktime'],
      document: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
    }
  },
  
  // Polling settings for asset processing
  polling: {
    interval: 1000, // 1 second
    maxAttempts: 60, // 60 seconds total
  },
  
  // UI settings
  ui: {
    jobRemovalDelay: 3000, // Remove completed jobs after 3 seconds
    failedJobRemovalDelay: 5000, // Remove failed jobs after 5 seconds
  }
};