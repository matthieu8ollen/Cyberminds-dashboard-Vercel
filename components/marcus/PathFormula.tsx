'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Target, BarChart3, Sparkles, CheckCircle } from 'lucide-react'
import WritingInterface from './WritingInterface'
import { useContent } from '../../contexts/ContentContext'
import { useToast } from '../ToastNotifications'

interface FormulaTemplate {
  id: string
  name: string
  description: string
  category: 'story' | 'data' | 'framework' | 'lead-magnet'
  structure: string[]
  example: string
  whyItWorks: string[]
  bestFor: string
}

interface PathFormulaProps {
  onBack: () => void
}

export default function PathFormula({ onBack }: PathFormulaProps) {
  const [currentStep, setCurrentStep] = useState<'selection' | 'template' | 'writing' | 'preview'>('selection')
  const [selectedFormula, setSelectedFormula] = useState<FormulaTemplate | null>(null)
  const [generatedContent, setGeneratedContent] = useState('')
  const { saveDraft, setSelectedContent, setShowScheduleModal } = useContent()
  const { showToast } = useToast()
  const handleWritingComplete = (content: string) => {
    setGeneratedContent(content)
    setCurrentStep('preview')
  }

  const handleBackToWriting = () => {
    setCurrentStep('writing')
  }

  const formulas: FormulaTemplate[] = [
    {
      id: 'confession',
      name: 'Confession Formula',
      description: 'Share vulnerable business lessons through personal mistakes',
      category: 'story',
      structure: [
        'Admission - Hook that takes responsibility',
        'Context - Why you made this decision', 
        'Consequence - What went wrong and impact',
        'Learning - Key insight discovered',
        'Redemption - How you do it differently now',
        'CTA - Question inviting sharing'
      ],
      example: 'Hiring my best friend as CTO was the hardest mistake I ever made...',
      whyItWorks: [
        'Vulnerability builds immediate trust',
        'Specific details make it relatable', 
        'Clear lesson provides universal value',
        'Practical solution helps others avoid mistake'
      ],
      bestFor: 'Business relationship lessons, leadership stories'
    },
    {
      id: 'myth-buster',
      name: 'Myth-Buster Formula',
      description: 'Challenge conventional wisdom with evidence',
      category: 'data',
      structure: [
        'Common Belief - What everyone thinks is true',
        'Why It\'s Wrong - Problems with this belief',
        'Evidence/Data - Proof supporting your position',
        'Better Approach - What to do instead',
        'CTA - Question inviting experience sharing'
      ],
      example: '90% of SaaS founders are tracking metrics that lie to them...',
      whyItWorks: [
        'Bold opening stops the scroll',
        'Specific problems create urgency',
        'Data backing establishes credibility',
        'Clear alternative provides immediate value'
      ],
      bestFor: 'Industry insights, contrarian takes'
    },
    {
      id: 'framework',
      name: '5-Step Framework Formula',
      description: 'Share systematic approaches to business problems',
      category: 'framework',
      structure: [
        'Problem - Challenge you solved uniquely',
        'Framework Intro - Your systematic approach',
        'Step 1-5 - Each with specific guidance',
        'Why It Works - Psychology/principle behind it',
        'TL;DR - Condensed version for scanning',
        'CTA - Which step resonates most?'
      ],
      example: 'The 5-Step "Friendship-Proof" Hiring Framework...',
      whyItWorks: [
        'Structured advice feels actionable',
        'Numbers create psychological appeal',
        'Step-by-step reduces overwhelm',
        'Scannable format increases shares'
      ],
      bestFor: 'Process sharing, tactical advice'
    },
    {
      id: 'value-first',
      name: 'Value-First Lead Magnet',
      description: 'Build trust before asking for anything',
      category: 'lead-magnet',
      structure: [
        'Hook - Attention-grabbing insight',
        'Problem Cost - Stakes of not solving this',
        'Value Preview - 2-3 best tips as samples',
        'Social Proof - Your experience/results',
        'Soft CTA - Natural offer without pressure'
      ],
      example: 'I\'ve seen 47 pitch decks. Here\'s why 43 got rejected...',
      whyItWorks: [
        'Gives value before asking',
        'Builds trust through expertise',
        'Natural transition to offer',
        'Higher conversion rates'
      ],
      bestFor: 'Lead generation, building authority'
    }
  ]

  const handleFormulaSelect = (formula: FormulaTemplate) => {
    setSelectedFormula(formula)
    setCurrentStep('template')
  }

  const handleStartWriting = () => {
    setCurrentStep('writing')
  }

  const renderFormulaSelection = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Content Formula</h1>
          <p className="text-gray-600">Start with a proven template for maximum engagement</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marcus</span>
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {formulas.map((formula) => (
          <div
            key={formula.id}
            className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-teal-500 hover:shadow-lg transition-all duration-200 cursor-pointer group"
            onClick={() => handleFormulaSelect(formula)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
                  formula.category === 'story' ? 'bg-purple-100 text-purple-600' :
                  formula.category === 'data' ? 'bg-blue-100 text-blue-600' :
                  formula.category === 'framework' ? 'bg-green-100 text-green-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {formula.category === 'story' ? <Target className="w-6 h-6" /> :
                   formula.category === 'data' ? <BarChart3 className="w-6 h-6" /> :
                   formula.category === 'framework' ? <BookOpen className="w-6 h-6" /> :
                   <Sparkles className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{formula.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    formula.category === 'story' ? 'bg-purple-100 text-purple-700' :
                    formula.category === 'data' ? 'bg-blue-100 text-blue-700' :
                    formula.category === 'framework' ? 'bg-green-100 text-green-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {formula.category.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
            </div>

            <p className="text-gray-600 mb-4">{formula.description}</p>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-gray-900">Structure:</p>
              <div className="text-sm text-gray-600">
                {formula.structure.slice(0, 3).map((step, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                    <span>{step}</span>
                  </div>
                ))}
                {formula.structure.length > 3 && (
                  <div className="text-xs text-gray-500 ml-3.5">
                    +{formula.structure.length - 3} more steps
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-700 font-medium">Best for: {formula.bestFor}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderTemplatePreview = () => {
    if (!selectedFormula) return null

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedFormula.name}</h1>
            <p className="text-gray-600">{selectedFormula.description}</p>
          </div>
          <button
            onClick={() => setCurrentStep('selection')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Choose Different Formula</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Template Structure</h2>
          
          <div className="space-y-4 mb-8">
            {selectedFormula.structure.map((step, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{step.split(' - ')[0]}</p>
                  <p className="text-sm text-gray-600">{step.split(' - ')[1]}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">Example Opening:</h3>
            <p className="text-blue-800 italic">"{selectedFormula.example}"</p>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Why This Template Works:</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {selectedFormula.whyItWorks.map((reason, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleStartWriting}
              className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition font-medium flex items-center space-x-2"
            >
              <span>Start Writing with This Template</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderWritingInterface = () => {
  if (!selectedFormula) return null
  
  return (
    <WritingInterface
      formula={selectedFormula}
      onBack={() => setCurrentStep('template')}
      onComplete={handleWritingComplete}
    />
  )
}

const renderFinalPreview = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎉 Content Created!</h1>
        <p className="text-gray-600">Your content is ready to publish</p>
      </div>
      <button
        onClick={handleBackToWriting}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Edit</span>
      </button>
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
      <div className="prose max-w-none">
        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
          {generatedContent}
        </div>
      </div>
    </div>

    <div className="flex justify-center space-x-4">
      <button
        onClick={handleBackToWriting}
        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
      >
        Edit Content
      </button>
      <button
        onClick={async () => {
  try {
    const saved = await saveDraft({
      content_text: generatedContent,
      content_type: 'framework' as const,  // Use 'as const' for literal type
      tone_used: 'professional',
      prompt_input: selectedFormula?.name || 'Content Formula',
      is_saved: true,
      title: selectedFormula?.name
    })
    
    if (saved) {
      showToast('success', 'Content saved as draft!')
      setSelectedContent(saved)
      setShowScheduleModal(true)
    }
  } catch (error) {
    showToast('error', 'Failed to save content')
  }
}}
        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
      >
        Save & Publish
      </button>
    </div>
  </div>
)

  switch (currentStep) {
  case 'selection':
    return renderFormulaSelection()
  case 'template':
    return renderTemplatePreview()
  case 'writing':
    return renderWritingInterface()
  case 'preview':
    return renderFinalPreview()
  default:
    return renderFormulaSelection()
}
}
