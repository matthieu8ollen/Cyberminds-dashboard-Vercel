'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { createContentIdea } from '../lib/supabase'
import { Target, ArrowLeft, Lightbulb, TrendingUp, BarChart3, Users, Sparkles, Clock } from 'lucide-react'

interface TopicSuggestion {
  id: string
  title: string
  description: string
  category: 'trending' | 'evergreen' | 'seasonal' | 'industry'
  engagement_potential: 'high' | 'medium' | 'low'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_reach: string
  key_points: string[]
  hashtags: string[]
}

interface AISuggestedTopicsProps {
  onBack: () => void
  onNavigateToCreate?: (mode: 'standard' | 'power', ideationData: any) => void
}

// Mock AI-generated topics for demonstration
const SUGGESTED_TOPICS: TopicSuggestion[] = [
  {
    id: '1',
    title: 'The Hidden Cost of Manual Financial Processes',
    description: 'Explore how manual processes are secretly draining your company\'s resources and what CFOs can do about it.',
    category: 'trending',
    engagement_potential: 'high',
    difficulty: 'intermediate',
    estimated_reach: '2,500-5,000 views',
    key_points: [
      'Manual processes cost 40% more than automated ones',
      'Time wasted on repetitive tasks reduces strategic focus',
      'Implementation roadmap for automation'
    ],
    hashtags: ['#CFO', '#Automation', '#FinanceStrategy', '#Efficiency']
  },
  {
    id: '2',
    title: 'SaaS Metrics That Actually Predict Success',
    description: 'Most SaaS companies track vanity metrics. Here are the 5 metrics that actually correlate with long-term success.',
    category: 'evergreen',
    engagement_potential: 'high',
    difficulty: 'advanced',
    estimated_reach: '3,000-7,000 views',
    key_points: [
      'Revenue Quality Score beats ARR growth',
      'Customer Effort Score predicts churn better than NPS',
      'Unit economics that matter for sustainability'
    ],
    hashtags: ['#SaaS', '#Metrics', '#DataDriven', '#BusinessIntelligence']
  },
  {
    id: '3',
    title: 'Why Your Board Presentation is Failing (And How to Fix It)',
    description: 'Transform your board presentations from data dumps into compelling strategic narratives.',
    category: 'trending',
    engagement_potential: 'medium',
    difficulty: 'intermediate',
    estimated_reach: '1,500-3,500 views',
    key_points: [
      'Tell stories with your data, not just present numbers',
      'Focus on future implications, not past performance',
      'Structure for decision-making, not information sharing'
    ],
    hashtags: ['#Leadership', '#BoardManagement', '#Communication', '#Strategy']
  }
]

export default function AISuggestedTopics({ onBack, onNavigateToCreate }: AISuggestedTopicsProps) {
  const { user } = useAuth()
  const [selectedTopic, setSelectedTopic] = useState<TopicSuggestion | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [topics, setTopics] = useState<TopicSuggestion[]>([])

  useEffect(() => {
    // Simulate AI generation delay
    setIsGenerating(true)
    setTimeout(() => {
      setTopics(SUGGESTED_TOPICS)
      setIsGenerating(false)
    }, 1500)
  }, [])

  const saveTopicToLibrary = async (topic: TopicSuggestion) => {
    if (!user) return false
    
    try {
      const { data, error } = await createContentIdea({
  user_id: user.id,
  title: topic.title,
  description: topic.description,
  tags: topic.key_points,
  content_pillar: 'ai_generated',
  source_type: 'ai_generated',
  status: 'active'
})
      
      if (error) throw error
      console.log('AI suggested topic saved to library:', data)
      return true
    } catch (error) {
      console.error('Error saving topic:', error)
      return false
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trending': return <TrendingUp className="w-4 h-4" />
      case 'evergreen': return <Lightbulb className="w-4 h-4" />
      case 'seasonal': return <Clock className="w-4 h-4" />
      case 'industry': return <BarChart3 className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trending': return 'bg-red-100 text-red-800'
      case 'evergreen': return 'bg-green-100 text-green-800'
      case 'seasonal': return 'bg-blue-100 text-blue-800'
      case 'industry': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEngagementColor = (potential: string) => {
    switch (potential) {
      case 'high': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Generating Personalized Topics</h2>
          <p className="text-gray-600 mb-8">AI is analyzing trending content and your profile to suggest the best topics...</p>
          <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Ideas Hub</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">AI Suggested Topics</h1>
          <p className="text-gray-600 mt-2">
            Personalized content ideas based on trending topics and your profile
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500">Powered by AI</div>
          <div className="text-xs text-gray-400">Updated 5 minutes ago</div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className={`bg-white rounded-xl shadow-sm border-2 transition-all cursor-pointer ${
              selectedTopic?.id === topic.id
                ? 'border-teal-500 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
            onClick={() => setSelectedTopic(topic)}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(topic.category)}`}>
                  {getCategoryIcon(topic.category)}
                  {topic.category.charAt(0).toUpperCase() + topic.category.slice(1)}
                </div>
                
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getEngagementColor(topic.engagement_potential)}`}>
                  {topic.engagement_potential.toUpperCase()} potential
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {topic.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {topic.description}
              </p>

              {/* Metrics */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span>📊 {topic.estimated_reach}</span>
                <span>🎯 {topic.difficulty}</span>
              </div>

              {/* Key Points Preview */}
              <div className="space-y-1">
                {topic.key_points.slice(0, 2).map((point, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="line-clamp-1">{point}</span>
                  </div>
                ))}
                {topic.key_points.length > 2 && (
                  <div className="text-xs text-gray-500 pl-4">
                    +{topic.key_points.length - 2} more points
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Topic Actions */}
      {selectedTopic && (
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ready to create: {selectedTopic.title}
              </h3>
              <p className="text-gray-600 text-sm">
                This topic includes {selectedTopic.key_points.length} key points and suggested hashtags
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={async () => {
                // Save topic and exit without starting workflow
                const success = await saveTopicToLibrary(selectedTopic)
                if (success) {
                  console.log('💾 AI topic saved to library, exiting without workflow')
                  onBack() // Return to Ideas Hub without starting workflow
                }
              }}
              className="flex items-center justify-center space-x-2 bg-slate-100 text-slate-700 px-4 py-3 rounded-lg hover:bg-slate-200 transition font-medium border border-slate-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>💾 Save Topic & Exit</span>
            </button>

            <button
              onClick={() => {
                if (onNavigateToCreate) {
                  onNavigateToCreate('standard', {
                    topic: selectedTopic.title,
                    angle: selectedTopic.description,
                    takeaways: selectedTopic.key_points,
                    source_page: 'ai_suggested_topics',
                    hashtags: selectedTopic.hashtags
                  })
                }
              }}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Standard Mode
            </button>

            <button
              onClick={() => {
                if (onNavigateToCreate) {
                  onNavigateToCreate('power', {
                    topic: selectedTopic.title,
                    angle: selectedTopic.description,
                    takeaways: selectedTopic.key_points,
                    source_page: 'ai_suggested_topics',
                    hashtags: selectedTopic.hashtags
                  })
                }
              }}
              className="bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 transition font-medium"
            >
              Writer Suite
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
