'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle, Lightbulb, Zap, Eye, Save, Calendar } from 'lucide-react'
import AIAssistant from './AIAssistant'

interface FormulaTemplate {
  id: string
  name: string
  description: string
  structure: string[]
  example: string
}

interface WritingInterfaceProps {
  formula: FormulaTemplate
  onBack: () => void
  onComplete: (content: string) => void
  ideationData?: any
  initialContent?: string
}

interface SectionData {
  title: string
  content: string
  guidance: string
  placeholder: string
  completed: boolean
}

export default function WritingInterface({ formula, onBack, onComplete, ideationData, initialContent }: WritingInterfaceProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [sections, setSections] = useState<SectionData[]>([])
  const [showPreview, setShowPreview] = useState(false)

  // Initialize sections based on formula
  useEffect(() => {
    const initialSections = formula.structure.map((step, index) => {
      const [title, guidance] = step.includes(' - ') ? step.split(' - ') : [step, '']
      
      return {
        title,
        content: '',
        guidance: getGuidanceForSection(formula.id, title, index),
        placeholder: getPlaceholderForSection(formula.id, title, index),
        completed: false
      }
    })
    
    setSections(initialSections)
  }, [formula])

  const getGuidanceForSection = (formulaId: string, title: string, index: number): string => {
    const guidanceMap: Record<string, Record<number, string>> = {
      'confession': {
        0: "Start with a bold, vulnerable statement that takes responsibility. Make it specific and relatable. This is your hook - make people stop scrolling.",
        1: "Explain why your decision seemed logical at the time. Help readers understand your reasoning so they think 'I would have done the same thing.'",
        2: "Be honest about what went wrong. Include specific costs - time, money, relationships. Make the pain visceral but not self-pitying.",
        3: "What principle did you learn? Make it universal and actionable. This is the value you're providing to readers.",
        4: "How do you handle this type of situation now? Give readers a practical system or approach they can use.",
        5: "Ask a question that invites sharing. Make it specific to encourage genuine engagement, not just 'What do you think?'"
      },
      'myth-buster': {
        0: "State the conventional wisdom that most people accept as truth. Be specific about who believes this and why it's popular.",
        1: "Explain the specific problems with this belief. Use logic and real-world examples. Create doubt about current practices.",
        2: "Provide credible evidence that supports your contrarian position. Use data, studies, or compelling examples.",
        3: "Give readers a superior alternative they can implement. Be specific and actionable.",
        4: "Ask about their experience with the conventional approach. Encourage validation of your point."
      },
      'framework': {
        0: "Describe the challenge you solved in an uncommon way. Establish credibility and create curiosity.",
        1: "Introduce your systematic approach. Promise structured, actionable advice that readers can follow.",
        2: "Break down your process into clear, actionable steps. Each step should be specific and implementable.",
        3: "Explain the psychology or principle behind why your framework works. Help readers understand the deeper logic.",
        4: "Create a scannable summary. Make it easy to save and share. Use bullet points or numbered lists.",
        5: "Ask which part applies to their situation. Encourage specific, relevant engagement."
      },
      'value-first': {
        0: "Grab attention with credible, counterintuitive insight. Establish your expertise immediately.",
        1: "Make the cost of not solving this problem visceral. Use specific examples and timelines.",
        2: "Share your best 2-3 tips as proof of quality. Give real value before asking for anything.",
        3: "Add credibility through your experience and results. Show you've been there and succeeded.",
        4: "Make a natural offer without pressure. Focus on helping rather than selling."
      }
    }

    return guidanceMap[formulaId]?.[index] || "Write this section with your authentic voice and specific examples."
  }

  const getPlaceholderForSection = (formulaId: string, title: string, index: number): string => {
    const placeholderMap: Record<string, Record<number, string>> = {
      'confession': {
        0: "Hiring my best friend as CTO was the hardest mistake I ever made...",
        1: "I was 6 months from running out of money, couldn't afford a $200K CTO...",
        2: "8 months later, our codebase was a mess, the team had lost confidence...",
        3: "The lesson: Personal trust and professional competence are completely different...",
        4: "Now I have a strict policy: friends can join the team, but never in roles...",
        5: "Have you ever mixed business with friendship? How did you handle it?"
      },
      'myth-buster': {
        0: "90% of SaaS founders are tracking metrics that lie to them...",
        1: "Here's why this is dangerous: MRR can grow while unit economics collapse...",
        2: "The data backs this up: 67% of SaaS companies track vanity metrics...",
        3: "Here's what you should track instead: LTV:CAC ratio, Net Revenue Retention...",
        4: "What metrics have misled you in the past? Share your experience below."
      },
      'framework': {
        0: "I nearly destroyed my startup by hiring my best friend as CTO...",
        1: "Here's the 5-Step 'Friendship-Proof' Hiring Framework I use...",
        2: "Step 1: Skills Audit - Most people think cultural fit matters most...",
        3: "The reason this framework works so well is because it removes emotional decision-making...",
        4: "TL;DR: The 5-Step Friendship-Proof Hiring Framework...",
        5: "What's your biggest hiring challenge? Which step would help you most?"
      },
      'value-first': {
        0: "I've seen 47 pitch decks. Here's why 43 got rejected in the first 5 minutes...",
        1: "The fundraising mistake that costs founders 6 months and their sanity...",
        2: "Here are the 3 most common deck killers I see repeatedly...",
        3: "I've helped 12 founders fix these issues and secure funding...",
        4: "Want the complete 23-point fundraising readiness checklist?"
      }
    }

    return placeholderMap[formulaId]?.[index] || `Write your ${title.toLowerCase()} here...`
  }

  const handleSectionChange = (content: string) => {
    setSections(prev => prev.map((section, index) => 
      index === currentSectionIndex 
        ? { ...section, content, completed: content.trim().length > 20 }
        : section
    ))
  }

  const goToNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
    }
  }

  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
    }
  }

  const generateFullContent = (): string => {
    return sections.map(section => section.content).filter(content => content.trim()).join('\n\n')
  }

  const handlePreview = () => {
    setShowPreview(true)
  }

  const handleComplete = () => {
    const fullContent = generateFullContent()
    onComplete(fullContent)
  }

  const completedSections = sections.filter(section => section.completed).length
  const progress = (completedSections / sections.length) * 100

  if (sections.length === 0) {
    return <div>Loading...</div>
  }

  const currentSection = sections[currentSectionIndex]

  if (showPreview) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Preview</h1>
            <p className="text-gray-600">Review your content before finishing</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{formula.name}</h1>
          <p className="text-gray-600">Section {currentSectionIndex + 1} of {sections.length}</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Template</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{completedSections} of {sections.length} sections completed</span>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sections</h3>
            <div className="space-y-3">
              {sections.map((section, index) => (
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
                  formulaId={formula.id}
                  onApplySuggestion={(suggestion) => {
                    // Apply suggestion to content
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

                {currentSectionIndex === sections.length - 1 ? (
                  <button
                    onClick={handleComplete}
                    disabled={completedSections < sections.length}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition ${
                      completedSections < sections.length
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
