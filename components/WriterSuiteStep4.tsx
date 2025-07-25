'use client'

import { useState } from 'react'
import { Edit3, Lightbulb, Users, Target, ChevronLeft, ChevronRight } from 'lucide-react'

interface WritingSection {
  id: string
  title: string
  instruction: string
  placeholder: string
  psychologyInsight: string
  audienceConnection: string
  example?: string
}

interface WriterSuiteStep4Props {
  topic: string
  selectedAngle: any
  selectedFormula: any
  onContinue: (data: { sections: Record<string, string> }) => void
  onBack: () => void
}

export default function WriterSuiteStep4({ 
  topic, 
  selectedAngle, 
  selectedFormula, 
  onContinue, 
  onBack 
}: WriterSuiteStep4Props) {
  const [currentSection, setCurrentSection] = useState(0)
  const [sectionContent, setSectionContent] = useState<Record<string, string>>({})
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  // Generate sections based on the selected formula
  const sections: WritingSection[] = [
    {
      id: 'hook',
      title: 'Opening Hook',
      instruction: `Use a specific, counter-intuitive statistic about ${topic}. Make it credible with source attribution. Aim for 1-2 sentences.`,
      placeholder: `73% of Series A companies struggle to hire senior talent, according to our analysis of 500+ startups.\nMost founders think it's a compensation problem.`,
      psychologyInsight: 'Specific percentages create immediate credibility. The "most people think" setup creates curiosity gap.',
      audienceConnection: `${selectedAngle?.type === 'data' ? 'Growth-stage founders' : 'Business leaders'} will immediately relate to this challenge and want to know the real solution.`
    },
    {
      id: 'problem',
      title: 'Problem Statement',
      instruction: 'Expand on why this problem matters and what most people get wrong about it.',
      placeholder: `But here's what the data actually shows...\n\nThe real issue isn't money - it's positioning.`,
      psychologyInsight: 'Creates tension between common belief and reality.',
      audienceConnection: 'Validates their experience while promising a new perspective.'
    },
    {
      id: 'insights',
      title: 'Key Insights',
      instruction: 'Share 2-3 data points or insights that support your main argument.',
      placeholder: `After analyzing 500+ hiring processes:\n\n• 68% failed because of unclear role expectations\n• 43% lost candidates during lengthy processes\n• Only 12% were actually compensation-related`,
      psychologyInsight: 'Numbered insights feel comprehensive and authoritative.',
      audienceConnection: 'Provides concrete evidence they can relate to their own experience.'
    },
    {
      id: 'solution',
      title: 'Solution Framework',
      instruction: 'Present your recommended approach or framework.',
      placeholder: `Here's the 3-step framework that works:\n\n1. Define the role in terms of outcomes, not tasks\n2. Create a 48-hour decision timeline\n3. Show, don't tell, your company culture`,
      psychologyInsight: 'Structured solutions feel implementable and professional.',
      audienceConnection: 'Gives them a clear path forward they can act on immediately.'
    },
    {
      id: 'cta',
      title: 'Call to Action',
      instruction: 'End with engagement and next steps for your audience.',
      placeholder: `What's your biggest hiring challenge right now?\n\nShare in the comments - I'll personally respond with specific advice.`,
      psychologyInsight: 'Personal engagement promise increases comment likelihood.',
      audienceConnection: 'Makes them feel seen and creates opportunity for direct connection.'
    }
  ]

  const currentSectionData = sections[currentSection]
  const progress = ((currentSection + 1) / sections.length) * 100

  const handleContentChange = (content: string) => {
    setSectionContent(prev => ({
      ...prev,
      [currentSectionData.id]: content
    }))
  }

  const handleAISuggestions = async () => {
    setIsGeneratingAI(true)
    // Mock AI generation - replace with real AI call
    setTimeout(() => {
      const suggestions = [
        "Make the opening more specific with exact numbers",
        "Add a personal anecdote for authenticity",
        "Include a contrarian viewpoint to stand out"
      ]
      // In real app, you'd apply these suggestions
      setIsGeneratingAI(false)
    }, 2000)
  }

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleFinish = () => {
    onContinue({ sections: sectionContent })
  }

  const isLastSection = currentSection === sections.length - 1
  const canContinue = sectionContent[currentSectionData.id]?.trim().length > 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-slate-700 to-teal-600 rounded-full mb-4">
          <Edit3 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ✍️ Write Your Content - Section {currentSection + 1} of {sections.length}
        </h1>
        <p className="text-gray-600">Follow the AI guidance to create compelling content</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Context Bar */}
      <div className="bg-gray-50 rounded-lg p-4 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Topic:</span>
          <span className="text-gray-600 ml-2">"{topic}"</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Angle:</span>
          <span className="text-gray-600 ml-2 capitalize">{selectedAngle?.type || 'Data-Driven'}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Formula:</span>
          <span className="text-gray-600 ml-2">{selectedFormula?.name || 'Data-Driven Insight'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Writing Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {currentSectionData.title}: {currentSectionData.title === 'Opening Hook' ? '{Surprising statistic}' : ''}
              </h3>
              
              {/* AI Instructions */}
              <div className="bg-slate-50 rounded-lg p-4 mb-4 border-l-4 border-slate-500">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 mb-1">AI Instructions:</p>
                    <p className="text-sm text-slate-700">{currentSectionData.instruction}</p>
                  </div>
                </div>
              </div>

              {/* Writing Area */}
              <textarea
                value={sectionContent[currentSectionData.id] || ''}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder={currentSectionData.placeholder}
                className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              />
              
              {/* AI Actions */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex space-x-2">
                  <button
                    onClick={handleAISuggestions}
                    disabled={isGeneratingAI}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 text-sm font-medium transition disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isGeneratingAI ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-4 h-4" />
                        <span>AI Suggestions</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="text-sm text-gray-500">
                  {sectionContent[currentSectionData.id]?.length || 0} characters
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guidance Sidebar */}
        <div className="space-y-6">
          {/* Psychology Insight */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="w-5 h-5 text-teal-600" />
              <h4 className="font-semibold text-gray-900">💡 Psychology Insight:</h4>
            </div>
            <p className="text-sm text-gray-700">{currentSectionData.psychologyInsight}</p>
          </div>

          {/* Audience Connection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Users className="w-5 h-5 text-slate-600" />
              <h4 className="font-semibold text-gray-900">🎯 Audience Connection:</h4>
            </div>
            <p className="text-sm text-gray-700">{currentSectionData.audienceConnection}</p>
          </div>

          {/* Section Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Sections</h4>
            <div className="space-y-2">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition ${
                    index === currentSection
                      ? 'bg-teal-50 text-teal-700'
                      : index < currentSection
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setCurrentSection(index)}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    index === currentSection
                      ? 'bg-teal-600 text-white'
                      : index < currentSection
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index < currentSection ? '✓' : index + 1}
                  </div>
                  <span className="text-sm font-medium">{section.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition"
        >
          ← Back to Formula Selection
        </button>

        <div className="flex space-x-4">
          <button
            onClick={prevSection}
            disabled={currentSection === 0}
            className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {isLastSection ? (
            <button
              onClick={handleFinish}
              disabled={!canContinue}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Section (Polish)
            </button>
          ) : (
            <button
              onClick={nextSection}
              disabled={!canContinue}
              className="px-8 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>Next Section</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 flex justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-2 bg-teal-600 rounded-full"></div>
          <div className="w-8 h-2 bg-teal-600 rounded-full"></div>
          <div className="w-8 h-2 bg-teal-600 rounded-full"></div>
          <div className="w-8 h-2 bg-teal-600 rounded-full"></div>
          <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
        </div>
        <span className="ml-4 text-sm text-gray-600">Step 4 of 5</span>
      </div>
    </div>
  )
}
