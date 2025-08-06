'use client'

import { useState } from 'react'
import { Linkedin, Link, ExternalLink, Sparkles, BookOpen } from 'lucide-react'

interface LinkedInInputProps {
  onProcess: (url: string) => void
  isProcessing: boolean
  error?: string
}

export default function LinkedInInput({ onProcess, isProcessing, error }: LinkedInInputProps) {
  const [url, setUrl] = useState('')
  const [validatedUrl, setValidatedUrl] = useState<string | null>(null)

  const validateLinkedInUrl = (url: string): boolean => {
    if (!url.trim()) return false

    try {
      const urlObj = new URL(url.trim())
      return urlObj.hostname.includes('linkedin.com') && 
             (urlObj.pathname.includes('/posts/') || urlObj.pathname.includes('/feed/update/'))
    } catch {
      return false
    }
  }

  const handleUrlChange = (value: string) => {
    setUrl(value)
    
    if (value.trim() && validateLinkedInUrl(value)) {
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

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-2">
          <Linkedin className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">LinkedIn Posts</h3>
        </div>
        <p className="text-gray-600 text-sm">
          Transform successful LinkedIn posts into new content ideas and formula templates. 
          Perfect for repurposing high-performing content with fresh angles.
        </p>
      </div>

      {/* Input Area */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn Post URL
            </label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://linkedin.com/posts/username-post-id"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  url && !validatedUrl ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isProcessing}
              />
            </div>
            
            {url && !validatedUrl && (
              <p className="mt-2 text-sm text-red-600">
                Please enter a valid LinkedIn post URL
              </p>
            )}
          </div>

          {/* Validated URL Preview */}
          {validatedUrl && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Linkedin className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-1">
                    LinkedIn Post Ready for Analysis
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    This post will be analyzed to generate both new content ideas and reusable content formulas
                  </p>
                  <a
                    href={validatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Original Post
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* What You'll Get */}
          {validatedUrl && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h4 className="font-medium text-purple-900">Content Ideas</h4>
                </div>
                <p className="text-sm text-purple-800">
                  Fresh angles and perspectives based on the original post's structure and insights
                </p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <BookOpen className="w-4 h-4 text-green-600" />
                  <h4 className="font-medium text-green-900">Content Formulas</h4>
                </div>
                <p className="text-sm text-green-800">
                  Reusable templates based on the post's successful structure and format
                </p>
              </div>
            </div>
          )}

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
                    <span>Analyzing Post...</span>
                  </>
                ) : (
                  <span>Generate Ideas & Formulas</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">📋 How to get the LinkedIn post URL:</h4>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Find a LinkedIn post you want to repurpose</li>
          <li>2. Click the "..." menu on the post</li>
          <li>3. Select "Copy link to post"</li>
          <li>4. Paste the URL above</li>
        </ol>
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Works best with:</strong> Posts with clear structure, specific insights, 
            frameworks, or storytelling elements.
          </p>
        </div>
      </div>
    </div>
  )
}
