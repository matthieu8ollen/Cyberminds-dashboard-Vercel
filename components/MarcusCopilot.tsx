'use client'

import { useState } from 'react'
import { User, ArrowRight, MessageCircle, FileText, Magnet, BookOpen } from 'lucide-react'
import PathFormula from './marcus/PathFormula'
import PathTopicAngle from './marcus/PathTopicAngle'
import PathRepurpose from './marcus/PathRepurpose'
import PathLeadMagnet from './marcus/PathLeadMagnet'

type MarcusPath = 'welcome' | 'topic-angle' | 'repurpose' | 'lead-magnet' | 'formula'

interface MarcusState {
  currentPath: MarcusPath
  conversationData: any
}

interface MarcusCopilotProps {
  onComplete?: (data: any) => void
}

export default function MarcusCopilot({ onComplete }: MarcusCopilotProps) {
  const [marcusState, setMarcusState] = useState<MarcusState>({
    currentPath: 'welcome',
    conversationData: {}
  })

  const handlePathSelect = (path: MarcusPath) => {
    setMarcusState(prev => ({
      ...prev,
      currentPath: path
    }))
  }

  const handleBackToWelcome = () => {
    setMarcusState({
      currentPath: 'welcome',
      conversationData: {}
    })
  }

  const renderWelcomeScreen = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Marcus Header */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <User className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          👋 Hi! I'm Marcus, your LinkedIn writing copilot.
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          I'm here to help you create engaging content that resonates with your audience.
        </p>
      </div>

      {/* Path Selection */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
          How would you like to start today?
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Topic & Angle Path */}
          <button
            onClick={() => handlePathSelect('topic-angle')}
            className="bg-white border-2 border-gray-200 rounded-xl p-6 text-left hover:border-teal-500 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                <MessageCircle className="w-6 h-6 text-slate-600 group-hover:text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  📝 Topic & Angle
                </h3>
                <p className="text-gray-600 mb-3">
                  "I want to write about a specific topic"
                </p>
                <div className="flex items-center text-teal-600 font-medium">
                  Start here
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </button>

          {/* Repurpose Content Path */}
          <button
            onClick={() => handlePathSelect('repurpose')}
            className="bg-white border-2 border-gray-200 rounded-xl p-6 text-left hover:border-teal-500 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                <FileText className="w-6 h-6 text-slate-600 group-hover:text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🔗 Repurpose Content
                </h3>
                <p className="text-gray-600 mb-3">
                  "I have existing content to transform"
                </p>
                <div className="flex items-center text-teal-600 font-medium">
                  Transform content
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </button>

          {/* Lead Magnet Path */}
          <button
            onClick={() => handlePathSelect('lead-magnet')}
            className="bg-white border-2 border-gray-200 rounded-xl p-6 text-left hover:border-teal-500 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                <Magnet className="w-6 h-6 text-slate-600 group-hover:text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🧲 Lead Magnet
                </h3>
                <p className="text-gray-600 mb-3">
                  "I want to create content that generates leads"
                </p>
                <div className="flex items-center text-teal-600 font-medium">
                  Generate leads
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </button>

          {/* Content Formula Path */}
          <button
            onClick={() => handlePathSelect('formula')}
            className="bg-white border-2 border-gray-200 rounded-xl p-6 text-left hover:border-teal-500 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                <BookOpen className="w-6 h-6 text-slate-600 group-hover:text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  📋 Content Formula
                </h3>
                <p className="text-gray-600 mb-3">
                  "I want to start with a proven template"
                </p>
                <div className="flex items-center text-teal-600 font-medium">
                  Use template
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
          <span className="text-yellow-600">💡</span>
          <span className="text-sm text-yellow-800">
            New here? I can also show you what makes LinkedIn content perform well.
          </span>
        </div>
      </div>
    </div>
  )

  const renderPathContent = () => {
    switch (marcusState.currentPath) {
      case 'topic-angle':
  return <PathTopicAngle onBack={handleBackToWelcome} />

      case 'repurpose':
  return <PathRepurpose onBack={handleBackToWelcome} />

      case 'lead-magnet':
  return <PathLeadMagnet onBack={handleBackToWelcome} />

      case 'formula':
  return <PathFormula onBack={handleBackToWelcome} />

      default:
        return renderWelcomeScreen()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header section removed - using breadcrumb navigation instead */}

      {/* Content */}
      <div>
        {marcusState.currentPath === 'welcome' ? renderWelcomeScreen() : renderPathContent()}
      </div>
    </div>
  )
}
