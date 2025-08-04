'use client'

import { useState, useEffect } from 'react'
import { Zap, Sparkles, Clock, Calendar, ArrowRight } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { useToast } from './ToastNotifications'
import { useWorkflow } from '../contexts/WorkflowContext'
import { GeneratedContent } from '../lib/supabase'

interface ExpressGeneratorProps {
  onSwitchMode: (mode: 'standard' | 'power') => void
  onBack: () => void
  ideationData?: {
  topic: string
  angle: string
  takeaways: string[]
  source_page: string
  session_id?: string
}
}

export default function ExpressGenerator({ onSwitchMode, onBack, ideationData }: ExpressGeneratorProps) {
  const [topic, setTopic] = useState(ideationData?.topic || '')
  const [contentType, setContentType] = useState('auto')
  const [tone, setTone] = useState('auto')
  const [urgency, setUrgency] = useState('this_week')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0)
  const { moveToCreate } = useWorkflow()

  // Rotating placeholder suggestions
  const placeholders = [
    "SaaS metrics every CFO should track",
    "Budget variance analysis mistakes", 
    "Cash flow forecasting best practices",
    "Finance team productivity tips",
    "Year-end close process optimization"
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleGenerate = async () => {
  if (!topic.trim()) return
  
  setIsGenerating(true)
  
  // Track workflow progression if coming from ideation
  if (ideationData) {
    try {
      await moveToCreate('express')
    } catch (error) {
      console.error('Error tracking workflow:', error)
    }
  }
  
  // Simulate AI generation
  setTimeout(() => {
    setIsGenerating(false)
    setShowResults(true)
  }, 2500)
}

  if (showResults) {
  return (
    <ExpressResults 
      topic={topic} 
      ideationData={ideationData}
      onBack={() => setShowResults(false)} 
    />
  )
}

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="text-slate-600 hover:text-slate-800 mb-4 transition"
        >
          ← Back to Mode Selection
        </button>
        
        <div className="flex items-center space-x-3 mb-4">
  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
    <Zap className="w-5 h-5 text-white" />
  </div>
  <div>
    <h1 className="text-2xl font-bold text-gray-900">Express Mode</h1>
    <p className="text-gray-600">
      {ideationData ? 'Creating content from your ideation' : 'Quick & smart content creation'}
    </p>
  </div>
</div>

{/* Ideation Context Display */}
{ideationData && (
  <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-4 mb-6">
    <div className="flex items-center space-x-2 mb-3">
      <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-teal-600" />
      </div>
      <h3 className="font-semibold text-gray-900">From Your Ideation Session</h3>
    </div>
    <div className="space-y-2 text-sm">
      <div><span className="font-medium text-gray-700">Angle:</span> <span className="text-gray-600">{ideationData.angle}</span></div>
      <div><span className="font-medium text-gray-700">Key Points:</span> <span className="text-gray-600">{ideationData.takeaways.length} takeaways ready to use</span></div>
    </div>
  </div>
)}
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* Topic Input */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-900 mb-3">
  {ideationData ? 'Your topic (from ideation)' : 'What do you want to write about?'}
</label>
          <input
  type="text"
  value={topic}
  onChange={(e) => setTopic(e.target.value)}
  placeholder={ideationData ? ideationData.topic : placeholders[currentPlaceholder]}
  className={`w-full px-4 py-4 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
    ideationData ? 'border-teal-300 bg-teal-50' : 'border-gray-300'
  }`}
/>
        </div>

        {/* Quick Options */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Options (Optional)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="auto">Auto (AI decides)</option>
                <option value="framework">Framework</option>
                <option value="story">Story</option>
                <option value="trend">Trend Take</option>
                <option value="mistake">Mistake Story</option>
              </select>
              {contentType === 'auto' && (
                <p className="text-xs text-blue-600 mt-1">AI will choose the best format</p>
              )}
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="auto">Auto (AI decides)</option>
                <option value="professional">Professional</option>
                <option value="bold">Bold</option>
                <option value="insightful">Insightful</option>
              </select>
              {tone === 'auto' && (
                <p className="text-xs text-blue-600 mt-1">AI will match your style</p>
              )}
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">When to post</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="this_week">This Week</option>
                <option value="custom">Custom Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Need more control?{' '}
            <button
              onClick={() => onSwitchMode('standard')}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Switch to Standard
            </button>
            {' or '}
            <button
              onClick={() => onSwitchMode('power')}
              className="text-purple-600 hover:text-purple-700 font-medium underline"
            >
              Try Writer Suite
            </button>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate 3 Drafts</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Results component
function ExpressResults({ 
  topic, 
  ideationData, 
  onBack 
}: { 
  topic: string; 
  ideationData?: { topic: string; angle: string; takeaways: string[]; source_page?: string; session_id?: string }; 
  onBack: () => void 
}) {
  const [selectedDraft, setSelectedDraft] = useState(0)
  const [schedulingMode, setSchedulingMode] = useState<'quick' | 'custom'>('quick')
  const { saveDraft, setSelectedContent, setShowScheduleModal } = useContent()
  const { showToast } = useToast()

  // Mock generated drafts
  const drafts = [
    {
      type: 'AI Recommended',
      content: `🎯 5 Key ${topic} Insights Every CFO Needs\n\nAfter analyzing 200+ finance teams, here's what separates high performers:\n\n1️⃣ Real-time visibility into cash flow\n2️⃣ Automated variance analysis\n3️⃣ Predictive forecasting models\n4️⃣ Cross-departmental collaboration\n5️⃣ Continuous process optimization\n\nThe companies implementing all 5 see 40% faster month-end close.\n\nWhich of these is your biggest challenge?\n\n#CFO #Finance #Efficiency`,
      aiRecommended: true
    },
    {
      type: 'Professional',
      content: `Strategic approach to ${topic.toLowerCase()}:\n\nBased on industry best practices, successful organizations focus on these core areas:\n\n• Comprehensive data analysis\n• Stakeholder alignment\n• Process standardization\n• Technology integration\n• Performance measurement\n\nImplementing these elements creates measurable improvements in operational efficiency and strategic decision-making.\n\n#Finance #Strategy #BusinessGrowth`,
      aiRecommended: false
    },
    {
      type: 'Story-driven',
      content: `The ${topic.toLowerCase()} mistake that cost us $2M\n\n6 months ago, we thought we had everything under control.\n\nOur dashboards looked good. Reports were on time. Leadership was happy.\n\nThen we discovered the hidden problem...\n\n[Thread continues with specific lessons learned]\n\nThe lesson: Don't wait for problems to find you.\n\n#LessonsLearned #Finance #Leadership`,
      aiRecommended: false
    }
  ]

  const quickTimeSlots = [
    { label: 'In 1 hour', value: 'in_1_hour' },
    { label: 'Tomorrow 9AM', value: 'tomorrow_9am' },
    { label: 'Next Monday', value: 'next_monday' },
    { label: 'Custom time...', value: 'custom' }
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-slate-600 hover:text-slate-800 mb-4 transition"
        >
          ← Back to Edit
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Your 3 Generated Drafts</h2>
        <p className="text-gray-600">AI analyzed your topic and created these variations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Draft Selection */}
        <div className="lg:col-span-2">
          <div className="space-y-4 mb-6">
            {drafts.map((draft, index) => (
              <button
                key={index}
                onClick={() => setSelectedDraft(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  selectedDraft === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{draft.type}</span>
                  {draft.aiRecommended && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      AI Recommends
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">{draft.content}</p>
              </button>
            ))}
          </div>

          {/* Selected Draft Preview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Preview: {drafts[selectedDraft].type}</h3>
            <div className="text-gray-800 whitespace-pre-line leading-relaxed">
              {drafts[selectedDraft].content}
            </div>
          </div>
        </div>

        {/* Scheduling Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Schedule Post</h3>
            
            <div className="space-y-3">
              {quickTimeSlots.map((slot) => (
                <button
                  key={slot.value}
                  onClick={() => {
                    if (slot.value === 'custom') {
                      setSchedulingMode('custom')
                    } else {
                      // Handle quick scheduling
                      console.log('Schedule for:', slot.value)
                    }
                  }}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition flex items-center justify-between"
                >
                  <span className="text-gray-800">{slot.label}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
<button 
                onClick={async () => {
  try {
    const saved = await saveDraft({
      content_text: drafts[selectedDraft].content,
      content_type: 'framework',
      tone_used: 'professional',
      prompt_input: topic,
      is_saved: true,
      title: `Express Mode - ${topic}`,
      status: 'draft',
      ideation_session_id: ideationData?.session_id,
      source_page: ideationData?.source_page
    }, 'express')
    
    if (saved) {
      showToast('success', 'Content saved to Production Pipeline!')
    }
  } catch (error) {
    showToast('error', 'Failed to save draft')
  }
}}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Save & Schedule
              </button>
              <button 
  onClick={async () => {
    try {
      const saved = await saveDraft({
        content_text: drafts[selectedDraft].content,
        content_type: 'framework',
        tone_used: 'professional',
        prompt_input: topic,
        is_saved: true,
        title: `Express Mode - ${topic}`,
        status: 'draft',
        ideation_session_id: ideationData?.session_id,
        source_page: ideationData?.source_page
      }, 'express')
      
      if (saved) {
        showToast('success', 'Content saved to Production Pipeline!')
      }
    } catch (error) {
      showToast('error', 'Failed to save draft')
    }
  }}
  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition"
>
  Save as Draft
</button>
              <button className="w-full text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition">
                Edit in Standard Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
