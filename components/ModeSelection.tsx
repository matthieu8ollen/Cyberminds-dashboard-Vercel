'use client'

import { useState } from 'react'
import { Zap, Clock, Sparkles, ArrowRight, Crown } from 'lucide-react'

type UserMode = 'express' | 'standard' | 'power'

interface ModeConfig {
  id: UserMode
  name: string
  timeEstimate: string
  description: string
  features: string[]
  icon: any
  gradient: string
  textColor: string
  borderColor: string
  hoverColor: string
  isPremium?: boolean
}

const modes: ModeConfig[] = [
  {
    id: 'express',
    name: 'Express Mode',
    timeEstimate: '< 1 min',
    description: 'AI does everything. Quick and effortless.',
    features: ['Instant generation', 'Auto-schedule', 'Trending topics', 'AI recommendations'],
    icon: Zap,
    gradient: 'from-blue-500 to-cyan-600',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:bg-blue-50'
  },
  {
    id: 'standard',
    name: 'Standard Mode',
    timeEstimate: '2-5 min',
    description: 'Quick customization with smart defaults.',
    features: ['Topic selection', 'Style options', 'Light editing', 'Flexible scheduling'],
    icon: Clock,
    gradient: 'from-slate-500 to-gray-600',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200',
    hoverColor: 'hover:bg-slate-50'
  },
  {
    id: 'power',
    name: 'Power Mode - Enter Writer Suite',
    timeEstimate: '15+ min',
    description: 'Complete control with advanced features.',
    features: ['5-step guided process', 'Advanced editing', 'Performance optimization', 'Premium templates'],
    icon: Sparkles,
    gradient: 'from-purple-600 to-indigo-700',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:bg-purple-50',
    isPremium: true
  }
]

interface ModeSelectionProps {
  onModeSelect: (mode: UserMode) => void
  onBack: () => void
}

export default function ModeSelection({ onModeSelect, onBack }: ModeSelectionProps) {
  const [selectedMode, setSelectedMode] = useState<UserMode | null>(null)

  const handleModeSelect = (mode: UserMode) => {
    setSelectedMode(mode)
    // Small delay for visual feedback
    setTimeout(() => {
      onModeSelect(mode)
    }, 150)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={onBack}
            className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-6 transition"
          >
            ← Back to Dashboard
          </button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your Next Post
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your creation style based on time and control preference
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {modes.map((mode) => {
            const Icon = mode.icon
            const isSelected = selectedMode === mode.id
            
            return (
              <div
                key={mode.id}
                onClick={() => handleModeSelect(mode.id)}
                className={`
                  relative bg-white rounded-2xl border-2 p-8 cursor-pointer
                  transform transition-all duration-200 ease-out
                  ${isSelected ? 'scale-105 shadow-xl' : 'hover:scale-102 hover:shadow-lg'}
                  ${mode.borderColor} ${mode.hoverColor}
                `}
              >
                {/* Premium Badge */}
                {mode.isPremium && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                    <Crown className="w-3 h-3" />
                    <span>PRO</span>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-r ${mode.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{mode.name}</h3>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full bg-gray-100 ${mode.textColor}`}>
                      {mode.timeEstimate}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{mode.description}</p>
                  
                  {/* Features */}
                  <ul className="space-y-2">
                    {mode.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button className={`
                  w-full bg-gradient-to-r ${mode.gradient} text-white py-3 px-6 rounded-lg font-semibold
                  flex items-center justify-center space-x-2
                  hover:opacity-90 transition-opacity
                  ${isSelected ? 'animate-pulse' : ''}
                `}>
                  <span>
                    {mode.id === 'power' ? 'Enter Writer Suite' : `Start ${mode.name}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>

        {/* Upgrade Hint for Express/Standard */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Need more control?{' '}
            <button
              onClick={() => handleModeSelect('power')}
              className="text-purple-600 hover:text-purple-700 font-medium underline"
            >
              Try Writer Suite
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
