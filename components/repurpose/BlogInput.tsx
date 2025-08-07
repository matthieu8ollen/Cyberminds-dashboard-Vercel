'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface BlogInputProps {
  onProcess: (data: string | { content: string; target_audience?: string; content_preferences?: string[]; user_role?: string }) => void
  isProcessing: boolean
  error?: string
}

export default function BlogInput({ onProcess, isProcessing, error }: BlogInputProps) {
  const { profile } = useAuth()
  const [content, setContent] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [contentPreferences, setContentPreferences] = useState<string[]>([])
  const [showTargetAudience, setShowTargetAudience] = useState(false)
  const [showContentPreferences, setShowContentPreferences] = useState(false)

  const handleSubmit = () => {
    if (content.trim().length >= 50) {
      const submissionData = {
        content: content.trim(),
        target_audience: targetAudience.trim() || undefined,
        content_preferences: contentPreferences.length > 0 ? contentPreferences : undefined,
        user_role: profile?.role || undefined
      }
      onProcess(submissionData)
    }
  }

  const canSubmit = content.trim().length >= 50 && !isProcessing

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-2">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Blog/Articles</h3>
        </div>
        <p className="text-gray-600 text-sm">
          Paste your blog content, articles, or written material to generate LinkedIn post ideas. 
          The AI will extract key insights and transform them into engaging LinkedIn content.
        </p>
      </div>

      {/* Input Area */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Article Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your blog article, case study, or written content here..."
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-vertical"
              disabled={isProcessing}
            />
          </div>

          {/* Target Audience & Content Preferences */}
          <div className="space-y-4 py-4 border-t border-gray-100">
            <div>
              <button
                type="button"
                onClick={() => setShowTargetAudience(!showTargetAudience)}
                className="flex items-center text-sm text-gray-700 hover:text-teal-600 transition-colors"
              >
                🎯 Target Audience: 
                {!showTargetAudience && (
                  <span className="ml-2 text-teal-600 font-medium">+ Add specific audience</span>
                )}
              </button>
              {showTargetAudience && (
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., SaaS founders, finance teams, startup CEOs..."
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowContentPreferences(!showContentPreferences)}
                className="flex items-center text-sm text-gray-700 hover:text-teal-600 transition-colors"
              >
                📝 Content Style:
                {!showContentPreferences && (
                  <span className="ml-2 text-teal-600 font-medium">+ Select content types</span>
                )}
              </button>
              {showContentPreferences && (
                <div className="mt-2 space-y-2">
                  {[
                    { value: 'viral_post', label: 'Viral Post', desc: 'Engaging, shareable content' },
                    { value: 'authority_post', label: 'Authority Post', desc: 'Thought leadership, expertise' },
                    { value: 'conversion_post', label: 'Conversion Post', desc: 'Lead generation, business growth' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={contentPreferences.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setContentPreferences([...contentPreferences, option.value])
                          } else {
                            setContentPreferences(contentPreferences.filter(p => p !== option.value))
                          }
                        }}
                        className="mt-0.5 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className={`${
              content.length >= 50 ? 'text-green-600' : 'text-gray-500'
            }`}>
              {content.length}/50 characters minimum
            </span>
            <span className="text-gray-400">
              {content.length > 0 ? `${Math.ceil(content.length / 5)} words approx.` : ''}
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="bg-teal-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <span>Generate Ideas</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Tips for better results:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Include complete thoughts and conclusions</li>
          <li>• Add any specific data points or statistics</li>
          <li>• Include your personal insights or opinions</li>
          <li>• Don't worry about formatting - just paste the content</li>
        </ul>
      </div>
    </div>
  )
}
