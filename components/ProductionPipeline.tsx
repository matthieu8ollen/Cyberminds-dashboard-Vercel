'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useContent } from '../contexts/ContentContext'
import { useToast } from './ToastNotifications'
import { 
  Filter, 
  MoreVertical, 
  Calendar, 
  Eye, 
  Edit3, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Send,
  BarChart3,
  Target,
  Sparkles,
  TrendingUp,
  Archive,
  RefreshCw,
  ExternalLink,
  User,
  Zap,
  FileText,
  Camera,
  ChevronDown
} from 'lucide-react'

type ContentFilterType = 'draft' | 'scheduled' | 'published' | 'archived'

interface UniversalEditorProps {
  content: any
  onSave: (updatedContent: string) => void
  onClose: () => void
}

// Universal Editor Component for Express/Standard content
function UniversalEditor({ content, onSave, onClose }: UniversalEditorProps) {
  const [editedContent, setEditedContent] = useState(content.content_text)

  const handleSave = () => {
    onSave(editedContent)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Edit Content</h3>
              <p className="text-sm text-gray-600">
                {content.content_type} • Created in {getCreationModeDisplay(content)}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
            placeholder="Edit your content..."
          />
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get creation mode display text
function getCreationModeDisplay(content: any): string {
  const variationsData = content.variations_data
  if (!variationsData || !variationsData.creation_mode) {
    return 'Unknown Mode'
  }

  const mode = variationsData.creation_mode
  switch (mode) {
    case 'marcus': return 'Marcus Mode'
    case 'classic': return 'Writer Suite Classic'
    case 'express': return 'Express Mode'
    case 'standard': return 'Standard Mode'
    default: return 'Unknown Mode'
  }
}

// Helper function to get creation mode icon
function getCreationModeIcon(content: any) {
  const variationsData = content.variations_data
  if (!variationsData || !variationsData.creation_mode) {
    return <FileText className="w-4 h-4" />
  }

  const mode = variationsData.creation_mode
  switch (mode) {
    case 'marcus': return <User className="w-4 h-4" />
    case 'classic': return <Sparkles className="w-4 h-4" />
    case 'express': return <Zap className="w-4 h-4" />
    case 'standard': return <Clock className="w-4 h-4" />
    default: return <FileText className="w-4 h-4" />
  }
}

export default function ProductionPipeline() {
  const { user } = useAuth()
  const { 
    draftContent, 
    scheduledContent, 
    publishedContent,
    archivedContent,
    loadingContent,
    refreshContent,
    updateContent,
    publishContent,
    deleteContent,
    setSelectedContent,
    setShowScheduleModal
  } = useContent()
  const { showToast } = useToast()
  
  const [filter, setFilter] = useState<ContentFilterType>('draft')
  const [selectedContentItem, setSelectedContentItem] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showUniversalEditor, setShowUniversalEditor] = useState(false)
  const [editingContent, setEditingContent] = useState<any>(null)
  const [showMoreActions, setShowMoreActions] = useState<string | null>(null)

  // Combine all content based on filter
  const allContent = [
    ...draftContent.map(c => ({ ...c, status: c.status || 'draft' as const })),
    ...scheduledContent.map(c => ({ ...c, status: c.status || 'scheduled' as const })),
    ...publishedContent.map(c => ({ ...c, status: c.status || 'published' as const })),
    ...archivedContent.map(c => ({ ...c, status: c.status || 'archived' as const }))
  ]

  const filteredContent = allContent.filter(item => item.status === filter)

  useEffect(() => {
    if (user) {
      refreshContent()
    }
  }, [user, refreshContent])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMoreActions(null)
    }

    if (showMoreActions) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showMoreActions])

  const handleScheduleContent = (content: any) => {
    setSelectedContent(content)
    setShowScheduleModal(true)
  }

  const handlePublishNow = async (content: any) => {
    try {
      const success = await publishContent(content.id)
      if (success) {
        showToast('success', 'Content published successfully!')
        refreshContent()
      } else {
        showToast('error', 'Failed to publish content')
      }
    } catch (error) {
      showToast('error', 'An error occurred while publishing')
    }
  }

  const handleDeleteContent = async (contentId: string) => {
    const confirmed = window.confirm('Are you sure you want to permanently delete this content? This action cannot be undone.')
    
    if (confirmed) {
      try {
        const success = await deleteContent(contentId)
        if (success) {
          showToast('success', 'Content deleted permanently')
          refreshContent()
        } else {
          showToast('error', 'Failed to delete content')
        }
      } catch (error) {
        showToast('error', 'An error occurred while deleting')
      }
    }
  }

  const handleArchiveContent = async (contentId: string) => {
    try {
      const success = await updateContent(contentId, { status: 'archived' })
      if (success) {
        showToast('success', 'Content archived successfully')
        refreshContent()
      } else {
        showToast('error', 'Failed to archive content')
      }
    } catch (error) {
      showToast('error', 'An error occurred while archiving')
    }
  }

  const handleUnarchiveContent = async (contentId: string) => {
    try {
      const success = await updateContent(contentId, { status: 'draft' })
      if (success) {
        showToast('success', 'Content moved back to drafts')
        refreshContent()
      } else {
        showToast('error', 'Failed to unarchive content')
      }
    } catch (error) {
      showToast('error', 'An error occurred while unarchiving')
    }
  }

  const handleContinueEditing = (content: any) => {
    const variationsData = content.variations_data
    const creationMode = variationsData?.creation_mode

    switch (creationMode) {
      case 'marcus':
        showToast('info', 'Opening content in Marcus Mode...')
        break
      
      case 'classic':
        showToast('info', 'Opening content in Writer Suite Classic...')
        break
      
      case 'express':
      case 'standard':
        setEditingContent(content)
        setShowUniversalEditor(true)
        break
      
      default:
        setEditingContent(content)
        setShowUniversalEditor(true)
        break
    }
  }

  const handleUniversalEditorSave = async (updatedContent: string) => {
    if (!editingContent) return

    try {
      const success = await updateContent(editingContent.id, {
        content_text: updatedContent
      })
      
      if (success) {
        showToast('success', 'Content updated successfully!')
        refreshContent()
      } else {
        showToast('error', 'Failed to update content')
      }
    } catch (error) {
      showToast('error', 'An error occurred while updating')
    }
  }

  const handleImageAction = (content: any) => {
    // Store the selected content in localStorage for the image page to pick up
    localStorage.setItem('selectedContentForImage', JSON.stringify(content))
    window.open('/images', '_blank')
  }

  const getContinueButtonText = (content: any): string => {
  const variationsData = content.variations_data
  const creationMode = variationsData?.creation_mode

  switch (creationMode) {
    case 'marcus': return 'Continue in Marcus'
    case 'classic': return 'Continue in Writer Suite'  
    case 'express': return 'Continue in Express'
    case 'standard': return 'Continue in Standard'
    default: return 'Continue Editing'
  }
}

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'published': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit3 className="w-4 h-4" />
      case 'scheduled': return <Clock className="w-4 h-4" />
      case 'published': return <CheckCircle className="w-4 h-4" />
      default: return <Edit3 className="w-4 h-4" />
    }
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'framework': return <BarChart3 className="w-4 h-4" />
      case 'story': return <Target className="w-4 h-4" />
      case 'trend': return <TrendingUp className="w-4 h-4" />
      case 'mistake': return <AlertCircle className="w-4 h-4" />
      case 'metrics': return <Sparkles className="w-4 h-4" />
      default: return <BarChart3 className="w-4 h-4" />
    }
  }

