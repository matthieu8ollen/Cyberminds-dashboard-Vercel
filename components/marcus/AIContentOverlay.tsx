'use client'

import { X, Sparkles, BarChart3, Eye, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface AIContentOverlayProps {
  isVisible: boolean
  onClose: () => void
  onApprove?: () => void
  onTryDifferent?: () => void
  contentData?: {
    guidance?: any
    generatedContent?: {
      generated_content?: {
        complete_post?: string
        post_analytics?: {
          word_count?: string
          character_count?: string
          paragraph_count?: string
          numbered_lists?: string
          has_hook?: string
          ends_with_cta?: string
          contains_metrics?: string
        }
      }
      validation_score?: string
      total_variables_filled?: string
    }
  } | null
  mode?: 'preview' | 'reference'
}

export default function AIContentOverlay({ 
  isVisible, 
  onClose, 
  onApprove,
  onTryDifferent,
  contentData,
  mode = 'preview'
}: AIContentOverlayProps) {
  const [copied, setCopied] = useState(false)

  if (!isVisible) return null

  const generatedPost = contentData?.generatedContent?.generated_content?.complete_post
  const analytics = contentData?.generatedContent?.generated_content?.post_analytics
  const validationScore = contentData?.generatedContent?.validation_score

  const handleCopy = async () => {
    if (generatedPost) {
      await navigator.clipboard.writeText(generatedPost)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-teal-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {mode === 'preview' ? 'AI Generated Content Preview' : 'AI Content Reference'}
              </h3>
              <p className="text-sm text-gray-600">
                {mode === 'preview' 
                  ? 'Review the generated content before proceeding' 
                  : 'Generated content for reference while writing'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {generatedPost ? (
            <div className="p-6">
              {/* Analytics Bar */}
              <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">{analytics?.word_count || '0'}</div>
                  <div className="text-xs text-gray-500">Words</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analytics?.paragraph_count || '0'}</div>
                  <div className="text-xs text-gray-500">Paragraphs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {validationScore ? `${Math.round(parseFloat(validationScore) * 100)}%` : '0%'}
                  </div>
                  <div className="text-xs text-gray-500">Quality Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{contentData?.generatedContent?.total_variables_filled || '0'}</div>
                  <div className="text-xs text-gray-500">Variables Filled</div>
                </div>
              </div>

              {/* Generated Content */}
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Generated LinkedIn Post</h4>
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="prose max-w-none">
                    <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                      {generatedPost}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quality Indicators */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${analytics?.has_hook === 'true' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm font-medium text-gray-700">Strong Hook</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${analytics?.ends_with_cta === 'true' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm font-medium text-gray-700">Call to Action</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${analytics?.contains_metrics === 'true' ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm font-medium text-gray-700">Data/Metrics</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${analytics?.numbered_lists === 'true' ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm font-medium text-gray-700">Structured Format</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No AI Content Available</h4>
                <p className="text-gray-600">AI content will appear here once generated.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {mode === 'preview' && generatedPost && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Ready to use this content formula and start customizing?
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onTryDifferent}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Try Different Formula
                </button>
                <button
                  onClick={onApprove}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  Use This Formula
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'reference' && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-center text-sm text-gray-600">
              Keep this reference open while writing your customized version
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
