'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Search, TrendingUp, User, BarChart3, Zap, Target, Brain, CheckCircle } from 'lucide-react'

interface TopicAngleProps {
  onBack: () => void
}

interface AngleOption {
  id: string
  type: 'personal' | 'data' | 'contrarian'
  title: string
  description: string
  psychology: string
  audienceFit: number
  example: string
  whyItWorks: string[]
}

export default function PathTopicAngle({ onBack }: TopicAngleProps) {
  const [currentStep, setCurrentStep] = useState<'discovery' | 'research' | 'angles' | 'development'>('discovery')
  const [topic, setTopic] = useState('')
  const [topicSource, setTopicSource] = useState<'user' | 'ai'>('user')
  const [researchData, setResearchData] = useState<any>(null)
  const [selectedAngle, setSelectedAngle] = useState<AngleOption | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Step 1: Topic Discovery
  const handleTopicSubmit = () => {
    if (!topic.trim()) return
    
    setIsGenerating(true)
    setCurrentStep('research')
    
    // Simulate RAG research
    setTimeout(() => {
      const mockResearch = generateMockResearch(topic)
      setResearchData(mockResearch)
      setIsGenerating(false)
      setCurrentStep('angles')
    }, 2000)
  }

  const generateMockResearch = (searchTopic: string) => {
    return {
      sourcesFound: 14,
      breakdown: {
        personalStories: 4,
        marketReports: 6,
        tacticalGuides: 3,
        frameworks: 1
      },
      trendingBoost: '+23%',
      relatedTopics: [
        'AI impact on hiring',
        'Remote team productivity', 
        'SaaS pricing strategies'
      ]
    }
  }

  const getAnglesForTopic = (topic: string): AngleOption[] => {
    return [
      {
        id: 'personal',
        type: 'personal',
        title: 'Personal Story Angle',
        description: 'Share a vulnerable experience with lessons learned',
        psychology: 'Builds trust through vulnerability, highly relatable',
        audienceFit: 85,
        example: `"The ${topic} mistake that taught me everything about leadership"`,
        whyItWorks: [
          'Vulnerability creates instant connection',
          'Personal stories are 40% more memorable',
          'Builds authentic authority',
          'Encourages audience sharing'
        ]
      },
      {
        id: 'contrarian',
        type: 'contrarian',
        title: 'Contrarian Angle',
        description: 'Challenge conventional wisdom about this topic',
        psychology: 'Sparks debate, high engagement, positions you as thought leader',
        audienceFit: 78,
        example: `"Why everything you know about ${topic} is backwards"`,
        whyItWorks: [
          'Contrarian takes get 60% more comments',
          'Positions you as independent thinker',
          'Creates memorable content',
          'Drives discussion and shares'
        ]
      },
      {
        id: 'data',
        type: 'data',
        title: 'Data-Driven Angle',
        description: 'Share surprising industry benchmarks and insights',
        psychology: 'Provides value, establishes credibility, highly shareable',
        audienceFit: 92,
        example: `"The ${topic} metric that predicts startup success (it's not what you think)"`,
        whyItWorks: [
          'Data-backed content builds credibility',
          'Numbers increase shareability by 35%',
          'Appeals to analytical personalities',
          'Easy to quote and reference'
        ]
      }
    ]
  }

  const handleAngleSelect = (angle: AngleOption) => {
    setSelectedAngle(angle)
    setCurrentStep('development')
  }

  const renderTopicDiscovery = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Topic Discovery</h1>
          <p className="text-gray-600">What's on your mind today? Let's find the perfect angle.</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marcus</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            🔍 What topic would you like to explore?
          </label>
          <div className="relative">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., hiring challenges, remote work, pricing strategy..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleTopicSubmit()}
            />
            <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-teal-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Trending Analysis</p>
            <p className="text-xs text-gray-600">Find what's hot right now</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Psychology Insights</p>
            <p className="text-xs text-gray-600">Optimize for engagement</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Target className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Audience Fit</p>
            <p className="text-xs text-gray-600">Match your followers</p>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm font-medium text-gray-900 mb-3">💡 Popular topics this week:</p>
          <div className="flex flex-wrap gap-2">
            {[
              { topic: 'AI impact on hiring', trend: '+23%' },
              { topic: 'Remote team productivity', trend: '+18%' },
              { topic: 'SaaS pricing strategies', trend: '+15%' }
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => setTopic(item.topic)}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm flex items-center space-x-2"
              >
                <span>{item.topic}</span>
                <span className="text-xs bg-blue-200 px-1.5 py-0.5 rounded text-blue-800">
                  {item.trend}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleTopicSubmit}
            disabled={!topic.trim()}
            className={`px-8 py-3 rounded-lg font-medium transition ${
              topic.trim()
                ? 'bg-teal-600 text-white hover:bg-teal-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Research This Topic
          </button>
        </div>
      </div>
    </div>
  )

  const renderResearch = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Researching "{topic}"</h1>
        <p className="text-gray-600">Marcus is analyzing our database and trending data...</p>
      </div>

      {isGenerating ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Content Database</h3>
          <p className="text-gray-600 mb-4">Searching through founder stories, market data, and best practices...</p>
          <div className="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto">
            <div className="space-y-2 text-sm text-gray-600">
              <div>✓ Found 14 relevant sources</div>
              <div>✓ Analyzing engagement patterns</div>
              <div>✓ Identifying unique angles</div>
              <div className="flex items-center">
                <div className="animate-pulse">◯</div>
                <span className="ml-2">Generating recommendations...</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )

  const renderAngleSelection = () => {
    const angles = getAnglesForTopic(topic)

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Angle</h1>
            <p className="text-gray-600">Based on research about "{topic}", here are your best options:</p>
          </div>
          <button
            onClick={() => setCurrentStep('discovery')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Change Topic</span>
          </button>
        </div>

        {/* Research Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Research Results</h3>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{researchData?.sourcesFound}</div>
              <div className="text-sm text-blue-800">Sources Found</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{researchData?.breakdown.personalStories}</div>
              <div className="text-sm text-purple-800">Personal Stories</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{researchData?.breakdown.marketReports}</div>
              <div className="text-sm text-green-800">Market Reports</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">{researchData?.trendingBoost}</div>
              <div className="text-sm text-orange-800">Engagement Boost</div>
            </div>
          </div>
        </div>

        {/* Angle Options */}
        <div className="grid gap-6">
          {angles.map((angle) => (
            <div
              key={angle.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-teal-500 hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => handleAngleSelect(angle)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
                    angle.type === 'personal' ? 'bg-purple-100 text-purple-600' :
                    angle.type === 'data' ? 'bg-blue-100 text-blue-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {angle.type === 'personal' ? <User className="w-6 h-6" /> :
                     angle.type === 'data' ? <BarChart3 className="w-6 h-6" /> :
                     <Zap className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{angle.title}</h3>
                    <p className="text-gray-600">{angle.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-600">{angle.audienceFit}</div>
                  <div className="text-sm text-gray-500">Audience Fit</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-900 mb-1">Example hook:</p>
                <p className="text-gray-700 italic">"{angle.example}"</p>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 mb-2">✨ Why it works:</p>
                <p className="text-sm text-gray-700">{angle.psychology}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {angle.whyItWorks.map((reason, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{reason}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <div className="flex items-center text-teal-600 font-medium group-hover:text-teal-700">
                  <span>Select this angle</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderAngleDevelopment = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Angle Development</h1>
          <p className="text-gray-600">Deep dive into your {selectedAngle?.title}</p>
        </div>
        <button
          onClick={() => setCurrentStep('angles')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Choose Different Angle</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Story Development Coming Soon</h3>
        <p className="text-gray-600 mb-6">Deep angle development with psychology insights and hook optimization</p>
        
        <button
          onClick={onBack}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
        >
          Back to Marcus
        </button>
      </div>
    </div>
  )

  switch (currentStep) {
    case 'discovery':
      return renderTopicDiscovery()
    case 'research':
      return renderResearch()
    case 'angles':
      return renderAngleSelection()
    case 'development':
      return renderAngleDevelopment()
    default:
      return renderTopicDiscovery()
  }
}
