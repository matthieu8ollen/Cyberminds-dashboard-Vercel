'use client'

import { useState } from 'react'
import { Sparkles, Smartphone, MessageSquare, BarChart3, Download, Save, CheckCircle } from 'lucide-react'

interface Enhancement {
  id: string
  type: 'engagement' | 'mobile' | 'voice' | 'performance'
  title: string
  description: string
  before: string
  after: string
  impact: string
  applied: boolean
}

interface WriterSuiteStep5Props {
  topic: string
  selectedAngle: any
  selectedFormula: any
  sections: Record<string, string>
  onFinish: (data: { finalContent: string; enhancements: Enhancement[] }) => void
  onBack: () => void
}

export default function WriterSuiteStep5({ 
  topic, 
  selectedAngle, 
  selectedFormula, 
  sections, 
  onFinish, 
  onBack 
}: WriterSuiteStep5Props) {
  const [enhancements, setEnhancements] = useState<Enhancement[]>([
    {
      id: 'engagement-1',
      type: 'engagement',
      title: 'Stronger Hook',
      description: 'Make opening more definitive and punchy',
      before: 'Most founders think it\'s a compensation problem.',
      after: 'Most founders think it\'s just about money. They\'re wrong.',
      impact: 'Shorter, more definitive statement creates stronger hook',
      applied: false
    },
    {
      id: 'engagement-2', 
      type: 'engagement',
      title: 'Add Emotional Trigger',
      description: 'Include personal stakes to increase engagement',
      before: 'Here\'s what the data shows...',
      after: 'Here\'s what cost me $50k to learn...',
      impact: 'Personal cost creates immediate emotional investment',
      applied: false
    }
  ])

  const [mobileOptimizations, setMobileOptimizations] = useState([
    'Break long paragraph in section 3 into bullet points',
    'Add line breaks for better readability',
    'Optimize for thumb-scrolling with shorter sentences'
  ])

  const [voiceConsistency] = useState({
    score: 92,
    suggestion: 'Your Growth Executive voice is 92% consistent. Suggested adjustment in section 4 for better authority.'
  })

  const [performancePrediction] = useState({
    engagementScore: 8.2,
    ranking: '25%',
    predictedLikes: '45-67',
    predictedComments: '12-18',
    predictedShares: '8-15'
  })

  const [appliedEnhancements, setAppliedEnhancements] = useState<string[]>([])

  const applyEnhancement = (enhancementId: string) => {
    setEnhancements(prev => 
      prev.map(e => 
        e.id === enhancementId ? { ...e, applied: true } : e
      )
    )
    setAppliedEnhancements(prev => [...prev, enhancementId])
  }

  const skipEnhancement = (enhancementId: string) => {
    setEnhancements(prev => prev.filter(e => e.id !== enhancementId))
  }

  const applyAllMobileFixes = () => {
    // In real app, this would modify the content
    console.log('Applied all mobile optimizations')
  }

  const applyAllSuggestions = () => {
    setEnhancements(prev => prev.map(e => ({ ...e, applied: true })))
    setAppliedEnhancements(enhancements.map(e => e.id))
    applyAllMobileFixes()
  }

  const handleExportFinal = () => {
    const finalContent = Object.values(sections).join('\n\n')
    onFinish({ 
      finalContent, 
      enhancements: enhancements.filter(e => e.applied) 
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-slate-700 to-teal-600 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">✨ AI Enhancement Suggestions</h1>
        <p className="text-gray-600">Your draft is complete! Here's how we can improve it:</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-700">{Object.keys(sections).length}</div>
          <div className="text-sm text-gray-600">Sections Complete</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{voiceConsistency.score}%</div>
          <div className="text-sm text-gray-600">Voice Consistency</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className={`text-2xl font-bold ${getScoreColor(performancePrediction.engagementScore)}`}>
            {performancePrediction.engagementScore}/10
          </div>
          <div className="text-sm text-gray-600">Engagement Score</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-teal-600">Top {performancePrediction.ranking}</div>
          <div className="text-sm text-gray-600">Predicted Performance</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhancement Suggestions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 🎯 Engagement Optimizations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">🎯 Engagement Optimizations:</h3>
            </div>
            
            <div className="space-y-4">
              {enhancements.filter(e => e.type === 'engagement').map((enhancement) => (
                <div key={enhancement.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">{enhancement.title}</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => applyEnhancement(enhancement.id)}
                        disabled={enhancement.applied}
                        className={`px-3 py-1 rounded text-sm font-medium transition ${
                          enhancement.applied
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-700 text-white hover:bg-slate-800'
                        }`}
                      >
                        {enhancement.applied ? 'Applied' : 'Apply'}
                      </button>
                      <button
                        onClick={() => skipEnhancement(enhancement.id)}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm transition"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="text-sm mb-2">
                      <span className="font-medium text-gray-700">Current:</span> "{enhancement.before}"
                    </div>
                    <div className="text-sm mb-2">
                      <span className="font-medium text-gray-700">Enhanced:</span> "{enhancement.after}"
                    </div>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Why:</span> {enhancement.impact}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 📱 Mobile Optimization */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-gray-900">📱 Mobile Optimization:</h3>
              </div>
              <button
                onClick={applyAllMobileFixes}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 text-sm font-medium transition"
              >
                Apply All Mobile Fixes
              </button>
            </div>

            <ul className="space-y-2">
              {mobileOptimizations.map((optimization, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
                  <span>{optimization}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 🔍 Voice Consistency */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-gray-900">🔍 Voice Consistency:</h3>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-700 mb-2">{voiceConsistency.suggestion}</p>
              <button className="text-sm text-slate-600 hover:text-slate-700 font-medium">
                View Details →
              </button>
            </div>
          </div>
        </div>

        {/* Performance & Actions Sidebar */}
        <div className="space-y-6">
          
          {/* Performance Prediction */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">📊 Performance Prediction:</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Engagement Score:</span>
                <span className={`font-bold ${getScoreColor(performancePrediction.engagementScore)}`}>
                  {performancePrediction.engagementScore}/10
                </span>
              </div>
              
              <div className="text-sm text-gray-700 bg-green-50 rounded-lg p-3">
                This post is predicted to perform in top {performancePrediction.ranking}
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <div>Expected: {performancePrediction.predictedLikes} likes</div>
                <div>Expected: {performancePrediction.predictedComments} comments</div>
                <div>Expected: {performancePrediction.predictedShares} shares</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button
                onClick={applyAllSuggestions}
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 font-medium transition flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Apply All Suggestions</span>
              </button>
              
              <button
                onClick={handleExportFinal}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Final</span>
              </button>
              
              <button className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition flex items-center justify-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>
            </div>
          </div>

          {/* Applied Enhancements */}
          {appliedEnhancements.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Applied Enhancements</span>
              </h3>
              
              <div className="space-y-2">
                {appliedEnhancements.map((id, index) => {
                  const enhancement = enhancements.find(e => e.id === id)
                  return (
                    <div key={id} className="flex items-center space-x-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span>{enhancement?.title}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition"
        >
          ← Back to Writing
        </button>

        <div className="flex space-x-4">
          <button
            onClick={() => console.log('Save draft')}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition"
          >
            Save Draft
          </button>
          
          <button
            onClick={handleExportFinal}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Final Content</span>
          </button>
        </div>
      </div>

      {/* Progress Indicator - Complete! */}
      <div className="mt-8 flex justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-2 bg-teal-600 rounded-full"></div>
          <div className="w-8 h-2 bg-teal-600 rounded-full"></div>
          <div className="w-8 h-2 bg-teal-600 rounded-full"></div>
          <div className="w-8 h-2 bg-teal-600 rounded-full"></div>
          <div className="w-8 h-2 bg-teal-600 rounded-full"></div>
        </div>
        <span className="ml-4 text-sm text-green-600 font-medium">✓ Complete!</span>
      </div>
    </div>
  )
}
