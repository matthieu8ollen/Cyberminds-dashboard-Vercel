'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getSavedContent, updateGeneratedContent, GeneratedContent } from '../lib/supabase'
import { 
  Clock, 
  CheckCircle, 
  Calendar, 
  Eye, 
  Edit3, 
  Trash2, 
  ArrowRight, 
  ArrowLeft,
  MoreHorizontal,
  Zap,
  Target,
  BarChart3,
  Sparkles,
  User,
  MessageSquare,
  ThumbsUp,
  Share,
  ExternalLink
} from 'lucide-react'

type ContentStatus = 'action_required' | 'ai_in_progress' | 'ready_scheduled'
type ViewMode = 'board' | 'list'

interface ContentCard extends GeneratedContent {
  status: ContentStatus
  scheduled_date?: string
  review_notes?: string
}

const STATUS_COLUMNS = [
  {
    id: 'action_required' as ContentStatus,
    title: 'Action Required',
    description: 'Content that needs your review',
    color: 'border-orange-200 bg-orange-50',
    headerColor: 'bg-orange-100 text-orange-800',
    icon: Clock,
    count: 0
  },
  {
    id: 'ai_in_progress' as ContentStatus,
    title: 'AI in Progress',
    description: 'Content being optimized',
    color: 'border-blue-200 bg-blue-50',
    headerColor: 'bg-blue-100 text-blue-800',
    icon: Zap,
    count: 0
  },
  {
    id: 'ready_scheduled' as ContentStatus,
    title: 'Ready & Scheduled',
    description: 'Approved content ready to publish',
    color: 'border-green-200 bg-green-50',
    headerColor: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    count: 0
  }
]

