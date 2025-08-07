'use client'

import { useState } from 'react'
import { MessageCircle, Target, RotateCcw, BookOpen, ArrowRight } from 'lucide-react'
import TalkWithMarcus from './TalkWithMarcus'
import RepurposeHub from './repurpose/RepurposeHub'

type IdeasPage = 'welcome' | 'talk-with-marcus' | 'ai-suggested' | 'repurpose-content' | 'content-formulas'

interface IdeasHubProps {
  onIdeationComplete?: (ideation: any) => void
  onNavigateToCreate?: (mode: 'standard' | 'power', ideationData: any) => void
  onPageChange?: (page: string) => void
}

// Placeholder components for now
const AISuggestedTopics = ({ onBack }: { onBack: () => void }) => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="text-center">
      <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Suggested Topics</h2>
      <p className="text-gray-600 mb-8">Coming soon! This will show trending topics curated for your audience.</p>
      <button
        onClick={onBack}
        className="bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition"
      >
        Back to Ideas Hub
      </button>
    </div>
  </div>
)

const ContentFormulas = ({ onBack }: { onBack: () => void }) => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="text-center">
      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Formulas</h2>
      <p className="text-gray-600 mb-8">Coming soon! Browse proven content templates and frameworks.</p>
      <button
        onClick={onBack}
        className="bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition"
      >
        Back to Ideas Hub
      </button>
    </div>
  </div>
)

export default function IdeasHub({ onIdeationComplete, onNavigateToCreate, onPageChange }: IdeasHubProps = {}) {
  const [currentPage, setCurrentPage] = useState<IdeasPage>('welcome')

  const handleBackToWelcome = () => {
    setCurrentPage('welcome')
    if (onPageChange) onPageChange('welcome')
  }

  const renderWelcomeScreen = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <MessageCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          💡 Ideas Hub
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your content ideation command center. Choose how you'd like to develop your next LinkedIn post idea.
        </p>
      </div>

      {/* Ideation Options */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
          How would you like to start developing your content idea?
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Talk with Marcus */}
          <button
            onClick={() => {
  setCurrentPage('talk-with-marcus')
  if (onPageChange) onPageChange('talk-with-marcus')
}}
            className="bg-white border-2 border-gray-200 rounded-xl p-6 text-left hover:border-teal-500 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                <MessageCircle className="w-6 h-6 text-slate-600 group-hover:text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  💬 Talk with Marcus
                </h3>
                <p className="text-gray-600 mb-3">
                  Conversational ideation - tell Marcus what you want to write about and he'll help you develop it
                </p>
                <div className="flex items-center text-teal-600 font-medium">
                  Start conversation
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </button>

          {/* AI Suggested Topics */}
          <button
  onClick={() => {
    setCurrentPage('ai-suggested')
    if (onPageChange) onPageChange('ai-suggested')
  }}
  className="bg-white border-2 border-gray-200 rounded-xl p-6 text-left hover:border-teal-500 hover:shadow-lg transition-all duration-200 group"
>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                <Target className="w-6 h-6 text-slate-600 group-hover:text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🎯 AI Suggested Topics
                </h3>
                <p className="text-gray-600 mb-3">
                  Browse trending topics curated for your audience and industry
                </p>
                <div className="flex items-center text-teal-600 font-medium">
                  Browse topics
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </button>

          {/* Repurpose Content */}
          <button
  onClick={() => {
    setCurrentPage('repurpose-content')
    if (onPageChange) onPageChange('repurpose-content')
  }}
  className="bg-white border-2 border-gray-200 rounded-xl p-6 text-left hover:border-teal-500 hover:shadow-lg transition-all duration-200 group"
>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                <RotateCcw className="w-6 h-6 text-slate-600 group-hover:text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🔄 Repurpose Content
                </h3>
                <p className="text-gray-600 mb-3">
                  Transform existing articles, reports, or content into LinkedIn-ready posts
                </p>
                <div className="flex items-center text-teal-600 font-medium">
                  Upload content
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </button>

          {/* Content Formulas */}
          <button
  onClick={() => {
    setCurrentPage('content-formulas')
    if (onPageChange) onPageChange('content-formulas')
  }}
  className="bg-white border-2 border-gray-200 rounded-xl p-6 text-left hover:border-teal-500 hover:shadow-lg transition-all duration-200 group"
>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                <BookOpen className="w-6 h-6 text-slate-600 group-hover:text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  📋 Content Formulas
                </h3>
                <p className="text-gray-600 mb-3">
                  Start with proven content templates and frameworks that drive engagement
                </p>
                <div className="flex items-center text-teal-600 font-medium">
                  Browse formulas
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <span className="text-blue-600">💡</span>
          <span className="text-sm text-blue-800">
            Not sure where to start? Try "Talk with Marcus" for personalized guidance, or browse "AI Suggested Topics" for inspiration.
          </span>
        </div>
      </div>
    </div>
  )

  const renderPageContent = () => {
    switch (currentPage) {
      case 'talk-with-marcus':
  return (
    <TalkWithMarcus 
      onIdeationComplete={(ideation) => {
        if (onIdeationComplete) onIdeationComplete(ideation)
      }}
      onNavigateToCreate={onNavigateToCreate}
    />
  )

      case 'ai-suggested':
        return <AISuggestedTopics onBack={handleBackToWelcome} />

      case 'repurpose-content':
  return (
    <RepurposeHub 
      onIdeationComplete={(ideation) => {
        if (onIdeationComplete) onIdeationComplete(ideation)
      }}
      onNavigateToCreate={onNavigateToCreate}
    />
  )
      case 'content-formulas':
        return <ContentFormulas onBack={handleBackToWelcome} />

      default:
        return renderWelcomeScreen()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      {currentPage !== 'welcome' && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToWelcome}
                  className="text-gray-600 hover:text-gray-800 transition"
                >
                  ← Back to Ideas Hub
                </button>
                <div className="w-8 h-8 bg-gradient-to-br from-slate-800 via-slate-700 to-teal-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {currentPage === 'talk-with-marcus' && 'Talk with Marcus'}
                    {currentPage === 'ai-suggested' && 'AI Suggested Topics'}
                    {currentPage === 'repurpose-content' && 'Repurpose Content'}
                    {currentPage === 'content-formulas' && 'Content Formulas'}
                  </h1>
                  <p className="text-sm text-gray-600">Content Ideation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className={currentPage !== 'welcome' ? "pt-0" : ""}>
        {renderPageContent()}
      </div>
    </div>
  )
}
