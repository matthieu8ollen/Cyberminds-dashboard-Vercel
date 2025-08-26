'use client'

import { X } from 'lucide-react'

interface AISidebarProps {
  isVisible: boolean
  onClose: () => void
  generatedExample?: {
    generated_content?: {
      complete_post?: string
      post_analytics?: {
        word_count?: string
      }
    }
    validation_score?: string
  }
}

export default function AISidebar({ isVisible, onClose, generatedExample }: AISidebarProps) {
  if (!isVisible) return null

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">AI Generated Content</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {generatedExample?.generated_content?.complete_post ? (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <div className="text-gray-800 leading-relaxed whitespace-pre-line text-sm">
                {generatedExample.generated_content.complete_post}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 space-y-1">
                <div>Word Count: {generatedExample.generated_content.post_analytics?.word_count || 'Unknown'}</div>
                <div>Validation Score: {generatedExample.validation_score || 'Unknown'}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <div className="text-sm">No AI content available yet</div>
          </div>
        )}
      </div>
    </div>
  )
}
