// Repurpose Content Backend Configuration

export const REPURPOSE_CONFIG = {
  // Main webhook URL for processing content
  WEBHOOK_URL: process.env.NEXT_PUBLIC_REPURPOSE_WEBHOOK_URL || 'https://testcyber.app.n8n.cloud/webhook/bf05add7-f1b0-483d-8765-2c0475005645',
  
  // Callback URL where our API receives responses
  CALLBACK_URL: process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/repurpose/callback`
    : 'http://localhost:3000/api/repurpose/callback',
  
  // Polling configuration
  POLLING: {
  MAX_ATTEMPTS: 80,      // 80 attempts = 120 seconds max wait (2 minutes)
  INTERVAL_MS: 1500,     // 1.5 seconds between polls
  FALLBACK_MESSAGE_AFTER: 40 // Show "taking longer" message after 1 minute
},
  
  // File upload limits
  FILE_LIMITS: {
    VOICE_MAX_SIZE: 25 * 1024 * 1024, // 25MB
    ACCEPTED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/mp3']
  },
  
  // Content type mappings
  CONTENT_TYPES: {
    blog: {
      name: 'Blog/Articles',
      description: 'Paste your blog content to generate LinkedIn ideas',
      min_chars: 50
    },
    voice: {
      name: 'Voice Notes', 
      description: 'Upload audio files to transform into content ideas',
      max_file_size: 25 * 1024 * 1024
    },
    youtube: {
      name: 'YouTube Videos',
      description: 'Extract ideas from YouTube video content',
      url_patterns: ['youtube.com', 'youtu.be']
    },
    linkedin: {
      name: 'LinkedIn Posts',
      description: 'Transform LinkedIn posts into new content formulas',
      url_patterns: ['linkedin.com']
    }
  }
}

// Helper functions for validation
export const validateYouTubeUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url.trim())
    return REPURPOSE_CONFIG.CONTENT_TYPES.youtube.url_patterns.some(pattern => 
      urlObj.hostname.includes(pattern)
    )
  } catch {
    return false
  }
}

export const validateLinkedInUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url.trim())
    return urlObj.hostname.includes('linkedin.com') && 
           (urlObj.pathname.includes('/posts/') || urlObj.pathname.includes('/feed/update/'))
  } catch {
    return false
  }
}

export const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
  const { ACCEPTED_AUDIO_TYPES, VOICE_MAX_SIZE } = REPURPOSE_CONFIG.FILE_LIMITS
  
  if (!ACCEPTED_AUDIO_TYPES.includes(file.type) && 
      !file.name.toLowerCase().match(/\.(mp3|wav|m4a|ogg)$/)) {
    return { valid: false, error: 'Please upload MP3, WAV, M4A, or OGG files only' }
  }

  if (file.size > VOICE_MAX_SIZE) {
    return { valid: false, error: 'File size must be less than 25MB' }
  }

  return { valid: true }
}

// Source badge mappings for UI
export const getSourceBadge = (type: string): string => {
  const badges: Record<string, string> = {
    'blog': '🔄 From Blog Article',
    'voice': '🎤 From Voice Note', 
    'youtube': '📺 From YouTube Video',
    'linkedin': '💼 From LinkedIn Post'
  }
  return badges[type] || '🔄 From Content'
}

// Environment check
export const isWebhookConfigured = (): boolean => {
  return REPURPOSE_CONFIG.WEBHOOK_URL !== 'PLACEHOLDER_WEBHOOK_URL_HERE'
}
