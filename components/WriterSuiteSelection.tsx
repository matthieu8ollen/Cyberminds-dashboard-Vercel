'use client'

import { Sparkles, Zap, ArrowRight, Crown } from 'lucide-react'

interface WriterSuiteModeConfig {
  id: 'writer-suite' | 'standard'
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

const modes: WriterSuiteModeConfig[] = [
  {
    id: 'writer-suite',
    name: 'Writer Suite',
    timeEstimate: '15+ min',
    description: 'Complete control with advanced Marcus AI guidance.',
    features: ['AI-powered ideation', 'Step-by-step guidance', 'Formula templates', 'Advanced editing'],
    icon: Sparkles,
    gradient: 'from-purple-500 to-teal-600',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:bg-purple-50',
    isPremium: true
  },
  {
    id: 'standard',
    name: 'Standard Mode',
    timeEstimate: '2-5 min',
    description: 'Quick customization with smart defaults.',
    features: ['Topic selection', 'Style options', 'Light editing', 'Flexible scheduling'],
    icon: Zap,
    gradient: 'from-blue-500 to-cyan-600',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:bg-blue-50'
  }
]

interface WriterSuiteSelectionProps {
  onModeSelect: (mode: 'writer-suite' | 'standard') => void
  onBack?: () => void
}

export default function WriterSuiteSelection({ onModeSelect, onBack }: WriterSuiteSelectionProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-br from-slate-800 via-slate-700 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Creation Mode</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Select the approach that best fits your content creation needs and available time.
        </p>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {modes.map((mode) => {
          const Icon = mode.icon
          return (
            <div
              key={mode.id}
              onClick={() => onModeSelect(mode.id)}
              className={`relative bg-white rounded-2xl border-2 p-8 cursor-pointer transition-all duration-300 hover:shadow-xl ${mode.borderColor} ${mode.hoverColor} group`}
            >
              {/* Premium Badge */}
              {mode.isPremium && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
                  <Crown className="w-3 h-3" />
                  <span>PREMIUM</span>
                </div>
              )}

              {/* Icon and Header */}
              <div className="flex items-center justify-between mb-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${mode.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${mode.textColor}`}>{mode.timeEstimate}</div>
                  <div className="text-sm text-gray-500">Estimated time</div>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{mode.name}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{mode.description}</p>
                <ul className="space-y-2">
                  {mode.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${mode.gradient}`}></div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between">
                <button
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${mode.textColor} bg-gradient-to-r ${mode.gradient} bg-clip-text text-transparent border-2 ${mode.borderColor} hover:bg-opacity-10 group-hover:scale-105`}
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-sm text-gray-500">
                  {mode.isPremium ? 'Premium Feature' : 'Basic Plan'}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Back Button */}
      {onBack && (
        <div className="text-center mt-12">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 transition"
          >
            ← Back to Ideas
          </button>
        </div>
      )}
    </div>
  )
}
