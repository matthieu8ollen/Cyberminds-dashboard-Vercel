'use client'

import { useState } from 'react'
import { FileText, Zap, BarChart3, Target } from 'lucide-react'

interface ContentFormula {
  id: string
  name: string
  match: number
  description: string
  template: string[]
  whyItWorks: string
  icon: any
}

interface WriterSuiteStep3Props {
  topic: string
  selectedAngle: any
  onContinue: (data: { selectedFormula: ContentFormula }) => void
  onBack: () => void
}

export default function WriterSuiteStep3({ topic, selectedAngle, onContinue, onBack }: WriterSuiteStep3Props) {
  const [selectedFormula, setSelectedFormula] = useState<string>('data-driven')

  // Content formulas based on the selected angle
  const formulas: ContentFormula[] = [
    {
      id: 'data-driven',
      name: 'Data-Driven Insight',
      match: 9.2,
      description: 'Lead with compelling statistics and data points',
      template: [
        '{Surprising statistic} about {topic}',
        'Most people think {common belief}',
        'But the data tells different story:',
        '• {Data point 1}',
        '• {Data point 2}',
        'What this means: {insights}',
        'For {audience}: {advice}'
      ],
      whyItWorks: 'Builds credibility through data',
      icon: BarChart3
    },
    {
      id: 'behind-scenes',
      name: 'Behind-the-Scenes Story',
      match: 8.1,
      description: 'Share the real story behind your decisions',
      template: [
        'Here\'s what really happened when we {action}',
        'Everyone thought {assumption}',
        'But behind the scenes:',
        '• {Reality 1}',
        '• {Reality 2}',
        'The lesson: {insight}',
        'What you can do: {actionable advice}'
      ],
      whyItWorks: 'Creates authentic connection through transparency',
      icon: Target
    },
    {
      id: 'framework',
      name: 'Framework Share',
      match: 7.5,
      description: 'Present a proven system or methodology',
      template: [
        'After {experience}, I created this {framework name}',
        'The 3-step process:',
        '1. {Step one with details}',
        '2. {Step two with details}',
        '3. {Step three with details}',
        'Results: {outcomes}',
        'Try this approach: {implementation guide}'
      ],
      whyItWorks: 'Provides immediate value through actionable systems',
      icon: FileText
    }
  ]

  const handleContinue = () => {
    const selected = formulas.find(formula => formula.id === selectedFormula)
    if (selected) {
      onContinue({ selectedFormula: selected })
    }
  }

  const getMatchColor = (match: number) => {
    if (match >= 9) return 'text-green-600 bg-green-100'
    if (match >= 8) return 'text-blue-600 bg-blue-100'
    return 'text-orange-600 bg-orange-100'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Choose Your Content Structure</h1>
        <p className="text-gray-600">Select the formula that best matches your angle and goals</p>
      </div>

      {/* Context Display */}
      <div className="bg-gray-50 rounded-lg p-4 mb-8 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">Topic:</span>
            <span className="text-gray-600">"{topic}"</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">Angle:</span>
            <span className="text-gray-600 capitalize">{selectedAngle?.type || 'Data-Driven'}</span>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Based on your angle, here are 3 recommended formulas:
        </h3>

        <div className="space-y-6">
          {formulas.map((formula, index) => {
            const Icon = formula.icon
            const isSelected = selectedFormula === formula.id
            const isRecommended = index === 0

            return (
              <div
                key={formula.id}
                className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedFormula(formula.id)}
              >
                {/* Selection Indicator */}
                <div className="absolute top-4 left-4">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>

                <div className="ml-8">
                  {/* Formula Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">
                            {isRecommended && '🔥 '}"{formula.name}" Formula
                          </h4>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchColor(formula.match)}`}>
                            Match: {formula.match}/10
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{formula.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Template Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h5 className="font-medium text-gray-900 mb-3">Template Structure:</h5>
                    <div className="space-y-2">
                      {formula.template.map((line, lineIndex) => (
                        <div key={lineIndex} className="text-sm text-gray-700 font-mono">
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Why It Works */}
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Why this works:</span>
                    <span className="text-gray-600 ml-2">{formula.whyItWorks}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Additional Options */}
        <div className="mt-6 flex justify-center space-x-4">
          <button className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm transition">
            Preview More
          </button>
          <button className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm transition">
            Browse All (12)
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={onBack}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition"
          >
            ← Back to Angle Selection
          </button>
          
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition flex items-center space-x-2"
          >
            <span>Use This Formula</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 flex justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-2 bg-indigo-600 rounded-full"></div>
          <div className="w-8 h-2 bg-indigo-600 rounded-full"></div>
          <div className="w-8 h-2 bg-indigo-600 rounded-full"></div>
          <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
          <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
        </div>
        <span className="ml-4 text-sm text-gray-600">Step 3 of 5</span>
      </div>
    </div>
  )
}