export default function ProductionPipeline() {
  const { user } = useAuth()
  const [content, setContent] = useState<ContentCard[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('board')
  const [selectedContent, setSelectedContent] = useState<ContentCard | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadContent()
  }, [user])

  const loadContent = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data } = await getSavedContent(user.id)
      if (data) {
        // Transform saved content into cards with production status
        const contentCards: ContentCard[] = data.map(item => ({
          ...item,
          status: getInitialStatus(item),
          scheduled_date: getScheduledDate(item),
          review_notes: ''
        }))
        setContent(contentCards)
      } else {
        // Create mock content for demonstration
        setContent(createMockContent())
      }
    } catch (error) {
      console.error('Error loading content:', error)
      setContent(createMockContent())
    } finally {
      setLoading(false)
    }
  }

  const getInitialStatus = (item: GeneratedContent): ContentStatus => {
    // Logic to determine initial status based on content properties
    if (item.is_saved && !item.published_at) {
      return 'action_required'
    }
    if (item.published_at) {
      return 'ready_scheduled'
    }
    return 'action_required'
  }

  const getScheduledDate = (item: GeneratedContent): string | undefined => {
    if (item.published_at) {
      return item.published_at
    }
    // Mock scheduled dates for demo
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 7) + 1)
    return futureDate.toISOString()
  }

  const createMockContent = (): ContentCard[] => {
    return [
      {
        id: 'mock-1',
        user_id: user?.id || '',
        content_text: `🔍 5 Key Insights on SaaS Metrics\n\nAfter analyzing the latest trends, here's what every finance professional should know:\n\n1️⃣ Understanding SaaS metrics requires deep market analysis\n\n2️⃣ Most companies overlook the strategic implications of SaaS metrics\n\n3️⃣ The data shows SaaS metrics drives 40% more engagement when done right\n\n4️⃣ Smart CFOs use SaaS metrics as a competitive advantage\n\n5️⃣ SaaS metrics isn't just a metric—it's a business philosophy\n\nWhat's your experience with SaaS metrics? Share your thoughts below! 👇\n\n#Finance #CFO #SaaS #FinanceLeadership`,
        content_type: 'framework',
        tone_used: 'bold',
        prompt_input: 'SaaS metrics framework',
        is_saved: true,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'action_required',
        scheduled_date: undefined,
        review_notes: ''
      },
      {
        id: 'mock-2',
        user_id: user?.id || '',
        content_text: `📊 Deep dive: Cash Flow Forecasting\n\nAfter analyzing patterns across 100+ finance organizations, here are the key insights:\n\n1️⃣ Companies with structured cash flow forecasting processes show 35% better financial performance\n\n2️⃣ The correlation between forecasting maturity and company valuation is stronger than expected\n\n3️⃣ Leading organizations invest 2.3x more resources in forecasting optimization\n\n4️⃣ Forecasting effectiveness directly impacts employee retention rates (18% improvement)\n\n5️⃣ Our analysis shows forecasting ROI compounds at 127% annually when done correctly\n\n📈 Key finding: Advanced forecasting models reduce cash flow variance by 60%\n\nThe data consistently shows that companies implementing these approaches see 25-40% improvement in financial efficiency.\n\nWhat metrics are you tracking for Cash Flow Forecasting? Share your experience below.\n\n#FinanceStrategy #DataDriven #CFOInsights #BusinessIntelligence #Metrics`,
        content_type: 'framework',
        tone_used: 'insightful',
        prompt_input: 'Cash flow forecasting best practices',
        is_saved: true,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ai_in_progress',
        scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        review_notes: 'Optimizing for better engagement'
      },
      {
        id: 'mock-3',
        user_id: user?.id || '',
        content_text: `🎯 Stop doing this immediately: Budget Planning\n\nThe framework that actually works:\n\n1. Stop overthinking budget planning - action beats analysis paralysis every time\n\n2. If you're not uncomfortable, you're not pushing hard enough on budget planning\n\n3. Your budget planning strategy should scare your competition, not comfort them\n\n4. Budget planning without clear accountability is just expensive theater\n\n5. Most teams fail at budget planning because they won't make the hard decisions\n\n💡 Reality check: Traditional budgeting kills innovation and agility\n\nMost finance leaders get this wrong. Don't be one of them.\n\nWhat's your take? Agree or disagree? 👇\n\n#Finance #CFO #Leadership #SaaS #RealTalk`,
        content_type: 'framework',
        tone_used: 'bold',
        prompt_input: 'Modern budget planning approaches',
        is_saved: true,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        published_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ready_scheduled',
        scheduled_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        review_notes: 'Approved for tomorrow morning'
      }
    ]
  }

  const updateContentStatus = async (contentId: string, newStatus: ContentStatus, notes?: string) => {
    setContent(prev => prev.map(item => 
      item.id === contentId 
        ? { ...item, status: newStatus, review_notes: notes || item.review_notes }
        : item
    ))

    // In a real app, you'd update the database here
    // await updateGeneratedContent(contentId, { status: newStatus, review_notes: notes })
  }

  const getStatusCounts = () => {
    const counts = STATUS_COLUMNS.map(column => ({
      ...column,
      count: content.filter(item => item.status === column.id).length
    }))
    return counts
  }

  const getContentIcon = (toneUsed: string) => {
    switch (toneUsed) {
      case 'bold': return Target
      case 'insightful': return BarChart3
      case 'wildcard': return Sparkles
      default: return Zap
    }
  }

  const ContentPreview = ({ content }: { content: ContentCard }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Content Preview</h3>
              <p className="text-sm text-gray-600 mt-1">
                {content.content_type} • {content.tone_used} style
              </p>
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
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* LinkedIn-style preview */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">Your Name</h4>
                  <p className="text-xs text-gray-600">Chief Financial Officer</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500">2h</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">
                {content.content_text}
              </div>
            </div>
            
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <button className="flex items-center space-x-2 hover:bg-gray-50 px-3 py-2 rounded">
                  <ThumbsUp className="w-4 h-4" />
                  <span>Like</span>
                </button>
                <button className="flex items-center space-x-2 hover:bg-gray-50 px-3 py-2 rounded">
                  <MessageSquare className="w-4 h-4" />
                  <span>Comment</span>
                </button>
                <button className="flex items-center space-x-2 hover:bg-gray-50 px-3 py-2 rounded">
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Edit Content
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Schedule Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const ContentCard = ({ item }: { item: ContentCard }) => {
    const IconComponent = getContentIcon(item.tone_used || '')
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <IconComponent className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-gray-900 capitalize">
              {item.tone_used} {item.content_type}
            </span>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-sm text-gray-700 mb-4 line-clamp-3">
          {item.content_text.substring(0, 120)}...
        </p>
        
        <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
          <span>Created {new Date(item.created_at).toLocaleDateString()}</span>
          {item.scheduled_date && (
            <span className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(item.scheduled_date).toLocaleDateString()}</span>
            </span>
          )}
        </div>
        
        {item.review_notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-4">
            <p className="text-xs text-yellow-800">{item.review_notes}</p>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              setSelectedContent(item)
              setShowPreview(true)
            }}
            className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-700"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
          
          <div className="flex space-x-2">
            {item.status === 'action_required' && (
              <>
                <button
                  onClick={() => updateContentStatus(item.id, 'ai_in_progress', 'Optimizing content')}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                >
                  Optimize
                </button>
                <button
                  onClick={() => updateContentStatus(item.id, 'ready_scheduled', 'Approved for publishing')}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                >
                  Approve
                </button>
              </>
            )}
            
            {item.status === 'ai_in_progress' && (
              <>
                <button
                  onClick={() => updateContentStatus(item.id, 'action_required', 'Needs review')}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-xs hover:bg-orange-200"
                >
                  Review
                </button>
                <button
                  onClick={() => updateContentStatus(item.id, 'ready_scheduled', 'Optimization complete')}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                >
                  Done
                </button>
              </>
            )}
            
            {item.status === 'ready_scheduled' && (
              <button className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-xs hover:bg-indigo-200 flex items-center space-x-1">
                <ExternalLink className="w-3 h-3" />
                <span>Publish</span>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your content pipeline...</p>
        </div>
      </div>
    )
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Production Pipeline</h1>
            <p className="text-gray-600 mt-2">
              Manage your content workflow from creation to publication
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex rounded-lg border border-gray-300">
              <button
                onClick={() => setViewMode('board')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'board'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Board
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {statusCounts.map((column) => {
            const Icon = column.icon
            return (
              <div key={column.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${column.headerColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{column.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{column.count}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Content Board */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-3 gap-6">
          {statusCounts.map((column) => {
            const Icon = column.icon
            const columnContent = content.filter(item => item.status === column.id)
            
            return (
              <div key={column.id} className={`rounded-lg border-2 ${column.color} min-h-96`}>
                <div className={`p-4 rounded-t-lg ${column.headerColor} border-b`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-5 h-5" />
                      <h3 className="font-semibold">{column.title}</h3>
                    </div>
                    <span className="text-sm font-medium">{column.count}</span>
                  </div>
                  <p className="text-sm mt-1 opacity-80">{column.description}</p>
                </div>
                
                <div className="p-4 space-y-4">
                  {columnContent.map((item) => (
                    <ContentCard key={item.id} item={item} />
                  ))}
                  
                  {columnContent.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No content in this stage</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Content</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {content.map((item) => (
              <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusCounts.find(s => s.id === item.status)?.headerColor
                      }`}>
                        {statusCounts.find(s => s.id === item.status)?.title}
                      </span>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {item.tone_used} {item.content_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {item.content_text.substring(0, 200)}...
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Created {new Date(item.created_at).toLocaleDateString()}</span>
                      {item.scheduled_date && (
                        <span>Scheduled {new Date(item.scheduled_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setSelectedContent(item)
                        setShowPreview(true)
                      }}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedContent && (
        <ContentPreview content={selectedContent} />
      )}
    </div>
  )
}
