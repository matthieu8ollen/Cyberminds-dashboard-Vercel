'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useWorkflow } from '../../contexts/WorkflowContext'
import { 
  createIdeationSession 
} from '../../lib/supabase'
import { 
  FileText, 
  Mic, 
  Youtube, 
  Linkedin,
  Edit3,
  Plus,
  X,
  Lightbulb,
  Target,
  BookOpen
} from 'lucide-react'

interface RepurposeResultsModalProps {
  isOpen: boolean
  onClose: () => void
  results: {
    topic: string
    takeaways: string[]
    key_themes: string[]
    topics: string
    repurpose_type: 'blog' | 'voice' | 'youtube' | 'linkedin'
    session_id: string
    source_badges?: any
  }
  originalContent?: string
  onStartOver: () => void
  onGenerateVariations: () => void
}

const SOURCE_CONFIG = {
  blog: { icon: FileText, label: 'Blog Article', color: 'bg-blue-500' },
  voice: { icon: Mic, label: 'Voice Note', color: 'bg-purple-500' },
  youtube: { icon: Youtube, label: 'YouTube Video', color: 'bg-red-500' },
  linkedin: { icon: Linkedin, label: 'LinkedIn Post', color: 'bg-blue-600' }
}

export default function RepurposeResultsModal({ 
  isOpen,
  onClose,
  results, 
  originalContent, 
  onStartOver, 
  onGenerateVariations 
}: RepurposeResultsModalProps) {
  const { user } = useAuth()
  const { moveToCreate } = useWorkflow()
  const modalRef = useRef<HTMLDivElement>(null)
  
  // State management - simplified
  const [editedTopic, setEditedTopic] = useState(results?.topics || results?.topic || '')
  const [editedThemes, setEditedThemes] = useState(() => {
    const themes = results?.key_themes || results?.takeaways || []
    return Array.isArray(themes) ? themes : []
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  
  // Get source configuration
  const sourceConfig = results ? SOURCE_CONFIG[results.repurpose_type] : SOURCE_CONFIG.blog
  const SourceIcon = sourceConfig.icon

  // Handle ESC key and backdrop click
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    const handleBackdropClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('mousedown', handleBackdropClick)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleBackdropClick)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Update state when results change
  useEffect(() => {
    if (results) {
      setEditedTopic(results.topics || results.topic || '')
      const themes = results.key_themes || results.takeaways || []
      setEditedThemes(Array.isArray(themes) ? themes : [])
    }
  }, [results])

  if (!isOpen || !results) return null

  // Theme editing functions - simplified
  const updateTheme = (index: number, newValue: string) => {
    const updated = [...editedThemes]
    updated[index] = newValue
    setEditedThemes(updated)
  }

  const removeTheme = (index: number) => {
    setEditedThemes(editedThemes.filter((_, i) => i !== index))
  }

  const addTheme = () => {
    setEditedThemes([...editedThemes, 'New insight'])
  }

  // Save to Ideas Library - simplified
  const saveToIdeas = async () => {
    if (!user) return
    
    setIsSaving(true)
    setSaveMessage('')
    
    try {
      const { data: session, error } = await createIdeationSession({
        user_id: user.id,
        page_type: 'repurpose_content',
        session_data: {
          repurpose_type: results.repurpose_type,
          original_session_id: results.session_id
        },
        status: 'completed',
        topic: editedTopic,
        takeaways: editedThemes
      })

      if (error) throw error

      setSaveMessage('✅ Saved to Ideas Library!')
      setTimeout(() => {
        setSaveMessage('')
        onClose()
      }, 1500)
      
    } catch (error) {
      console.error('Error saving to ideas:', error)
      setSaveMessage('❌ Error saving. Try again.')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  // Create LinkedIn Post - simplified
  const createPost = async () => {
    const ideationData = {
      topic: editedTopic,
      angle: 'Repurposed content perspective',
      takeaways: editedThemes,
      source_page: 'repurpose_content',
      session_id: results.session_id,
      repurpose_type: results.repurpose_type,
      source_badges: results.source_badges
    }

    onClose()
    await moveToCreate('standard')
    console.log('Navigate to content creation with:', ideationData)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          ref={modalRef}
          className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        >
          {/* Header - Simplified */}
          <div className="bg-gradient-to-r from-slate-700 to-teal-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <SourceIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Content Ideas Ready!</h2>
                  <p className="text-sm text-gray-200">From {sourceConfig.label}</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content - Simplified */}
          <div className="p-6 space-y-6">
            {/* Topic Section */}
            <div>
              <div className="flex items-center mb-3">
                <Target className="w-4 h-4 text-teal-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Main Topic</h3>
              </div>
              
              <textarea
                value={editedTopic}
                onChange={(e) => setEditedTopic(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                rows={2}
                placeholder="Enter the main topic..."
              />
            </div>

            {/* Key Themes Section - Always Editable */}
            <div>
              <div className="flex items-center mb-3">
                <Lightbulb className="w-4 h-4 text-yellow-500 mr-2" />
                <h3 className="font-semibold text-gray-900">Key Themes</h3>
              </div>

              <div className="space-y-3">
                {editedThemes.map((theme, index) => (
                  <div key={index} className="flex items-start space-x-3 group">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 flex items-center space-x-2">
                      <textarea
                        value={theme}
                        onChange={(e) => updateTheme(index, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
                        rows={1}
                        placeholder="Enter theme..."
                      />
                      {editedThemes.length > 1 && (
                        <button
                          onClick={() => removeTheme(index)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={addTheme}
                  className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 transition text-sm"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Theme</span>
                </button>
              </div>
            </div>

            {/* Save Message */}
            {saveMessage && (
              <div className={`p-3 rounded-lg text-sm ${
                saveMessage.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {saveMessage}
              </div>
            )}
          </div>

          {/* Actions - Simplified */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={saveToIdeas}
                disabled={isSaving}
                className="flex items-center justify-center space-x-2 p-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
              >
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">
                  {isSaving ? 'Saving...' : 'Save to Ideas'}
                </span>
              </button>

              <button
                onClick={createPost}
                className="flex items-center justify-center space-x-2 p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              >
                <Edit3 className="w-4 h-4" />
                <span className="font-medium">Create Post</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
