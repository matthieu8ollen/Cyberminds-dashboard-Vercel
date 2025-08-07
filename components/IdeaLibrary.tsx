'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ContentIdea, createContentIdea, getContentIdeas } from '../lib/supabase'
import { 
  Filter, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Users,
  ChevronDown,
  Sparkles,
  Clock,
  Tag,
  Zap,
  Crown
} from 'lucide-react'

type FilterType = 'all' | 'industry_trends' | 'case_studies' | 'saas_metrics' | 'leadership' | 'career_advice' | 'market_insights' | 'tools_tech' | 'personal_stories'
type CategoryType = 'all' | 'authority' | 'growth' | 'personal' | 'educational'

const CONTENT_PILLARS = [
  { value: 'all', label: 'All Topics' },
  { value: 'industry_trends', label: 'Industry Trends' },
  { value: 'case_studies', label: 'Case Studies' },
  { value: 'saas_metrics', label: 'SaaS Metrics' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'career_advice', label: 'Career Advice' },
  { value: 'market_insights', label: 'Market Insights' },
  { value: 'tools_tech', label: 'Tools & Tech' },
  { value: 'personal_stories', label: 'Personal Stories' }
]

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'authority', label: 'Authority Building' },
  { value: 'growth', label: 'Growth & Networking' },
  { value: 'personal', label: 'Personal Brand' },
  { value: 'educational', label: 'Educational' }
]

// Mock saved ideas - in real implementation, this would come from Supabase
const MOCK_SAVED_IDEAS = [
  {
    id: '1',
    title: 'The Hidden Cost of Poor Cash Flow Forecasting',
    description: 'Share a framework for improving cash flow predictions that saved a SaaS company $2M',
    tags: ['cash-flow', 'forecasting', 'framework'],
    content_pillar: 'case_studies',
    category: 'authority',
    source_type: 'ai_generated' as const,
    created_at: '2024-01-15T10:00:00Z',
    saved_at: '2024-01-15T10:05:00Z'
  },
  {
    id: '2',
    title: '5 SaaS Metrics Every Series A Startup Gets Wrong',
    description: 'Breakdown of common metric mistakes and how to fix them',
    tags: ['saas-metrics', 'startup', 'mistakes'],
    content_pillar: 'saas_metrics',
    category: 'educational',
    source_type: 'ai_generated' as const,
    created_at: '2024-01-14T15:30:00Z',
    saved_at: '2024-01-14T15:35:00Z'
  },
  {
    id: '3',
    title: 'Why I Stopped Using Traditional Budgets (And What I Do Instead)',
    description: 'Personal story about moving from annual budgets to rolling forecasts',
    tags: ['budgeting', 'personal-story', 'innovation'],
    content_pillar: 'personal_stories',
    category: 'personal',
    source_type: 'ai_generated' as const,
    created_at: '2024-01-13T09:15:00Z',
    saved_at: '2024-01-13T09:20:00Z'
  },
  {
    id: '4',
    title: 'The CFO\'s Guide to AI Tool Implementation',
    description: 'Step-by-step approach for evaluating and implementing finance AI tools',
    tags: ['ai', 'tools', 'implementation'],
    content_pillar: 'tools_tech',
    category: 'authority',
    source_type: 'ai_generated' as const,
    created_at: '2024-01-12T14:20:00Z',
    saved_at: '2024-01-12T14:25:00Z'
  },
  {
    id: '5',
    title: 'Market Volatility: 3 Strategies That Kept Our Runway Intact',
    description: 'How we navigated 2023\'s market uncertainty with specific financial strategies',
    tags: ['market-analysis', 'strategy', 'runway'],
    content_pillar: 'market_insights',
    category: 'growth',
    source_type: 'ai_generated' as const,
    created_at: '2024-01-11T11:45:00Z',
    saved_at: '2024-01-11T11:50:00Z'
  },
  {
    id: '6',
    title: 'Building Finance Team Culture in Remote-First Companies',
    description: 'Leadership insights on creating strong team dynamics across distributed finance teams',
    tags: ['leadership', 'remote-work', 'team-building'],
    content_pillar: 'leadership',
    category: 'authority',
    source_type: 'ai_generated' as const,
    created_at: '2024-01-10T16:30:00Z',
    saved_at: '2024-01-10T16:35:00Z'
  }
]

interface IdeaLibraryProps {
  onUseInStandardMode?: (idea: ContentIdea) => void
  onUseInWriterSuite?: (idea: ContentIdea) => void
}

