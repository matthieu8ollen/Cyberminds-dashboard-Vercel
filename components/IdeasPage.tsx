'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ContentIdea, createContentIdea, getContentIdeas } from '../lib/supabase'
import { 
  Filter, 
  Plus, 
  Zap, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Users,
  ChevronDown,
  Sparkles,
  Clock,
  Tag
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

const ADD_IDEAS_OPTIONS = [
  { value: 'from_topics', label: 'From your topics', icon: <Target className="w-4 h-4" /> },
  { value: 'from_trends', label: 'From trending topics', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'from_website', label: 'From a website', icon: <BarChart3 className="w-4 h-4" /> },
  { value: 'custom_idea', label: 'Custom idea', icon: <Plus className="w-4 h-4" /> }
]

// Mock ideas for demonstration - this will be replaced with real AI generation
const MOCK_IDEAS = [
  {
    id: '1',
    title: 'The Hidden Cost of Poor Cash Flow Forecasting',
    description: 'Share a framework for improving cash flow predictions that saved a SaaS company $2M',
    tags: ['cash-flow', 'forecasting', 'framework'],
    content_pillar: 'case_studies',
    category: 'authority',
    source_type: 'ai_generated' as const
  },
  {
    id: '2',
    title: '5 SaaS Metrics Every Series A Startup Gets Wrong',
    description: 'Breakdown of common metric mistakes and how to fix them',
    tags: ['saas-metrics', 'startup', 'mistakes'],
    content_pillar: 'saas_metrics',
    category: 'educational',
    source_type: 'ai_generated' as const
  },
  {
    id: '3',
    title: 'Why I Stopped Using Traditional Budgets (And What I Do Instead)',
    description: 'Personal story about moving from annual budgets to rolling forecasts',
    tags: ['budgeting', 'personal-story', 'innovation'],
    content_pillar: 'personal_stories',
    category: 'personal',
    source_type: 'ai_generated' as const
  },
  {
    id: '4',
    title: 'The CFO\'s Guide to AI Tool Implementation',
    description: 'Step-by-step approach for evaluating and implementing finance AI tools',
    tags: ['ai', 'tools', 'implementation'],
    content_pillar: 'tools_tech',
    category: 'authority',
    source_type: 'ai_generated' as const
  },
  {
    id: '5',
    title: 'Market Volatility: 3 Strategies That Kept Our Runway Intact',
    description: 'How we navigated 2023\'s market uncertainty with specific financial strategies',
    tags: ['market-analysis', 'strategy', 'runway'],
    content_pillar: 'market_insights',
    category: 'growth',
    source_type: 'ai_generated' as const
  },
  {
    id: '6',
    title: 'Building Finance Team Culture in Remote-First Companies',
    description: 'Leadership insights on creating strong team dynamics across distributed finance teams',
    tags: ['leadership', 'remote-work', 'team-building'],
    content_pillar: 'leadership',
    category: 'authority',
    source_type: 'ai_generated' as const
  }
]

interface IdeasPageProps {
  onWritePost: (idea: ContentIdea) => void
}

export default function IdeasPage({ onWritePost }: IdeasPageProps) {
  const { user, profile } = useAuth()
  const [ideas, setIdeas] = useState<ContentIdea[]>([])
  const [loading, setLoading] = useState(false)
  const [generatingIdeas, setGeneratingIdeas] = useState(false)
  
  // Filters
  const [topicFilter, setTopicFilter] = useState<FilterType>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>('all')
  const [showAddDropdown, setShowAddDropdown] = useState(false)

  useEffect(() => {
    loadIdeas()
  }, [user])

  const loadIdeas = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data } = await getContentIdeas(user.id)
      if (data && data.length > 0) {
        setIdeas(data)
      } else {
        // Show mock ideas for demo if no real ideas exist
        setIdeas(MOCK_IDEAS.map(idea => ({
          ...idea,
          user_id: user.id,
          status: 'active' as const,
          created_at: new Date().toISOString()
        })))
      }
    } catch (error) {
      console.error('Error loading ideas:', error)
      // Fallback to mock ideas
      setIdeas(MOCK_IDEAS.map(idea => ({
        ...idea,
        user_id: user.id,
        status: 'active' as const,
        created_at: new Date().toISOString()
      })))
    } finally {
      setLoading(false)
    }
  }

  const generateMoreIdeas = async () => {
    if (!user || !profile) return
    
    setGeneratingIdeas(true)
    
    // Simulate AI idea generation
    setTimeout(() => {
      const newMockIdeas = [
        {
          id: `new-${Date.now()}-1`,
          user_id: user.id,
          title: 'The 3-2-1 Rule for Finance Team Productivity',
          description: 'A simple framework that increased our team output by 40%',
          tags: ['productivity', 'framework', 'team-management'],
          content_pillar: 'leadership',
          category: 'authority',
          source_type: 'ai_generated' as const,
          status: 'active' as const,
          created_at: new Date().toISOString()
        },
        {
          id: `new-${Date.now()}-2`,
          user_id: user.id,
          title: 'Why Your SaaS Unit Economics Are Probably Wrong',
          description: 'Common calculation errors that inflate your unit economics',
          tags: ['unit-economics', 'saas', 'mistakes'],
          content_pillar: 'saas_metrics',
          category: 'educational',
          source_type: 'ai_generated' as const,
          status: 'active' as const,
          created_at: new Date().toISOString()
        }
      ]
      
      setIdeas(prev => [...newMockIdeas, ...prev])
      setGeneratingIdeas(false)
    }, 2000)
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Ideas</h1>
            <p className="text-gray-600 mt-2">
              AI-generated content ideas tailored to your expertise and goals
            </p>
          </div>
          
          <button
            onClick={generateMoreIdeas}
            disabled={generatingIdeas}
            className="bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
          >
            {generatingIdeas ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate Ideas
              </>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Topic:</label>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value as FilterType)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {CONTENT_PILLARS.map(pillar => (
                <option key={pillar.value} value={pillar.value}>
                  {pillar.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as CategoryType)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="relative ml-auto">
            <button
              onClick={() => setShowAddDropdown(!showAddDropdown)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              <Plus className="w-4 h-4" />
              Add ideas
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showAddDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                {ADD_IDEAS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      // Handle different add idea options
                      setShowAddDropdown(false)
                      if (option.value === 'from_topics') {
                        generateMoreIdeas()
                      }
                    }}
                  >
                    {option.icon}
                    {option.label}
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
          <p className="text-gray-600">Loading your content ideas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map((idea) => (
            <div
              key={idea.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Content Pillar Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3 ${getCategoryColor(idea.content_pillar || '')}`}>
                {getCategoryIcon(idea.content_pillar || '')}
                {CONTENT_PILLARS.find(p => p.value === idea.content_pillar)?.label || 'General'}
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                {idea.title}
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {idea.description}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {idea.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {new Date(idea.created_at).toLocaleDateString()}
                </div>
                
                <button
                  onClick={() => onWritePost(idea)}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition"
                >
                  Write this post
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredIdeas.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas yet</h3>
          <p className="text-gray-600 mb-4">
            Generate your first batch of AI-powered content ideas to get started.
          </p>
          <button
            onClick={generateMoreIdeas}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700"
          >
            Generate Ideas
          </button>
        </div>
      )}
    </div>
  )
}
