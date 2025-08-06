'use client'

import { useState } from 'react'
import { Youtube, Link, ExternalLink } from 'lucide-react'

interface YouTubeInputProps {
  onProcess: (url: string) => void
  isProcessing: boolean
  error?: string
}

export default function YouTubeInput({ onProcess, isProcessing, error }: YouTubeInputProps) {
  const [url, setUrl] = useState('')
  const [validatedUrl, setValidatedUrl] = useState<string | null>(null)

  const validateYouTubeUrl = (url: string): boolean => {
    if (!url.trim()) return false

    try {
      const urlObj = new URL(url.trim())
      return urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')
    } catch {
      return false
    }
  }

  const extractVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url)
      
      // youtube.com/watch?v=VIDEO_ID
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v')
      }
      
      // youtu.be/VIDEO_ID
      if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.slice(1)
      }
    } catch {
      return null
    }
    
    return null
  }

  const handleUrlChange = (value: string) => {
    setUrl(value)
    
    if (value.trim() && validateYouTubeUrl(value)) {
      setValidatedUrl(value.trim())
    } else {
      setValidatedUrl(null)
    }
  }

  const handleSubmit = () => {
    if (validatedUrl) {
      onProcess(validatedUrl)
    }
  }

  const canSubmit = validatedUrl !== null && !isProcessing

  const getVideoPreview = () => {
    if (!validatedUrl) return null
    
    const videoId = extractVideoId(validatedUrl)
    if (!videoId) return null

    return (
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-start space-x-4">
          <img 
            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
            alt="Video thumbnail"
            className="w-32 h-24 object-cover rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 mb-1">
              YouTube Video Detected
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Ready to extract content and generate LinkedIn ideas
            </p>
            <a
              href={validatedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-teal-600 hover:text-teal-700"
            >
              View on YouTube
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-2">
          <Youtube className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">YouTube Videos</h3>
        </div>
        <p className="text-gray-600 text-sm">
          Extract key insights from YouTube videos and transform them into LinkedIn content. 
          Works great with educational, business, or tutorial videos.
        </p>
      </div>

      {/* Input Area */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube URL
            </label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  url && !validatedUrl ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isProcessing}
              />
            </div>
            
            {url && !validatedUrl && (
              <p className="mt-2 text-sm text-red-600">
                Please enter a valid YouTube URL
              </p>
            )}
          </div>

          {/* Video Preview */}
          {getVideoPreview()}

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Submit Button */}
          {validatedUrl && (
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="bg-teal-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Video...</span>
                  </>
                ) : (
                  <span>Generate Ideas</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Supported URLs */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">📺 Supported URL formats:</h4>
        <ul className="text-sm text-blue-800 space-y-1 font-mono">
          <li>• https://youtube.com/watch?v=VIDEO_ID</li>
          <li>• https://youtu.be/VIDEO_ID</li>
          <li>• https://m.youtube.com/watch?v=VIDEO_ID</li>
        </ul>
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Best results with:</strong> Educational content, tutorials, presentations, 
            interviews, or business-focused videos.
          </p>
        </div>
      </div>
    </div>
  )
}
