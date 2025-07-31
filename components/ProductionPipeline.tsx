'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useContent } from '../contexts/ContentContext'
import { useToast } from './ToastNotifications'
import { 
  RefreshCw,
  Archive,
  Edit3,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Calendar,
  Eye,
  Trash2,
  ExternalLink,
  User,
  Sparkles,
  Zap,
  Settings,
  MoreHorizontal
} from 'lucide-react'

type ContentFilterType = 'all' | 'ready' | 'progress' | 'scheduled' | 'published'

export default function ProductionPipeline() {
  const { user } = useAuth()
  const { 
    draftContent, 
    scheduledContent, 
    publishedContent, 
    loadingContent,
    refreshContent,
    publishContent,
    deleteContent,
    setSelectedContent,
    setShowScheduleModal
  } = useContent()
  const { showToast } = useToast()
  
  const [filter, setFilter] = useState<ContentFilterType>('all')
  const [selectedContentItem, setSelectedContentItem] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  // Combine all content
  const allContent = [
    ...draftContent.map(c => ({ ...c, status: c.status || 'draft' as const })),
    ...scheduledContent.map(c => ({ ...c, status: c.status || 'scheduled' as const })),
    ...publishedContent.map(c => ({ ...c, status: c.status || 'published' as const }))
  ]

  // Smart content grouping
  const readyToSchedule = allContent.filter(c => 
    c.status === 'draft' && c.content_text.length > 200 // Content with substance
  )
  
  const inProgress = allContent.filter(c => 
    c.status === 'draft' && c.content_text.length <= 200 // Shorter content still being worked on
  )
  
  const scheduled = allContent.filter(c => c.status === 'scheduled')
  const published = allContent.filter(c => c.status === 'published').slice(0, 6) // Last 6

  useEffect(() => {
    if (user) {
      refreshContent()
    }
  }, [user, refreshContent])

  const getCreationModeInfo = (content: any) => {
    const modeData = content.variations_data?.creation_mode
    
    switch (modeData) {
      case 'marcus':
        return { 
          icon: <User className="w-3 h-3" />, 
          label: 'Marcus', 
          color: 'text-teal-600 bg-teal-50 border-teal-200',
          route: '/marcus' // We'll implement routing later
        }
      case 'classic':
        return { 
          icon: <Sparkles className="w-3 h-3" />, 
          label: 'Writer Suite', 
          color: 'text-purple-600 bg-purple-50 border-purple-200',
          route: '/writer-suite'
        }
      case 'express':
        return { 
          icon: <Zap className="w-3 h-3" />, 
          label: 'Express', 
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          route: '/create/express'
        }
      case 'standard':
        return { 
          icon: <Settings className="w-3 h-3" />, 
          label: 'Standard', 
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          route: '/create/standard'
        }
      default:
        return { 
          icon: <Edit3 className="w-3 h-3" />, 
          label: 'Draft', 
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          route: '/create'
        }
    }
  }

const getContentHook = (content: any) => {
    const lines = content.content_text.split('\n').filter((line: string) => line.trim())
    const firstLine = lines[0] || ''
    
    // Return first meaningful line, truncated if too long
    return firstLine.length > 80 ? firstLine.substring(0, 80) + '...' : firstLine
  }

  const handleContinueEditing = (content: any) => {
    const modeInfo = getCreationModeInfo(content)
    showToast('info', `Opening content in ${modeInfo.label} for editing...`)
    // TODO: Implement actual routing to original creation mode with content loaded
  }

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
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        const success = await deleteContent(contentId)
        if (success) {
          showToast('success', 'Content deleted successfully')
          refreshContent()
        } else {
          showToast('error', 'Failed to delete content')
        }
      } catch (error) {
        showToast('error', 'An error occurred while deleting')
      }
    }
  }

  const ContentCard = ({ content, size = 'normal', showActions = true }: { 
    content: any, 
    size?: 'normal' | 'large' | 'compact',
    showActions?: boolean 
  }) => {
    const modeInfo = getCreationModeInfo(content)
    const hook = getContentHook(content)
    const isHovered = hoveredCard === content.id

    const cardClasses = `
      bg-white rounded-lg border border-gray-200 transition-all duration-200 cursor-pointer relative
      ${size === 'large' ? 'p-6' : size === 'compact' ? 'p-4' : 'p-5'}
      ${isHovered ? 'shadow-md border-gray-300 transform -translate-y-0.5' : 'shadow-sm hover:shadow-md'}
    `

    return (
      <div
        className={cardClasses}
        onMouseEnter={() => setHoveredCard(content.id)}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() => {
          setSelectedContentItem(content)
          setShowPreview(true)
        }}
      >
        {/* Creation Mode Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${modeInfo.color}`}>
            {modeInfo.icon}
            <span className="ml-1">{modeInfo.label}</span>
          </span>
          
          <span className="text-xs text-gray-500">
            {new Date(content.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* Content Preview */}
        <div className="mb-3">
          {content.title && (
            <h3 className="font-medium text-gray-900 mb-1 line-clamp-1 text-sm">
              {content.title}
            </h3>
          )}
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
            {hook}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="capitalize">{content.content_type || 'draft'}</span>
          <span>{content.content_text.length} chars</span>
        </div>

        {/* Hover Actions */}
        {showActions && isHovered && (
          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-2 shadow-sm">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleContinueEditing(content)
              }}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              <span>Continue</span>
            </button>

            {content.status === 'draft' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleScheduleContent(content)
                }}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
              >
                <Calendar className="w-3 h-3" />
                <span>Schedule</span>
              </button>
            )}

            {content.status === 'scheduled' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePublishNow(content)
                }}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-green-700 hover:text-green-900 hover:bg-green-100 rounded transition-colors"
              >
                <Send className="w-3 h-3" />
                <span>Publish</span>
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation()
                // Handle archive/delete
              }}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    )
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
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCreationModeInfo(selectedContentItem).color}`}>
                    {getCreationModeInfo(selectedContentItem).icon}
                    <span className="ml-1">{getCreationModeInfo(selectedContentItem).label}</span>
                  </span>
                  <span className="text-sm text-gray-500 capitalize">
                    {selectedContentItem.status} • {selectedContentItem.content_type}
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
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Continue in {getCreationModeInfo(selectedContentItem).label}</span>
                </button>
              </div>
              
              <div className="flex space-x-3">
                {selectedContentItem.status === 'draft' && (
                  <button 
                    onClick={() => {
                      setShowPreview(false)
                      handleScheduleContent(selectedContentItem)
                    }}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
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
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
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
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
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
          <p className="text-gray-600">Loading your content pipeline...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production Pipeline</h1>
          <p className="text-gray-600 mt-1">
            Track your content from creation to publication
          </p>
        </div>
        
        <button 
          onClick={() => refreshContent()}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-orange-100">
              <CheckCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ready to Schedule</p>
              <p className="text-2xl font-bold text-gray-900">{readyToSchedule.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-gray-100">
              <Edit3 className="w-5 h-5 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{inProgress.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{scheduled.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">{publishedContent.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ready to Schedule Section */}
      {readyToSchedule.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              🎯 Ready to Schedule
              <span className="ml-2 bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                {readyToSchedule.length}
              </span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {readyToSchedule.map((content) => (
              <ContentCard key={content.id} content={content} size="large" />
            ))}
          </div>
        </div>
      )}

      {/* In Progress Section */}
      {inProgress.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              ✏️ In Progress
              <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                {inProgress.length}
              </span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgress.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Section */}
      {scheduled.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              ⏰ Scheduled
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {scheduled.length}
              </span>
            </h2>
          </div>
          
          <div className="space-y-3">
            {scheduled.map((content) => (
              <div key={content.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getCreationModeInfo(content).color}`}>
                    {getCreationModeInfo(content).icon}
                    <span className="ml-1">{getCreationModeInfo(content).label}</span>
                  </span>
                  
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {getContentHook(content)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Scheduled for {content.scheduled_date} at {content.scheduled_time}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handlePublishNow(content)}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                >
                  Publish Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Published Section */}
      {published.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">✅ Recently Published</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {published.map((content) => (
              <ContentCard key={content.id} content={content} size="compact" showActions={false} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {allContent.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Archive className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content in your pipeline</h3>
          <p className="text-gray-600 mb-4">
            Start by creating content in Marcus or Writer Suite to see it here.
          </p>
          <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors">
            Create Your First Content
          </button>
        </div>
      )}

      <ContentPreviewModal />
    </div>
  )
}
