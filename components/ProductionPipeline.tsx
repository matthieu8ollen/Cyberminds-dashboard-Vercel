'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  getGeneratedContent, 
  updateGeneratedContent, 
  GeneratedContent 
} from '../lib/supabase'
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
  RefreshCw
} from 'lucide-react'

type StatusType = 'draft' | 'scheduled' | 'published' | 'failed'
type ContentFilterType = 'all' | 'draft' | 'scheduled' | 'published' | 'failed'

interface ContentCard {
  id: string
  user_id: string
  content_text: string
  content_type: 'framework' | 'story' | 'trend' | 'mistake' | 'metrics'
  tone_used: string
  prompt_input: string | null
  is_saved: boolean
  status: StatusType
  created_at: string
  title?: string
  word_count?: number
  scheduled_date?: string
  published_at?: string
  linkedin_post_url?: string
}

export default function ProductionPipeline() {
  const { user } = useAuth()
  const [content, setContent] = useState<ContentCard[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ContentFilterType>('all')
  const [selectedContent, setSelectedContent] = useState<ContentCard | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadContent()
  }, [user])

  const loadContent = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data } = await getGeneratedContent(user.id, 20)
      if (data) {
        // Transform GeneratedContent to ContentCard format
        const transformedContent: ContentCard[] = data.map(item => ({
          id: item.id,
          user_id: item.user_id,
          content_text: item.content_text,
          content_type: item.content_type,
          tone_used: item.tone_used,
          prompt_input: item.prompt_input,
          is_saved: item.is_saved,
          status: (item.status as StatusType) || 'draft',
          created_at: item.created_at,
          title: item.title,
          word_count: item.word_count,
          scheduled_date: undefined, // This would come from scheduling service
          published_at: item.published_at,
          linkedin_post_url: item.linkedin_post_url
        }))
        setContent(transformedContent)
      } else {
        // Mock data for demo
        setContent([
          {
            id: '1',
            user_id: user.id,
            content_text: '🎯 5 Key Financial Metrics Every SaaS CFO Must Track\n\n1️⃣ Monthly Recurring Revenue (MRR) growth rate\n2️⃣ Customer Acquisition Cost (CAC) vs Lifetime Value (LTV)\n3️⃣ Gross Revenue Retention (GRR)', 
            content_type: 'framework',
            tone_used: 'insightful',
            prompt_input: 'SaaS financial metrics',
            is_saved: true,
            status: 'published',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            word_count: 287,
            published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            user_id: user.id,
            content_text: 'Stop doing this: Budget variance analysis\n\nThe old way: Spreadsheet gymnastics with 47 tabs\nThe smart way: Real-time dashboards',
            content_type: 'mistake',
            tone_used: 'bold',
            prompt_input: 'Budget variance analysis mistakes',
            is_saved: true,
            status: 'scheduled',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            word_count: 156,
            scheduled_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          {
            id: '3',
            user_id: user.id,
            content_text: 'The hidden cost of poor cash flow forecasting that nobody talks about...',
            content_type: 'story',
            tone_used: 'insightful',
            prompt_input: 'Cash flow forecasting',
            is_saved: false,
            status: 'draft',
            created_at: new Date().toISOString(),
            word_count: 89
          }
        ])
      }
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateContentStatus = async (contentId: string, newStatus: StatusType) => {
    try {
      await updateGeneratedContent(contentId, { status: newStatus })
      setContent(prev => prev.map(item => 
        item.id === contentId ? { ...item, status: newStatus } : item
      ))
    } catch (error) {
      console.error('Error updating content status:', error)
    }
  }

  const filteredContent = content.filter(item => 
    filter === 'all' || item.status === filter
  )

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'published': return 'bg-green-100 text-green-800 border-green-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: StatusType) => {
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
    if (!showPreview || !selectedContent) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Content Preview</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedContent.status)}`}>
                    {getStatusIcon(selectedContent.status)}
                    <span className="ml-1 capitalize">{selectedContent.status}</span>
                  </span>
                  <span className="text-sm text-gray-500 capitalize">
                    {selectedContent.content_type} • {selectedContent.tone_used}
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
              {selectedContent.content_text}
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between">
              <div className="flex space-x-2">
                <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800">
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800">
                  <Calendar className="w-4 h-4" />
                  <span>Schedule</span>
                </button>
              </div>
              <div className="flex space-x-3">
                {selectedContent.status === 'draft' && (
                  <button 
                    onClick={() => updateContentStatus(selectedContent.id, 'scheduled')}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
                  >
                    Schedule
                  </button>
                )}
                {selectedContent.status === 'scheduled' && (
                  <button 
                    onClick={() => updateContentStatus(selectedContent.id, 'published')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Publish Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
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
            onClick={loadContent}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-gray-100">
                <Edit3 className="w-5 h-5 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {content.filter(c => c.status === 'draft').length}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {content.filter(c => c.status === 'scheduled').length}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {content.filter(c => c.status === 'published').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {content.filter(c => c.status === 'failed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          
          <div className="flex space-x-2">
            {(['all', 'draft', 'scheduled', 'published', 'failed'] as ContentFilterType[]).map(filterOption => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                  filter === filterOption
                    ? 'bg-slate-100 text-slate-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {filterOption === 'all' ? 'All' : filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                <span className="ml-1 text-xs">
                  ({filterOption === 'all' ? content.length : content.filter(c => c.status === filterOption).length})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getContentTypeIcon(item.content_type)}
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {item.content_type}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                  {getStatusIcon(item.status)}
                  <span className="ml-1 capitalize">{item.status}</span>
                </span>
                
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Preview */}
            <div className="mb-4">
              <p className="text-gray-900 text-sm leading-relaxed line-clamp-4">
                {item.content_text}
              </p>
            </div>

            {/* Metadata */}
            <div className="space-y-2 mb-4 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Tone: {item.tone_used}</span>
                <span>{item.word_count || 0} words</span>
              </div>
              <div className="flex justify-between">
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                {item.scheduled_date && (
                  <span>Scheduled: {new Date(item.scheduled_date).toLocaleDateString()}</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setSelectedContent(item)
                    setShowPreview(true)
                  }}
                  className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
                
                <button className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800">
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
              
              <div className="flex space-x-2">
                {item.status === 'draft' && (
                  <button 
                    onClick={() => updateContentStatus(item.id, 'scheduled')}
                    className="px-3 py-1 bg-slate-700 text-white text-xs rounded hover:bg-slate-800"
                  >
                    Schedule
                  </button>
                )}
                
                {item.status === 'scheduled' && (
                  <button 
                    onClick={() => updateContentStatus(item.id, 'published')}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    Publish
                  </button>
                )}
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
            {filter === 'all' 
              ? 'Start by generating some content in the Generator tab.' 
              : `No content with status "${filter}" found.`}
          </p>
        </div>
      )}

      <ContentPreviewModal />
    </div>
  )
}
