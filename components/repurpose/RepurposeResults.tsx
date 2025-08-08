'use client'

import { useState, useEffect } from 'react'
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

interface RepurposeResultsProps {
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

export default function RepurposeResults({ 
  results, 
  originalContent, 
  onStartOver, 
  onGenerateVariations 
}: RepurposeResultsProps) {
  const { user } = useAuth()
  const { moveToCreate } = useWorkflow()
  
  // State management
  const [editedTopic, setEditedTopic] = useState(results.topics || results.topic)
  const [editedThemes, setEditedThemes] = useState(results.key_themes || results.takeaways || [])
  const [isEditing, setIsEditing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showOriginalContent, setShowOriginalContent] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  
  // Get source configuration
  const sourceConfig = SOURCE_CONFIG[results.repurpose_type]
  const SourceIcon = sourceConfig.icon

  // Track changes
  useEffect(() => {
    const topicChanged = editedTopic !== (results.topics || results.topic)
    const themesChanged = JSON.stringify(editedThemes) !== JSON.stringify(results.key_themes || results.takeaways || [])
    setHasUnsavedChanges(topicChanged || themesChanged)
  }, [editedTopic, editedThemes, results])

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

    // Move to create stage in workflow
    await moveToCreate('standard')
    
    // Navigate would be handled by parent component
    console.log('Navigate to content creation with:', ideationData)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className={`w-16 h-16 ${sourceConfig.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <SourceIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Content Ideas Generated!
        </h1>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
          <SourceIcon className="w-4 h-4 mr-2" />
          From {sourceConfig.label}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Topic Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Target className="w-5 h-5 text-teal-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Main Topic</h2>
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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Key Themes</h2>
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

        {/* Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
          
          {/* Primary Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <button
              onClick={saveToIdeas}
              disabled={isSaving || saveStatus === 'saving'}
              className="flex items-center justify-center space-x-3 p-4 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition"
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">
                {isSaving ? 'Saving...' : 'Save to Ideas Library'}
              </span>
            </button>

            <button
              onClick={createPost}
              className="flex items-center justify-center space-x-3 p-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              <Edit3 className="w-5 h-5" />
              <span className="font-medium">Create LinkedIn Post</span>
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={onGenerateVariations}
              className="flex items-center justify-center space-x-3 p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Generate Different Themes</span>
            </button>

            <button
              onClick={onStartOver}
              className="flex items-center justify-center space-x-3 p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Start Over</span>
            </button>
          </div>
        </div>

        {/* Original Content Preview */}
        {originalContent && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowOriginalContent(!showOriginalContent)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
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
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {originalContent.length > 1000 
                      ? `${originalContent.substring(0, 1000)}...` 
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
  )
}
