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
  FileText
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

  // Combine all content based on filter
  const allContent = [
    ...draftContent.map(c => ({ ...c, status: c.status || 'draft' as const })),
    ...scheduledContent.map(c => ({ ...c, status: c.status || 'scheduled' as const })),
    ...publishedContent.map(c => ({ ...c, status: c.status || 'published' as const }))
    ...archivedContent.map(c => ({ ...c, status: c.status || 'archived' as const }))
  ]

  const filteredContent = allContent.filter(item => item.status === filter)

  useEffect(() => {
    if (user) {
      refreshContent()
    }
  }, [user, refreshContent])

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

  const handleContinueEditing = (content: any) => {
    const variationsData = content.variations_data
    const creationMode = variationsData?.creation_mode

    switch (creationMode) {
      case 'marcus':
        // Navigate to Marcus with content loaded
        // For now, show a toast - in real implementation, you'd navigate to Marcus
        showToast('info', 'Opening content in Marcus Mode...')
        // TODO: Navigate to Marcus with pre-populated content
        break
      
      case 'classic':
        // Navigate to Writer Suite Classic with content loaded
        showToast('info', 'Opening content in Writer Suite Classic...')
        // TODO: Navigate to Writer Suite Classic with pre-populated content
        break
      
      case 'express':
      case 'standard':
        // Open universal editor
        setEditingContent(content)
        setShowUniversalEditor(true)
        break
      
      default:
        // Fallback to universal editor
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

  const getContinueButtonText = (content: any): string => {
    const variationsData = content.variations_data
    const creationMode = variationsData?.creation_mode

    switch (creationMode) {
      case 'marcus': return 'Continue in Marcus'
      case 'classic': return 'Continue in Writer Suite Classic'  
      case 'express': return 'Continue in Express Mode'
      case 'standard': return 'Continue in Standard Mode'
      default: return 'Edit Content'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'published': return 'bg-green-100 text-green-800 border-green-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit3 className="w-4 h-4" />
      case 'scheduled': return <Clock className="w-4 h-4" />
      case 'published': return <CheckCircle className="w-4 h-4" />
      case 'failed': return <AlertCircle className="w-4 h-4" />
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

  const ContentPreviewModal = () => {
    if (!showPreview || !selectedContentItem) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Content Preview</h3>
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
          
          <div className="p-6 overflow-y-auto max-h-96">
            <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">
              {selectedContentItem.content_text}
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between">
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setShowPreview(false)
                    handleContinueEditing(selectedContentItem)
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{getContinueButtonText(selectedContentItem)}</span>
                </button>
                
                {selectedContentItem.status === 'draft' && (
                  <button 
                    onClick={() => {
                      setShowPreview(false)
                      handleScheduleContent(selectedContentItem)
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule</span>
                  </button>
                )}
              </div>
              
              <div className="flex space-x-3">
                {selectedContentItem.status === 'draft' && (
                  <button 
                    onClick={() => {
                      setShowPreview(false)
                      handleScheduleContent(selectedContentItem)
                    }}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
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
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
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
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 text-red-600 hover:text-red-700"
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

  if (loadingContent) {
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
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <Edit3 className="w-5 h-5 text-gray-600 group-hover:text-slate-600" />
                <span className="text-2xl font-bold text-gray-900">{draftContent.length}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Drafts</p>
            </button>
            
            <button
              onClick={() => setFilter('scheduled')}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                <span className="text-2xl font-bold text-gray-900">{scheduledContent.length}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
            </button>
            
            <button
              onClick={() => setFilter('published')}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                <span className="text-2xl font-bold text-gray-900">{publishedContent.length}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Published</p>
            </button>
            
            <button
              onClick={() => setFilter('archived')}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <Archive className="w-5 h-5 text-gray-600 group-hover:text-gray-700" />
                <span className="text-2xl font-bold text-gray-900">
  {archivedContent.length}
</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Archived</p>
            </button>
          </div>
          
{/* Sliding Underline Indicator */}
          <div 
            className="absolute -bottom-1 h-0.5 bg-slate-600 transition-all duration-300 ease-out" 
            style={{
              width: '25%',
              left: filter === 'draft' ? '0%' : 
                    filter === 'scheduled' ? '25%' : 
                    filter === 'published' ? '50%' : 
                    filter === 'archived' ? '75%' : '0%'
            }}
          >
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
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                {item.published_at && (
                  <span>Published: {new Date(item.published_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>

            {/* Hover Actions */}
            <div className="absolute inset-x-6 bottom-6 pt-4 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      setSelectedContentItem(item)
                      setShowPreview(true)
                    }}
                    className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </button>
                  
                  <button 
                    onClick={() => handleContinueEditing(item)}
                    className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Continue</span>
                  </button>

                  <button 
                    onClick={() => handleArchiveContent(item.id)}
                    className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition"
                  >
                    <Archive className="w-3 h-3" />
                    <span>Archive</span>
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  {item.status === 'draft' && (
                    <button 
                      onClick={() => handleScheduleContent(item)}
                      className="px-3 py-1 bg-slate-700 text-white text-xs rounded hover:bg-slate-800 transition"
                    >
                      Schedule
                    </button>
                  )}
                  
                  {item.status === 'scheduled' && (
                    <button 
                      onClick={() => handlePublishNow(item)}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                    >
                      Publish
                    </button>
                  )}

                  {item.status === 'published' && item.linkedin_post_url && (
                    <a
                      href={item.linkedin_post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center space-x-1 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredContent.length === 0 && (
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
