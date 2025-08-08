'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useWorkflow } from '../../contexts/WorkflowContext'
import { 
  saveGeneratedContent, 
  updateIdeationSession,
  createIdeationSession 
} from '../../lib/supabase'
import { 
  FileText, 
  Mic, 
  Youtube, 
  Linkedin,
  Edit3,
  Save,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  RefreshCw,
  ArrowLeft,
  BookOpen,
  Pencil
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
  
  // State management
  const [editedTopic, setEditedTopic] = useState(results?.topics || results?.topic || '')
  const [editedThemes, setEditedThemes] = useState(() => {
    const themes = results?.key_themes || results?.takeaways || []
    return Array.isArray(themes) ? themes : []
  })
  const [isEditing, setIsEditing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showOriginalContent, setShowOriginalContent] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  
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
      document.body.style.overflow = 'hidden' // Prevent background scroll
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

  // Track changes
  useEffect(() => {
    if (!results) return
    const topicChanged = editedTopic !== (results.topics || results.topic)
    const themesChanged = JSON.stringify(editedThemes) !== JSON.stringify(results.key_themes || results.takeaways || [])
    setHasUnsavedChanges(topicChanged || themesChanged)
  }, [editedTopic, editedThemes, results])

  if (!isOpen || !results) return null

  // Theme editing functions
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
    setIsEditing(true)
  }

  // Save changes
  const saveChanges = async () => {
    if (!hasUnsavedChanges) return
    
    setSaveStatus('saving')
    try {
      // Update the ideation session with new data
      if (results.session_id) {
        await updateIdeationSession(results.session_id, {
          topic: editedTopic,
          takeaways: editedThemes,
          updated_at: new Date().toISOString()
        })
      }
      
      setSaveStatus('saved')
      setHasUnsavedChanges(false)
      setIsEditing(false)
      
      // Reset status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Error saving changes:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  // Save to Ideas Library
  const saveToIdeas = async () => {
    if (!user) return
    
    setIsSaving(true)
    try {
      // Create new ideation session for Ideas Library
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

      // Show success message
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
      
    } catch (error) {
      console.error('Error saving to ideas:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  // Create LinkedIn Post
  const createPost = async () => {
    // Prepare ideation data for workflow
    const ideationData = {
      topic: editedTopic,
      angle: 'Repurposed content perspective',
      takeaways: editedThemes,
      source_page: 'repurpose_content',
      session_id: results.session_id,
      repurpose_type: results.repurpose_type,
      source_badges: results.source_badges
    }

    // Close modal and move to create stage
    onClose()
    await moveToCreate('standard')
    
    // Navigation would be handled by parent component
    console.log('Navigate to content creation with:', ideationData)
  }

  const handleStartOver = () => {
    onClose()
    onStartOver()
  }

  const handleGenerateVariations = () => {
    onClose()
    onGenerateVariations()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          ref={modalRef}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${sourceConfig.color} rounded-lg flex items-center justify-center`}>
                  <SourceIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Content Ideas Generated!</h2>
                  <p className="text-sm text-gray-600">From {sourceConfig.label}</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-6">
            <div className="space-y-6">
              {/* Topic Section */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Target className="w-5 h-5 text-teal-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Main Topic</h3>
                </div>
                
                <textarea
                  value={editedTopic}
                  onChange={(e) => setEditedTopic(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="Enter the main topic or theme..."
                />
              </div>

              {/* Key Themes Section */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Key Themes</h3>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-teal-600 transition"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>{isEditing ? 'Stop Editing' : 'Edit Themes'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {editedThemes.map((theme, index) => (
                    <div key={index} className="flex items-start space-x-3 group">
                      <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
                      {isEditing ? (
                        <div className="flex-1 flex items-center space-x-2">
                          <textarea
                            value={theme}
                            onChange={(e) => updateTheme(index, e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                            rows={1}
                          />
                          <button
                            onClick={() => removeTheme(index)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="flex-1 text-gray-700 leading-relaxed">{theme}</p>
                      )}
                    </div>
                  ))}

                  {isEditing && (
                    <button
                      onClick={addTheme}
                      className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-medium">Add Theme</span>
                    </button>
                  )}
                </div>

                {/* Save Changes Button */}
                {hasUnsavedChanges && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={saveChanges}
                      disabled={saveStatus === 'saving'}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                        saveStatus === 'saved' 
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : saveStatus === 'error'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-teal-600 text-white hover:bg-teal-700'
                      }`}
                    >
                      <Save className="w-4 h-4" />
                      <span>
                        {saveStatus === 'saving' ? 'Saving...' : 
                         saveStatus === 'saved' ? 'Saved!' :
                         saveStatus === 'error' ? 'Error - Try Again' :
                         'Save Changes'}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Original Content Preview */}
              {originalContent && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setShowOriginalContent(!showOriginalContent)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">View Original Content</span>
                    </div>
                    {showOriginalContent ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  
                  {showOriginalContent && (
                    <div className="px-4 pb-4 border-t border-gray-200">
                      <div className="bg-white rounded-lg p-4 max-h-32 overflow-y-auto">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {originalContent.length > 500 
                            ? `${originalContent.substring(0, 500)}...` 
                            : originalContent
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Messages */}
              {saveStatus === 'saved' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">✅ Changes saved successfully!</p>
                </div>
              )}
              
              {saveStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">❌ Error saving changes. Please try again.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
            <div className="space-y-4">
              {/* Primary Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={saveToIdeas}
                  disabled={isSaving || saveStatus === 'saving'}
                  className="flex items-center justify-center space-x-2 p-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium">
                    {isSaving ? 'Saving...' : 'Save to Ideas Library'}
                  </span>
                </button>

                <button
                  onClick={createPost}
                  className="flex items-center justify-center space-x-2 p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="font-medium">Create LinkedIn Post</span>
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={handleGenerateVariations}
                  className="flex items-center justify-center space-x-2 p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Generate Different Themes</span>
                </button>

                <button
                  onClick={handleStartOver}
                  className="flex items-center justify-center space-x-2 p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Start Over</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
