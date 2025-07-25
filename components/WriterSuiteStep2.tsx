'use client'

import { useState } from 'react'
import { Target, Users, TrendingUp, Zap } from 'lucide-react'

interface AngleOption {
  id: string
  type: 'personal' | 'data' | 'contrarian'
  title: string
  description: string
  psychology: string
  audienceFit: number
  selected?: boolean
}

interface WriterSuiteStep2Props {
  topic: string
  onContinue: (data: { selectedAngle: AngleOption }) => void
  onBack: () => void
}

export default function WriterSuiteStep2({ topic, onContinue, onBack }: WriterSuiteStep2Props) {
  const [selectedAngle, setSelectedAngle] = useState<string | null>('data')

  // Generate angle options based on the topic
  const angleOptions: AngleOption[] = [
    {
      id: 'personal',
      type: 'personal',
      title: `The $50k ${topic.toLowerCase()} mistake that taught me everything`,
      description: `Personal story about a costly mistake in ${topic.toLowerCase()}`,
      psychology: 'Personal vulnerability creates trust',
      audienceFit: 9
    },
    {
      id: 'data',
      type: 'data',
      title: `73% of companies struggle with ${topic.toLowerCase()} - here's what we learned`,
      description: `Data-driven insights about ${topic.toLowerCase()} challenges`,
      psychology: 'Data creates credibility + curiosity',
      audienceFit: 8,
      selected: true
    },
    {
      id: 'contrarian',
      type: 'contrarian',
      title: `Why we stopped doing ${topic.toLowerCase()} the "right" way`,
      description: `Contrarian take on conventional ${topic.toLowerCase()} wisdom`,
      psychology: 'Contrarian positioning draws attention',
      audienceFit: 7
    }
  ]

  const getAngleIcon = (type: AngleOption['type']) => {
    switch (type) {
      case 'personal':
        return <Users className="w-5 h-5" />
      case 'data':
        return <TrendingUp className="w-5 h-5" />
      case 'contrarian':
        return <Zap className="w-5 h-5" />
    }
  }

  const getAngleColor = (type: AngleOption['type']) => {
    switch (type) {
      case 'personal':
        return 'from-purple-500 to-pink-600'
      case 'data':
        return 'from-blue-500 to-teal-600'
      case 'contrarian':
        return 'from-orange-500 to-red-600'
    }
  }

  const handleContinue = () => {
    const selected = angleOptions.find(angle => angle.id === selectedAngle)
    if (selected) {
      onContinue({ selectedAngle: selected })
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-slate-700 to-teal-600 rounded-full mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎣 Hook & Angle Selection</h1>
        <p className="text-gray-600">Choose the psychological approach that will best engage your audience</p>
      </div>

      {/* Topic Display */}
      <div className="bg-teal-50 rounded-lg p-4 mb-8 border-l-4 border-teal-500">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-teal-800">Topic:</span>
          <span className="text-sm text-teal-700">"{topic}"</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Recommended Angles:</h3>

        <div className="space-y-6">
          {angleOptions.map((angle) => (
            <div
              key={angle.id}
              className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                selectedAngle === angle.id
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedAngle(angle.id)}
            >
              {/* Selection Indicator */}
              <div className="absolute top-4 left-4">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedAngle === angle.id
                    ? 'border-teal-500 bg-teal-500'
                    : 'border-gray-300'
                }`}>
                  {selectedAngle === angle.id && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>

              <div className="ml-8">
                {/* Angle Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${getAngleColor(angle.type)} rounded-lg flex items-center justify-center`}>
                      {getAngleIcon(angle.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 capitalize">
                        {angle.type === 'data' ? 'Data-Driven' : angle.type} Angle
                        {angle.selected && (
                          <span className="ml-2 text-sm text-teal-600 font-medium">(Selected)</span>
                        )}
                      </h4>
                    </div>
                  </div>
                  
                  {/* Audience Fit Score */}
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Audience fit:</div>
                    <div className="text-lg font-bold text-teal-600">{angle.audienceFit}/10</div>
                  </div>
                </div>

                {/* Angle Content */}
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">"{angle.title}"</h5>
                    <p className="text-sm text-gray-600">{angle.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Psychology:</span>
                      <p className="text-gray-600 mt-1">{angle.psychology}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Best for:</span>
                      <p className="text-gray-600 mt-1">
                        {angle.type === 'personal' && 'Fellow founders & entrepreneurs'}
                        {angle.type === 'data' && 'Growth-stage executives'}
                        {angle.type === 'contrarian' && 'Innovation-focused leaders'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={onBack}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition"
          >
            ← Back to Topic Selection
          </button>
          
          <button
            onClick={handleContinue}
            disabled={!selectedAngle}
            className="px-8 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>Continue with Selected Angle</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 flex justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-2 bg-teal-600 rounded-full"></div>
          <div className="w-8 h-2 bg-teal-600 rounded-full"></div>
          <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
          <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
          <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
        </div>
        <span className="ml-4 text-sm text-gray-600">Step 2 of 5</span>
      </div>
    </div>
  )
}