const getSmartDateDisplay = (item: any): string => {
    // Helper function to format date without timezone conversion
    const formatDateSafely = (dateString: string) => {
  // Simply format the YYYY-MM-DD string directly without creating Date object
  const [year, month, day] = dateString.split('-')
  return `${month}/${day}/${year}`
}

    switch (item.status) {
      case 'draft':
        return `Created: ${new Date(item.created_at).toLocaleDateString()}`
      case 'scheduled':
        return `Scheduled: ${item.scheduled_date ? formatDateSafely(item.scheduled_date) : new Date(item.created_at).toLocaleDateString()}`
      case 'published':
        return `Published: ${item.published_at ? new Date(item.published_at).toLocaleDateString() : new Date(item.created_at).toLocaleDateString()}`
      case 'archived':
        // Show the most relevant date for archived content
        if (item.published_at) {
          return `Published: ${new Date(item.published_at).toLocaleDateString()}`
        } else if (item.scheduled_date) {
          return `Scheduled: ${formatDateSafely(item.scheduled_date)}`
        } else {
          return `Created: ${new Date(item.created_at).toLocaleDateString()}`
        }
      default:
        return `Created: ${new Date(item.created_at).toLocaleDateString()}`
    }
  }
  
  const getSmartTimeDisplay = (item: any): string => {
    if (item.status === 'scheduled' && item.scheduled_time) {
      return `at ${item.scheduled_time}`
    }
    if (item.status === 'published' && item.published_at) {
      const time = item.published_at.split('T')[1]?.substring(0, 5)
      return time ? `at ${time}` : ''
    }
    return ''
  }
  
  const ContentPreviewModal = () => {
    if (!showPreview || !selectedContentItem) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">LinkedIn Preview</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedContentItem.status)}`}>
                    {getStatusIcon(selectedContentItem.status)}
                    <span className="ml-1 capitalize">{selectedContentItem.status}</span>
                  </span>
                  <span className="text-sm text-gray-500 capitalize">
                    {selectedContentItem.content_type} • Created in {getCreationModeDisplay(selectedContentItem)}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* LinkedIn Preview - Better Contained Layout with Fixed Scroll */}
          <div className="flex-1 overflow-y-auto min-h-0 p-8">
            <div className="flex justify-center items-start min-h-full">
              <div className="max-w-lg w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">YN</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Your Name</div>
                      <div className="text-sm text-gray-500">Finance Professional • 1st</div>
                      <div className="text-xs text-gray-400 flex items-center">
                        <span>2h</span>
                        <span className="mx-1">•</span>
                        <span>🌍</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-line mb-4">
                    {selectedContentItem.content_text}
                  </div>
                  {selectedContentItem.image_url && (
                    <div className="mb-4">
                      <img
                        src={selectedContentItem.image_url}
                        alt="Content image"
                        className="w-full rounded-lg max-h-60 object-cover"
                      />
                    </div>
                  )}
                </div>
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-3">
                    <button className="flex items-center space-x-1 hover:text-blue-600 transition">
                      <span>👍</span>
                      <span>Like</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-600 transition">
                      <span>💬</span>
                      <span>Comment</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-600 transition">
                      <span>🔄</span>
                      <span>Repost</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-600 transition">
                      <span>📤</span>
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons - Better Spaced */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex justify-between items-center">
              <button 
  onClick={() => {
    setShowPreview(false)
    handleContinueEditing(selectedContentItem)
  }}
  className="flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