export default function IdeaLibrary({ onUseInStandardMode, onUseInWriterSuite }: IdeaLibraryProps) {
  const { user, profile } = useAuth()
  const [ideas, setIdeas] = useState<ContentIdea[]>([])
  const [loading, setLoading] = useState(false)
  
  // Filters
  const [topicFilter, setTopicFilter] = useState<FilterType>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>('all')
  const [showTopicDropdown, setShowTopicDropdown] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  // Load saved ideas on mount
  useEffect(() => {
    loadSavedIdeas()
  }, [user])

  const loadSavedIdeas = async () => {
    setLoading(true)
    try {
      // In real implementation: const { data, error } = await getContentIdeas(user?.id)
      // For now, use mock data
      setTimeout(() => {
        setIdeas(MOCK_SAVED_IDEAS)
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error loading saved ideas:', error)
      setLoading(false)
    }
  }

  const filteredIdeas = ideas.filter(idea => {
    const matchesTopic = topicFilter === 'all' || idea.content_pillar === topicFilter
    const matchesCategory = categoryFilter === 'all' || idea.tags.includes(categoryFilter.replace('_', '-'))
    return matchesTopic && matchesCategory
  })

  const getCategoryIcon = (pillar: string) => {
    switch (pillar) {
      case 'industry_trends': return <TrendingUp className="w-4 h-4" />
      case 'case_studies': return <BarChart3 className="w-4 h-4" />
      case 'leadership': return <Users className="w-4 h-4" />
      case 'saas_metrics': return <Target className="w-4 h-4" />
      default: return <Sparkles className="w-4 h-4" />
    }
  }

  const getCategoryColor = (pillar: string) => {
    switch (pillar) {
      case 'industry_trends': return 'bg-blue-100 text-blue-800'
      case 'case_studies': return 'bg-green-100 text-green-800'
      case 'leadership': return 'bg-purple-100 text-purple-800'
      case 'saas_metrics': return 'bg-orange-100 text-orange-800'
      case 'market_insights': return 'bg-red-100 text-red-800'
      case 'tools_tech': return 'bg-slate-100 text-slate-800'
      case 'personal_stories': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks}w ago`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Idea Library</h1>
            <p className="text-gray-600 mt-2">
              Your saved content ideas ready to be transformed into posts
            </p>
          </div>
          
          <div className="text-sm text-gray-500">
            {filteredIdeas.length} saved ideas
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Topic Filter */}
          <div className="relative">
            <button
              onClick={() => setShowTopicDropdown(!showTopicDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Filter className="w-4 h-4 text-gray-500" />
              {CONTENT_PILLARS.find(p => p.value === topicFilter)?.label || 'All Topics'}
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            
            {showTopicDropdown && (
              <div className="absolute top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {CONTENT_PILLARS.map((pillar) => (
                  <button
                    key={pillar.value}
                    onClick={() => {
                      setTopicFilter(pillar.value as FilterType)
                      setShowTopicDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                      topicFilter === pillar.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {pillar.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Tag className="w-4 h-4 text-gray-500" />
              {CATEGORIES.find(c => c.value === categoryFilter)?.label || 'All Categories'}
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            
            {showCategoryDropdown && (
              <div className="absolute top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => {
                      setCategoryFilter(category.value as CategoryType)
                      setShowCategoryDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                      categoryFilter === category.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ideas Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your saved ideas...</p>
        </div>
      ) : filteredIdeas.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas found</h3>
          <p className="text-gray-600">
            {topicFilter === 'all' && categoryFilter === 'all' 
              ? "You haven't saved any ideas yet. Visit the Ideas Hub to start brainstorming!"
              : "No ideas match your current filters. Try adjusting your selection."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map((idea) => (
            <div
              key={idea.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                {/* Content Pillar Badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(idea.content_pillar || '')}`}>
                  {getCategoryIcon(idea.content_pillar || '')}
                  {CONTENT_PILLARS.find(p => p.value === idea.content_pillar)?.label || 'General'}
                </div>
                
                {/* Time Ago */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(idea.saved_at || idea.created_at)}
                </div>
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {idea.title}
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {idea.description}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {idea.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {idea.tags.length > 3 && (
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                    +{idea.tags.length - 3}
                  </span>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => onUseInStandardMode?.(idea)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  <Zap className="w-4 h-4" />
                  Standard Mode
                </button>
                <button
                  onClick={() => onUseInWriterSuite?.(idea)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-teal-600 text-white text-sm font-medium rounded-lg hover:opacity-90 transition"
                >
                  <Crown className="w-4 h-4" />
                  Writer Suite
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
