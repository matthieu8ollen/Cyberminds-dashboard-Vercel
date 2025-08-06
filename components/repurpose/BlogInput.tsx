'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'

interface BlogInputProps {
  onProcess: (content: string) => void
  isProcessing: boolean
  error?: string
}

export default function BlogInput({ onProcess, isProcessing, error }: BlogInputProps) {
  const [content, setContent] = useState('')

  const handleSubmit = () => {
    if (content.trim().length >= 50) {
      onProcess(content.trim())
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
