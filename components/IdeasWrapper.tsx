'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Archive, ArrowRight } from 'lucide-react'
import IdeasHub from './IdeasHub'
import IdeaLibrary from './IdeaLibrary'
import { ContentIdea } from '../lib/supabase'

type IdeasTab = 'hub' | 'library'
type WorkflowState = 'top-level' | 'in-ideation-subpage' | 'in-creation-flow'

interface IdeasWrapperProps {
  activeTab: 'hub' | 'library'
  onNavigateToCreate?: (mode: 'standard' | 'power', ideationData: any) => void
  onUseInStandardMode?: (idea: ContentIdea) => void
  onUseInWriterSuite?: (idea: ContentIdea) => void
  onWorkflowStateChange?: (state: 'top-level' | 'in-ideation-subpage' | 'in-creation-flow') => void
}

export default function IdeasWrapper({ 
  activeTab,
  onNavigateToCreate, 
  onUseInStandardMode, 
  onUseInWriterSuite,
  onWorkflowStateChange
}: IdeasWrapperProps) {
  const [workflowState, setWorkflowState] = useState<WorkflowState>('top-level')
  const [hubSubPage, setHubSubPage] = useState<string>('welcome')
  const [fromLibrary, setFromLibrary] = useState(false)

  // Monitor IdeasHub internal state changes
  useEffect(() => {
    // This would be called by IdeasHub when entering sub-pages
    // For now, we'll simulate this logic
  }, [])

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

  // Reset function for when user completes workflows
  const resetToTopLevel = () => {
    setWorkflowState('top-level')
    setFromLibrary(false)
    setActiveTab('hub')
  }

  return (
    <div className="min-h-screen bg-gray-50">

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