>
  <ArrowRight className="w-4 h-4" />
  <span>{getContinueButtonText(selectedContentItem)}</span>
</button>
              
              <div className="flex space-x-3">
                {selectedContentItem.status === 'draft' && (
                  <button 
                    onClick={() => {
                      setShowPreview(false)
                      handleScheduleContent(selectedContentItem)
                    }}
                    className="px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition"
                  >
                    Schedule
                  </button>
                )}
                
                {selectedContentItem.status === 'scheduled' && (
                  <button 
                    onClick={() => {
                      setShowPreview(false)
                      handlePublishNow(selectedContentItem)
                    }}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>Publish Now</span>
                  </button>
                )}

                {selectedContentItem.status === 'published' && selectedContentItem.linkedin_post_url && (
                  <a
                    href={selectedContentItem.linkedin_post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View on LinkedIn</span>
                  </a>
                )}
                
                <button 
                  onClick={() => {
                    setShowPreview(false)
                    handleDeleteContent(selectedContentItem.id)
                  }}
                  className="px-4 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-400 flex items-center space-x-2 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loadingContent && draftContent.length === 0 && scheduledContent.length === 0 && publishedContent.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Production Pipeline</h1>
            <p className="text-gray-600 mt-2">
              Manage your content workflow from draft to published
            </p>
          </div>
          
          <button 
            onClick={() => refreshContent()}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats - Now Clickable Filters */}
        <div className="relative mb-8">
          <div className="grid grid-cols-4 gap-6">
            <button
              onClick={() => setFilter('draft')}
              className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-200 text-left group ${
                filter === 'draft' ? 'border-slate-700 shadow-md' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Edit3 className="w-5 h-5 text-gray-600 group-hover:text-slate-600" />
                <span className="text-2xl font-bold text-gray-900">{draftContent.length}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Drafts</p>
            </button>
            
            <button
              onClick={() => setFilter('scheduled')}
              className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-200 text-left group ${
                filter === 'scheduled' ? 'border-slate-700 shadow-md' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                <span className="text-2xl font-bold text-gray-900">{scheduledContent.length}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
            </button>
            
            <button
              onClick={() => setFilter('published')}
              className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-200 text-left group ${
                filter === 'published' ? 'border-slate-700 shadow-md' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                <span className="text-2xl font-bold text-gray-900">{publishedContent.length}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Published</p>
            </button>
            
            <button
              onClick={() => setFilter('archived')}
              className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-200 text-left group ${
                filter === 'archived' ? 'border-slate-700 shadow-md' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Archive className="w-5 h-5 text-gray-600 group-hover:text-gray-700" />
                <span className="text-2xl font-bold text-gray-900">{archivedContent.length}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Archived</p>
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group relative"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getContentTypeIcon(item.content_type)}
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {item.content_type} • Created in {getCreationModeDisplay(item)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                  {getStatusIcon(item.status)}
                  <span className="ml-1 capitalize">{item.status}</span>
                </span>
              </div>
            </div>

            {/* Content Preview */}
            <div className="mb-4">
              {item.image_url && (
                <div className="mb-3">
                  <img
                    src={item.image_url}
                    alt="Content preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                {item.title || item.content_text.split('\n')[0].substring(0, 60) + '...'}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                {item.content_text.length > 150 
                  ? item.content_text.substring(0, 150) + '...'
                  : item.content_text
                }
              </p>
            </div>

            {/* Metadata */}
            <div className="space-y-2 mb-4 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Tone: {item.tone_used}</span>
                <span>{item.word_count || item.content_text.length} chars</span>
              </div>
              <div className="flex justify-between">
                <span>{getSmartDateDisplay(item)}</span>
                <span>{getSmartTimeDisplay(item)}</span>
              </div>
            </div>

            {/* Button Actions - Fixed Layout for All Cards */}
            <div className="absolute inset-x-6 bottom-6 pt-4 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white">
              <div className={`flex items-center ${(item.status === 'draft' || item.status === 'scheduled') ? 'justify-center space-x-2' : 'justify-between'}`}>
                {/* Left Side: Primary Actions */}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      setSelectedContentItem(item)
                      setShowPreview(true)
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-slate-700 text-white rounded hover:bg-slate-800 transition"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </button>
                  
                  <button 
  onClick={() => handleContinueEditing(item)}
  className="flex items-center space-x-1 px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 transition"
>
  <ArrowRight className="w-3 h-3" />
  <span>Continue</span>
</button>
                </div>
                
                {/* Right Side: Secondary Actions with Consistent Layout */}
                <div className="flex items-center space-x-2">
                  {/* Image Button - Only for draft and scheduled content, consistently placed */}
                  {(item.status === 'draft' || item.status === 'scheduled') && (
                    <button 
                      onClick={() => handleImageAction(item)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 transition"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Image</span>
                    </button>
                  )}

                  {/* Status-Specific Action Button */}
                  {item.status === 'draft' && (
                    <button 
                      onClick={() => handleScheduleContent(item)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                    >
                      Schedule
                    </button>
                  )}
                  
                  {item.status === 'scheduled' && (
                    <button 
                      onClick={() => handlePublishNow(item)}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                    >
                      Publish
                    </button>
                  )}

                  {item.status === 'published' && item.linkedin_post_url && (
                    <a
                      href={item.linkedin_post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center space-x-1 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View</span>
                    </a>
                  )}

                  {/* More Actions Dropdown - Fixed */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowMoreActions(showMoreActions === item.id ? null : item.id)
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </button>
                    
                    {showMoreActions === item.id && (
                      <>
                        {/* Backdrop to close dropdown */}
                        <div 
                          className="fixed inset-0 z-20" 
                          onClick={() => setShowMoreActions(null)}
                        ></div>
                        
                        {/* Dropdown Menu */}
                        <div className="absolute right-0 bottom-full mb-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
                          {item.status !== 'archived' ? (
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setShowMoreActions(null)
                                handleArchiveContent(item.id)
                              }}
                              className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 transition flex items-center space-x-2"
                            >
                              <Archive className="w-3 h-3" />
                              <span>Archive</span>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setShowMoreActions(null)
                                handleUnarchiveContent(item.id)
                              }}
                              className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 transition flex items-center space-x-2"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Unarchive</span>
                            </button>
                          )}
                          
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setShowMoreActions(null)
                              handleDeleteContent(item.id)
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 transition border-t border-gray-100 flex items-center space-x-2"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredContent.length === 0 && !loadingContent && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Archive className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
          <p className="text-gray-600">
            {filter === 'draft' 
              ? 'Start by creating content in Marcus or Writer Suite.' 
              : `No ${filter} content found.`}
          </p>
        </div>
      )}

      <ContentPreviewModal />
      
      {showUniversalEditor && editingContent && (
        <UniversalEditor
          content={editingContent}
          onSave={handleUniversalEditorSave}
          onClose={() => {
            setShowUniversalEditor(false)
            setEditingContent(null)
          }}
        />
      )}
    </div>
  )
}
