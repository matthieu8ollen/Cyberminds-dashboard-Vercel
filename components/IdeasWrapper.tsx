'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Archive, ArrowRight } from 'lucide-react'
import IdeasHub from './IdeasHub'
import IdeaLibrary from './IdeaLibrary'
import { ContentIdea } from '../lib/supabase'

type IdeasTab = 'hub' | 'library'
type WorkflowState = 'top-level' | 'in-ideation-subpage' | 'in-creation-flow'

interface IdeasWrapperProps {
  onNavigateToCreate?: (mode: 'standard' | 'power', ideationData: any) => void
  onUseInStandardMode?: (idea: ContentIdea) => void
  onUseInWriterSuite?: (idea: ContentIdea) => void
}

export default function IdeasWrapper({ 
  onNavigateToCreate, 
  onUseInStandardMode, 
  onUseInWriterSuite 
}: IdeasWrapperProps) {
  const [activeTab, setActiveTab] = useState<IdeasTab>('hub')
  const [workflowState, setWorkflowState] = useState<WorkflowState>('top-level')
  const [hubSubPage, setHubSubPage] = useState<string>('welcome')
  const [fromLibrary, setFromLibrary] = useState(false)

  // Monitor IdeasHub internal state changes
  useEffect(() => {
    // This would be called by IdeasHub when entering sub-pages
    // For now, we'll simulate this logic
  }, [])

  // Determine which tabs should be visible based on workflow state
  const getVisibleTabs = (): IdeasTab[] => {
    if (workflowState === 'in-creation-flow') {
      return fromLibrary ? ['library'] : ['hub']
    }
    if (workflowState === 'in-ideation-subpage') {
      return ['hub']
    }
    return ['hub', 'library'] // Top-level: show both
  }

  const visibleTabs = getVisibleTabs()
  const showTabs = visibleTabs.length > 1

  // Enhanced navigation handlers
  const handleNavigateToCreate = (mode: 'standard' | 'power', ideationData: any) => {
    setWorkflowState('in-creation-flow')
    setFromLibrary(false) // Coming from Hub
    if (onNavigateToCreate) {
      onNavigateToCreate(mode, ideationData)
    }
  }

  const handleUseInStandardMode = (idea: ContentIdea) => {
    setWorkflowState('in-creation-flow')
    setFromLibrary(true) // Coming from Library
    if (onUseInStandardMode) {
      onUseInStandardMode(idea)
    }
  }

  const handleUseInWriterSuite = (idea: ContentIdea) => {
    setWorkflowState('in-creation-flow')
    setFromLibrary(true) // Coming from Library
    if (onUseInWriterSuite) {
      onUseInWriterSuite(idea)
    }
  }

  // Simulate IdeasHub sub-page detection
  // In real implementation, IdeasHub would call this via callback
  const handleHubPageChange = (page: string) => {
    setHubSubPage(page)
    if (page === 'welcome') {
      setWorkflowState('top-level')
    } else {
      setWorkflowState('in-ideation-subpage')
    }
  }

  // Reset to top-level when switching tabs
  const handleTabChange = (tab: IdeasTab) => {
    setActiveTab(tab)
    setWorkflowState('top-level')
    setFromLibrary(false)
  }

  // Reset function for when user completes workflows
  const resetToTopLevel = () => {
    setWorkflowState('top-level')
    setFromLibrary(false)
    setActiveTab('hub')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Navigation - Only show when multiple tabs are visible */}
      {showTabs && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8">
              {/* Hub Tab */}
              {visibleTabs.includes('hub') && (
                <button
                  onClick={() => handleTabChange('hub')}
                  className={`relative py-4 px-1 font-medium text-sm transition-colors border-b-2 ${
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
              )}

              {/* Library Tab */}
              {visibleTabs.includes('library') && (
                <button
                  onClick={() => handleTabChange('library')}
                  className={`relative py-4 px-1 font-medium text-sm transition-colors border-b-2 ${
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className={showTabs ? "pt-0" : ""}>
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
