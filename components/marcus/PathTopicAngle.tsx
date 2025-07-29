'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Search, TrendingUp, User, BarChart3, Zap, Target, Brain, CheckCircle, Eye, Lightbulb, MessageCircle } from 'lucide-react'
import AIAssistant from './AIAssistant'
import { useContent } from '../../contexts/ContentContext'
import { useToast } from '../ToastNotifications'
import { GeneratedContent } from '../../lib/supabase'

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

interface StorySection {
  id: string
  title: string
  content: string
  guidance: string
  placeholder: string
  completed: boolean
}

export default function PathTopicAngle({ onBack }: TopicAngleProps) {
  const [currentStep, setCurrentStep] = useState<'discovery' | 'research' | 'angles' | 'development' | 'preview'>('discovery')
  const [topic, setTopic] = useState('')
  const [researchData, setResearchData] = useState<any>(null)
  const [selectedAngle, setSelectedAngle] = useState<AngleOption | null>(null)
  const [storySections, setStorySections] = useState<StorySection[]>([])
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [finalContent, setFinalContent] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const { saveDraft, setSelectedContent, setShowScheduleModal } = useContent()
  const { showToast } = useToast()

  // Initialize story sections when angle is selected
  useEffect(() => {
    if (selectedAngle && currentStep === 'development') {
      const sections = generateStorySections(selectedAngle, topic)
      setStorySections(sections)
      setCurrentSectionIndex(0)
    }
  }, [selectedAngle, currentStep, topic])

  const generateStorySections = (angle: AngleOption, topicText: string): StorySection[] => {
    const sectionTemplates = {
      'personal': [
        {
          id: 'hook',
          title: 'Personal Hook',
          guidance: `Start with a vulnerable, specific admission about your ${topicText} experience. Make it relatable and shocking enough to stop the scroll.`,
          placeholder: `The ${topicText} mistake that nearly destroyed my career...`
        },
        {
          id: 'context',
          title: 'Setup Context',
          guidance: `Explain the situation and why your decision seemed logical at the time. Help readers think "I would have done the same thing."`,
          placeholder: `I was 6 months from running out of money, under massive pressure...`
        },
        {
          id: 'conflict',
          title: 'The Conflict',
          guidance: `Describe what went wrong with specific details. Include costs - time, money, relationships. Make the stakes clear.`,
          placeholder: `8 months later, everything fell apart. The team lost confidence...`
        },
        {
          id: 'insight',
          title: 'Key Insight',
          guidance: `Share the universal principle you learned. This is the value you're providing - make it actionable for others.`,
          placeholder: `The lesson: Personal trust and professional competence are completely different...`
        },
        {
          id: 'resolution',
          title: 'How You Do It Now',
          guidance: `Give readers a practical system or approach they can use. Show you've learned and changed.`,
          placeholder: `Now I have a strict policy: friends can join the team, but never in critical roles...`
        },
        {
          id: 'cta',
          title: 'Engagement Question',
          guidance: `Ask a specific question that invites sharing. Avoid generic questions like "What do you think?"`,
          placeholder: `Have you ever mixed business with friendship? How did you handle it?`
        }
      ],
      'data': [
        {
          id: 'hook',
          title: 'Data Hook',
          guidance: `Lead with your most surprising statistic about ${topicText}. Make it counter-intuitive and credible.`,
          placeholder: `73% of companies are making this ${topicText} mistake (and don't know it)...`
        },
        {
          id: 'problem',
          title: 'The Problem',
          guidance: `Explain why conventional wisdom about ${topicText} is wrong. Use logic and real examples.`,
          placeholder: `Here's why this is dangerous: most leaders think ${topicText} is...`
        },
        {
          id: 'evidence',
          title: 'Supporting Evidence',
          guidance: `Provide credible data, studies, or compelling examples that back up your contrarian position.`,
          placeholder: `My analysis of 200+ companies revealed that...`
        },
        {
          id: 'solution',
          title: 'Better Approach',
          guidance: `Give readers a superior alternative they can implement. Be specific and actionable.`,
          placeholder: `Here's what high-performing companies do instead...`
        },
        {
          id: 'cta',
          title: 'Data Question',
          guidance: `Ask about their experience with the data or conventional approach you're challenging.`,
          placeholder: `What metrics have surprised you in your ${topicText} experience?`
        }
      ],
      'contrarian': [
        {
          id: 'hook',
          title: 'Contrarian Hook',
          guidance: `Challenge the popular belief about ${topicText} with a bold, debate-sparking statement.`,
          placeholder: `Everyone says ${topicText} is the key to success. They're wrong.`
        },
        {
          id: 'conventional',
          title: 'Conventional Wisdom',
          guidance: `Clearly state what most people believe about ${topicText} and why it's popular.`,
          placeholder: `The conventional wisdom is that you should...`
        },
        {
          id: 'counter',
          title: 'Counter-Argument',
          guidance: `Present your contrarian view with specific reasons why the popular approach fails.`,
          placeholder: `But here's what actually happens when you follow this advice...`
        },
        {
          id: 'evidence',
          title: 'Supporting Evidence',
          guidance: `Back up your contrarian position with data, examples, or logical reasoning.`,
          placeholder: `I analyzed 150+ cases and found that...`
        },
        {
          id: 'alternative',
          title: 'Your Alternative',
          guidance: `Provide your superior approach to ${topicText}. Make it actionable and specific.`,
          placeholder: `Here's what works better...`
        },
        {
          id: 'cta',
          title: 'Debate Question',
          guidance: `Ask a question that invites discussion and potentially debate about your contrarian view.`,
          placeholder: `Am I wrong about this? What's been your experience with ${topicText}?`
        }
      ]
    }

    return sectionTemplates[angle.type].map(template => ({
      ...template,
      content: '',
      completed: false
    }))
  }

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

  const handleSectionChange = (content: string) => {
    setStorySections(prev => prev.map((section, index) => 
      index === currentSectionIndex 
        ? { ...section, content, completed: content.trim().length > 20 }
        : section
    ))
  }

  const goToNextSection = () => {
    if (currentSectionIndex < storySections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
    }
  }

  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
    }
  }

  const generateFullContent = (): string => {
    return storySections.map(section => section.content).filter(content => content.trim()).join('\n\n')
  }

  const handlePreview = () => {
    setShowPreview(true)
  }

  const handleComplete = () => {
    const fullContent = generateFullContent()
    setFinalContent(fullContent)
    setCurrentStep('preview')
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

  const renderAngleDevelopment = () => {
    if (!selectedAngle || storySections.length === 0) {
      return <div>Loading...</div>
    }

    const currentSection = storySections[currentSectionIndex]
    const completedSections = storySections.filter(section => section.completed).length
    const progress = (completedSections / storySections.length) * 100

    if (showPreview) {
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Preview</h1>
              <p className="text-gray-600">Review your {selectedAngle.title.toLowerCase()}</p>
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Editing</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {generateFullContent()}
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowPreview(false)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Continue Editing
            </button>
            <button
              onClick={handleComplete}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete & Save</span>
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Develop Your {selectedAngle.title}</h1>
            <p className="text-gray-600">Section {currentSectionIndex + 1} of {storySections.length} • Topic: "{topic}"</p>
          </div>
          <button
            onClick={() => setCurrentStep('angles')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Choose Different Angle</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{completedSections} of {storySections.length} sections completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Section Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Story Sections</h3>
              <div className="space-y-3">
                {storySections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSectionIndex(index)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      index === currentSectionIndex
                        ? 'bg-teal-50 border-2 border-teal-200 text-teal-900'
                        : section.completed
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{index + 1}. {section.title}</div>
                        <div className="text-xs mt-1 opacity-75">
                          {section.content ? `${section.content.length} characters` : 'Not started'}
                        </div>
                      </div>
                      {section.completed && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  {currentSection.title}
                </h2>
                
                {/* Guidance */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Marcus's Guidance:</p>
                      <p className="text-sm text-blue-800">{currentSection.guidance}</p>
                    </div>
                  </div>
                </div>

                {/* Writing Area */}
                <div className="mb-6">
                  <textarea
                    value={currentSection.content}
                    onChange={(e) => handleSectionChange(e.target.value)}
                    placeholder={currentSection.placeholder}
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-vertical"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>{currentSection.content.length} characters</span>
                    <span>Minimum 20 characters for completion</span>
                  </div>
                </div>

                {/* AI Suggestions */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-teal-600" />
                    <span>Marcus's AI Suggestions</span>
                  </h4>
                  <AIAssistant
                    content={currentSection.content}
                    sectionType={currentSection.title}
                    formulaId={selectedAngle.type}
                    onApplySuggestion={(suggestion) => {
                      const improvedContent = currentSection.content + '\n\n' + suggestion
                      handleSectionChange(improvedContent)
                    }}
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={goToPreviousSection}
                  disabled={currentSectionIndex === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                    currentSectionIndex === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={handlePreview}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </button>

                  {currentSectionIndex === storySections.length - 1 ? (
                    <button
                      onClick={handleComplete}
                      disabled={completedSections < storySections.length}
                      className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition ${
                        completedSections < storySections.length
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-teal-600 text-white hover:bg-teal-700'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete</span>
                    </button>
                  ) : (
                    <button
                      onClick={goToNextSection}
                      className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderFinalPreview = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎉 Your {selectedAngle?.title} is Complete!</h1>
          <p className="text-gray-600">Content about "{topic}" ready to publish</p>
        </div>
        <button
          onClick={() => setCurrentStep('development')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Edit</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {finalContent}
          </div>
        </div>
      </div>

      {/* Performance Prediction */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-green-900 mb-4">📊 Expected Performance:</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {selectedAngle?.audienceFit}%
            </div>
            <div className="text-sm text-green-800">audience fit score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {selectedAngle?.type === 'contrarian' ? '60%' : 
               selectedAngle?.type === 'personal' ? '40%' : '35%'}
            </div>
            <div className="text-sm text-green-800">more engagement</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {researchData?.trendingBoost}
            </div>
            <div className="text-sm text-green-800">trending boost</div>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setCurrentStep('development')}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          Edit Content
        </button>
        <button
          onClick={async () => {
  try {
    const saved = await saveDraft({
      content_text: finalContent,
      content_type: selectedAngle?.type === 'personal' ? 'story' : 
                   selectedAngle?.type === 'data' ? 'metrics' : 'trend',
      tone_used: selectedAngle?.type || 'professional',
      prompt_input: topic,
      is_saved: true,
      title: `${selectedAngle?.title} - ${topic}`
    })
    
    if (saved) {
      showToast('success', 'Content saved successfully!')
      setSelectedContent(saved)
      setShowScheduleModal(true)
    }
  } catch (error) {
    showToast('error', 'Failed to save content')
  }
}}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center space-x-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Save & Publish</span>
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
    case 'preview':
      return renderFinalPreview()
    default:
      return renderTopicDiscovery()
  }
}
