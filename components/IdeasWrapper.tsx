'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Archive } from 'lucide-react'
import IdeasHub from './IdeasHub'
import IdeaLibrary from './IdeaLibrary'
import { ContentIdea } from '../lib/supabase'

type WorkflowState = 'top-level' | 'in-ideation-subpage' | 'in-creation-flow'

interface IdeasWrapperProps {
  activeTab: 'hub' | 'library'
  onNavigateToCreate?: (mode: 'standard' | 'power', ideationData: any) => void
  onUseInStandardMode?: (idea: ContentIdea) => void
  onUseInWriterSuite?: (idea: ContentIdea) => void
  onWorkflowStateChange?: (state: 'top-level' | 'in-ideation-subpage' | 'in-creation-flow') => void
  onTabChange?: (tab: 'hub' | 'library') => void  // Add this
}

export default function IdeasWrapper({ 
  activeTab,
  onTabChange,
  onNavigateToCreate, 
  onUseInStandardMode, 
  onUseInWriterSuite,
  onWorkflowStateChange
}: IdeasWrapperProps) {
  const [workflowState, setWorkflowState] = useState<WorkflowState>('top-level')
  const [hubSubPage, setHubSubPage] = useState<string>('welcome')
  const [fromLibrary, setFromLibrary] = useState(false)

  // Determine if header should be visible
  const shouldShowHeader = () => {
    if (activeTab === 'hub') {
      return hubSubPage === 'welcome' // Only on Ideas Hub welcome page
    } else {
      return workflowState === 'top-level' // Only on Idea Library main page
    }
  }

  // Enhanced navigation handlers
  const handleNavigateToCreate = (mode: 'standard' | 'power', ideationData: any) => {
    setWorkflowState('in-creation-flow')
    setFromLibrary(false)
    if (onNavigateToCreate) {
      onNavigateToCreate(mode, ideationData)
    }
  }

  const handleUseInStandardMode = (idea: ContentIdea) => {
    setWorkflowState('in-creation-flow') // This will hide header
    setFromLibrary(true)
    if (onUseInStandardMode) {
      onUseInStandardMode(idea)
    }
  }

  const handleUseInWriterSuite = (idea: ContentIdea) => {
    setWorkflowState('in-creation-flow') // This will hide header
    setFromLibrary(true)
    if (onUseInWriterSuite) {
      onUseInWriterSuite(idea)
    }
  }

  const handleHubPageChange = (page: string) => {
    setHubSubPage(page)
    if (page === 'welcome') {
      setWorkflowState('top-level')
    } else {
      setWorkflowState('in-ideation-subpage') // This will hide header
    }
  }

  const resetToTopLevel = () => {
    setWorkflowState('top-level')
    setFromLibrary(false)
    setHubSubPage('welcome') // Reset to welcome page
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Conditional Header Bar */}
      {shouldShowHeader() && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              {/* Left: Tabs */}
              <div className="flex items-center space-x-8">
                <button
                  onClick={() => onTabChange?.('hub')}
                  className={`relative py-2 px-1 font-medium text-sm transition-colors border-b-2 ${
                    activeTab === 'hub'
                      ? 'text-teal-600 border-teal-600'
                      : 'text-gray-500 hover:text-gray-700 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Ideas Hub</span>
                  </div>
                </button>

                <button
                  onClick={() => onTabChange?.('library')}
                  className={`relative py-2 px-1 font-medium text-sm transition-colors border-b-2 ${
                    activeTab === 'library'
                      ? 'text-teal-600 border-teal-600'
                      : 'text-gray-500 hover:text-gray-700 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Archive className="w-4 h-4" />
                    <span>Idea Library</span>
                  </div>
                </button>
              </div>

              {/* Right: Optional actions/status */}
              <div className="text-sm text-gray-500">
                {/* Could add search, filters, or other actions here */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div>
        {activeTab === 'hub' ? (
          <EnhancedIdeasHub 
            onNavigateToCreate={handleNavigateToCreate}
            onPageChange={handleHubPageChange}
            onResetToTopLevel={resetToTopLevel}
          />
        ) : (
          <IdeaLibrary 
            onUseInStandardMode={handleUseInStandardMode}
            onUseInWriterSuite={handleUseInWriterSuite}
          />
        )}
      </div>
    </div>
  )
}

// Enhanced IdeasHub wrapper that tracks internal page changes
interface EnhancedIdeasHubProps {
  onNavigateToCreate?: (mode: 'standard' | 'power', ideationData: any) => void
  onPageChange?: (page: string) => void
  onResetToTopLevel?: () => void
}

function EnhancedIdeasHub({ onNavigateToCreate, onPageChange, onResetToTopLevel }: EnhancedIdeasHubProps) {
  return (
    <IdeasHub
      onNavigateToCreate={onNavigateToCreate}
      onPageChange={onPageChange}
      onIdeationComplete={(ideation) => {
        console.log('Ideation completed:', ideation)
        // Handle ideation completion
      }}
    />
  )
}
