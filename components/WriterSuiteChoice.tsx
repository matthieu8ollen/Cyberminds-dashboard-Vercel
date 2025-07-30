'use client'

import { useState } from 'react'
import { Sparkles, List, ArrowRight, CheckCircle, Users, BarChart3, MessageCircle, Brain } from 'lucide-react'

interface WriterSuiteChoiceProps {
  onModeSelect: (mode: 'marcus' | 'classic') => void
}

export default function WriterSuiteChoice({ onModeSelect }: WriterSuiteChoiceProps) {
  const [hoveredMode, setHoveredMode] = useState<'marcus' | 'classic' | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-800 via-slate-700 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Writing Style</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select the content creation approach that fits your workflow best. Both modes create professional LinkedIn content.
            </p>
          </div>
        </div>
      </div>

      {/* Choice Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Marcus Mode (Left - Subtle Primary) */}
          <div 
            className={`relative bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer transform ${
              hoveredMode === 'marcus' 
                ? 'border-teal-500 shadow-2xl scale-105' 
                : 'border-gray-200 shadow-lg scale-100 hover:scale-102'
            }`}
            onMouseEnter={() => setHoveredMode('marcus')}
            onMouseLeave={() => setHoveredMode(null)}
            onClick={() => onModeSelect('marcus')}
          >
            {/* Recommended Badge */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                RECOMMENDED
              </span>
            </div>

            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Marcus Mode</h3>
                    <p className="text-sm text-teal-600 font-medium">AI-Assisted Creation</p>
                  </div>
                </div>
                <ArrowRight className={`w-6 h-6 transition-colors ${
                  hoveredMode === 'marcus' ? 'text-teal-500' : 'text-gray-400'
                }`} />
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                Get conversational help from Marcus AI. Choose your path, get real-time suggestions, and create content through guided dialogue.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">4 specialized content creation paths</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Real-time AI suggestions and coaching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Psychology-based audience optimization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Content repurposing and lead magnets</span>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
                <div className="flex items-start space-x-3">
                  <Brain className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-teal-900 font-medium mb-1">Marcus AI</p>
                    <p className="text-xs text-teal-700">
                      "Let's create something great! What type of content would you like to work on today?"
                    </p>
                  </div>
                </div>
              </div>

              {/* Best For */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Best for:</span>
                </div>
                <p className="text-xs text-gray-600">
                  First-time users, creative exploration, interactive guidance, repurposing existing content
                </p>
              </div>
            </div>
          </div>

          {/* Writer Suite Classic (Right) */}
          <div 
            className={`relative bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer transform ${
              hoveredMode === 'classic' 
                ? 'border-slate-500 shadow-2xl scale-105' 
                : 'border-gray-200 shadow-lg scale-100 hover:scale-102'
            }`}
            onMouseEnter={() => setHoveredMode('classic')}
            onMouseLeave={() => setHoveredMode(null)}
            onClick={() => onModeSelect('classic')}
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center">
                    <List className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Writer Suite Classic</h3>
                    <p className="text-sm text-slate-600 font-medium">Structured Process</p>
                  </div>
                </div>
                <ArrowRight className={`w-6 h-6 transition-colors ${
                  hoveredMode === 'classic' ? 'text-slate-500' : 'text-gray-400'
                }`} />
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                Follow a proven 5-step process to create professional content. Perfect for systematic content creation with predictable results.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">5-step guided workflow</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Topic discovery and angle development</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Content formula selection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Section-by-section writing interface</span>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                    <span className="text-sm text-slate-700">Topic Discovery</span>
                  </div>
                  <div className="flex items-center space-x-2 opacity-60">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs">2</div>
                    <span className="text-sm text-gray-500">Angle & Hook Development</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-8">+ 3 more steps...</div>
                </div>
              </div>

              {/* Best For */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Best for:</span>
                </div>
                <p className="text-xs text-gray-600">
                  Experienced users, systematic approach, consistent quality, structured content planning
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Help Text */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            You can always save your progress and switch between modes from the Production Pipeline
          </p>
        </div>
      </div>
    </div>
  )
}
