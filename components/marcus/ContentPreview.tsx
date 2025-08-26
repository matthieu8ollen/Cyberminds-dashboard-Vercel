'use client'

import { ArrowLeft, Edit3 } from 'lucide-react'

interface ContentPreviewProps {
  assembledContent: string
  onBackToWriting: () => void
  onSaveAndExit: () => void
  onContinueToImages: () => void
  inStrictWorkflow?: boolean
}

export default function ContentPreview({
  assembledContent,
  onBackToWriting,
  onSaveAndExit,
  onContinueToImages,
  inStrictWorkflow = false
}: ContentPreviewProps) {
  return (
    <div className="h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Content Created!</h1>
                <p className="text-gray-600 mt-1">Your content is ready to publish</p>
              </div>
              <button
                onClick={onBackToWriting}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Writing Interface</span>
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">LinkedIn Preview</h2>
            
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm max-w-2xl">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">YN</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Your Name</div>
                    <div className="text-sm text-gray-600">Your Title • 1st</div>
                    <div className="text-xs text-gray-500">2h • Edited</div>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {assembledContent}
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>👍 You and 31 others</span>
                  <span>6 comments • 9 reposts</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                    <span>👍</span>
                    <span>Like</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                    <span>💬</span>
                    <span>Comment</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                    <span>🔄</span>
                    <span>Repost</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                    <span>📤</span>
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={onBackToWriting}
                className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Content</span>
              </button>
              
              <div className="flex items-center space-x-3">
                {inStrictWorkflow && (
                  <>
                    <button
                      onClick={onSaveAndExit}
                      className="flex items-center space-x-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
                    >
                      <span>Save & Exit Workflow</span>
                    </button>
                    <button
                      onClick={onContinueToImages}
                      className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                    >
                      <span>Add Image</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
