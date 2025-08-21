'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ContentIdea, createContentIdea, getContentIdeas, updateContentIdea } from '../lib/supabase'
import { Crown, Filter, Search, X, Plus, Edit3, Trash2, Archive, BarChart3, Users, Target, TrendingUp, Sparkles, Zap, ArrowRight, ChevronDown, Tag, Clock } from 'lucide-react'

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

interface IdeaLibraryProps {
  onUseInStandardMode?: (idea: ContentIdea) => void
  onUseInWriterSuite?: (idea: ContentIdea) => void
  onUseThisContent?: (idea: ContentIdea) => void
}

export default function IdeaLibrary({ onUseInStandardMode, onUseInWriterSuite, onUseThisContent }: IdeaLibraryProps) {
  const { user, profile } = useAuth()
  const [ideas, setIdeas] = useState<ContentIdea[]>([])
  const [loading, setLoading] = useState(false)
  
  // Status sections instead of filters
  const [activeSection, setActiveSection] = useState<'active' | 'used' | 'archived'>('active')
  const [selectedIdeaForOverlay, setSelectedIdeaForOverlay] = useState<ContentIdea | null>(null)

  // Load saved ideas on mount
  useEffect(() => {
    loadSavedIdeas()
  }, [user])

  const loadSavedIdeas = async () => {
  if (!user) return
  
  setLoading(true)
  try {
    const { data, error } = await getContentIdeas(user.id, 100)
    if (error) throw error
    
    setIdeas(data || [])
  } catch (error) {
    console.error('Error loading saved ideas:', error)
    setIdeas([])
  } finally {
    setLoading(false)
  }
}

  const sectionedIdeas = {
    active: ideas.filter(idea => idea.status === 'active'),
    used: ideas.filter(idea => idea.status === 'used'), 
    archived: ideas.filter(idea => idea.status === 'archived')
  }
  
  const currentIdeas = sectionedIdeas[activeSection]

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

  const handleUpdateIdea = async (ideaId: string, updates: Partial<ContentIdea>) => {
  try {
    const { error } = await updateContentIdea(ideaId, updates)
    if (error) throw error
    
    // Refresh the ideas list
    loadSavedIdeas()
    
    // Show success message
    console.log('Idea updated successfully')
  } catch (error) {
    console.error('Error updating idea:', error)
  }
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
            {currentIdeas.length} ideas in {activeSection === 'active' ? 'Fresh Ideas' : activeSection === 'used' ? 'Used' : 'Archived'}
          </div>
        </div>

        {/* Status Sections */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveSection('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeSection === 'active' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Fresh Ideas ({sectionedIdeas.active.length})
          </button>
          <button
            onClick={() => setActiveSection('used')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeSection === 'used' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Used ({sectionedIdeas.used.length})
          </button>
          <button
            onClick={() => setActiveSection('archived')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeSection === 'archived' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Archived ({sectionedIdeas.archived.length})
          </button>
        </div>
      </div>

      {/* Ideas Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your saved ideas...</p>
        </div>
) : currentIdeas.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas found</h3>
          <p className="text-gray-600">
            {activeSection === 'active' 
              ? "You haven't saved any ideas yet. Visit the Ideas Hub to start brainstorming!"
              : activeSection === 'used'
                ? "No used ideas yet. Complete a content creation workflow to see ideas here."
                : "No archived ideas yet."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentIdeas.map((idea) => (
            <div
              key={idea.id}
              onClick={() => setSelectedIdeaForOverlay(idea)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer group"
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
  {formatTimeAgo(idea.created_at)}
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
              
              {/* Click indicator */}
              <div className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors">
                Click to view details →
              </div>
</div>
          ))}
        </div>
     )}

      {/* Rich Data Overlay Modal */}
      {selectedIdeaForOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{selectedIdeaForOverlay.title}</h3>
              <button
                onClick={() => setSelectedIdeaForOverlay(null)}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700">{selectedIdeaForOverlay.description}</p>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIdeaForOverlay.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rich Data from source_data */}
                {selectedIdeaForOverlay.source_data && (
                  <div className="space-y-4">
                    {selectedIdeaForOverlay.source_data.content_type && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Content Type</h4>
                        <p className="text-gray-700 capitalize">{selectedIdeaForOverlay.source_data.content_type.replace('_', ' ')}</p>
                      </div>
                    )}

                    {selectedIdeaForOverlay.source_data.hooks && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Available Hooks</h4>
                        <div className="space-y-2">
                          {selectedIdeaForOverlay.source_data.hooks.map((hook: string, index: number) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-600">Option {index + 1}:</span>
                              <p className="text-gray-800 mt-1">"{hook}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedIdeaForOverlay.source_data.pain_points_and_struggles && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Pain Points & Struggles</h4>
                        <p className="text-gray-700">{selectedIdeaForOverlay.source_data.pain_points_and_struggles}</p>
                      </div>
                    )}

                    {selectedIdeaForOverlay.source_data.personal_story && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Personal Story</h4>
                        <p className="text-gray-700">{selectedIdeaForOverlay.source_data.personal_story}</p>
                      </div>
                    )}

                    {selectedIdeaForOverlay.source_data.concrete_evidence && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Concrete Evidence</h4>
                        <p className="text-gray-700">{selectedIdeaForOverlay.source_data.concrete_evidence}</p>
                      </div>
                    )}

                    {selectedIdeaForOverlay.source_data.audience_and_relevance && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Audience & Relevance</h4>
                        <p className="text-gray-700">{selectedIdeaForOverlay.source_data.audience_and_relevance}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="border-t border-gray-200 p-6">
              <button
                onClick={() => {
                  onUseThisContent?.(selectedIdeaForOverlay)
                  setSelectedIdeaForOverlay(null)
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white text-lg font-medium rounded-lg hover:bg-teal-700 transition"
              >
                <ArrowRight className="w-5 h-5" />
                Use This Topic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
