'use client'

import { useState } from 'react'
import WriterSuiteStep1 from './WriterSuiteStep1'
import WriterSuiteStep2 from './WriterSuiteStep2'
import WriterSuiteStep3 from './WriterSuiteStep3'
import WriterSuiteStep4 from './WriterSuiteStep4'
import WriterSuiteStep5 from './WriterSuiteStep5'
import WriterSuiteChoice from './WriterSuiteChoice'
import MarcusCopilot from './MarcusCopilot'

type WriterSuiteStep = 1 | 2 | 3 | 4 | 5

interface WriterSuiteData {
  // Step 1: Topic Discovery
  topic: string
  topicSource: 'ai' | 'user'
  
  // Step 2: Angle & Hook Development
  selectedAngle?: {
    id: string
    type: 'personal' | 'data' | 'contrarian'
    title: string
    description: string
    psychology: string
    audienceFit: number
  }
  
  // Step 3: Content Formula Selection
  selectedFormula?: {
    id: string
    name: string
    match: number
    description: string
    template: string[]
    whyItWorks: string
  }
  
  // Step 4: Guided Writing Interface
  sections?: Record<string, string>
  
  // Step 5: AI Enhancement & Polish
  finalContent?: string
  appliedEnhancements?: any[]
}

interface WriterSuiteProps {
  onComplete?: (data: WriterSuiteData) => void
  onExit?: () => void
}

export default function WriterSuite({ onComplete, onExit }: WriterSuiteProps) {
  const [showChoice, setShowChoice] = useState(true)
  const [selectedMode, setSelectedMode] = useState<'marcus' | 'classic' | null>(null)
  const [currentStep, setCurrentStep] = useState<WriterSuiteStep>(1)
  const [suiteData, setSuiteData] = useState<WriterSuiteData>({
    topic: '',
    topicSource: 'user'
  })

  // Step 1 handlers
  const handleStep1Continue = (data: { topic: string; source: 'ai' | 'user' }) => {
    setSuiteData(prev => ({
      ...prev,
      topic: data.topic,
      topicSource: data.source
    }))
    setCurrentStep(2)
  }

  // Step 2 handlers
  const handleStep2Continue = (data: { selectedAngle: any }) => {
    setSuiteData(prev => ({
      ...prev,
      selectedAngle: data.selectedAngle
    }))
    setCurrentStep(3)
  }

  const handleStep2Back = () => {
    setCurrentStep(1)
  }

  // Step 3 handlers
  const handleStep3Continue = (data: { selectedFormula: any }) => {
    setSuiteData(prev => ({
      ...prev,
      selectedFormula: data.selectedFormula
    }))
    setCurrentStep(4)
  }

  const handleStep3Back = () => {
    setCurrentStep(2)
  }

  // Step 4 handlers
  const handleStep4Continue = (data: { sections: Record<string, string> }) => {
    setSuiteData(prev => ({
      ...prev,
      sections: data.sections
    }))
    setCurrentStep(5)
  }

  const handleStep4Back = () => {
    setCurrentStep(3)
  }

  // Step 5 handlers
  const handleStep5Finish = (data: { finalContent: string; enhancements: any[] }) => {
    const finalData = {
      ...suiteData,
      finalContent: data.finalContent,
      appliedEnhancements: data.enhancements
    }
    
    setSuiteData(finalData)
    
    // Call completion callback if provided
    if (onComplete) {
      onComplete(finalData)
    }
    
    // For now, we'll just console log the complete data
    console.log('🎉 Writer Suite Complete!', finalData)
  }

  const handleStep5Back = () => {
    setCurrentStep(4)
  }

  // Emergency exit handler
  const handleExit = () => {
    if (onExit) {
      onExit()
    } else {
      // Default behavior - could navigate back to regular generator
      console.log('Exiting Writer Suite...')
    }
  }

  // Render the appropriate step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <WriterSuiteStep1 
            onContinue={handleStep1Continue}
          />
        )
      
      case 2:
        return (
          <WriterSuiteStep2 
            topic={suiteData.topic}
            onContinue={handleStep2Continue}
            onBack={handleStep2Back}
          />
        )
      
      case 3:
        return (
          <WriterSuiteStep3 
            topic={suiteData.topic}
            selectedAngle={suiteData.selectedAngle}
            onContinue={handleStep3Continue}
            onBack={handleStep3Back}
          />
        )
      
      case 4:
        return (
          <WriterSuiteStep4 
            topic={suiteData.topic}
            selectedAngle={suiteData.selectedAngle}
            selectedFormula={suiteData.selectedFormula}
            onContinue={handleStep4Continue}
            onBack={handleStep4Back}
          />
        )
      
      case 5:
        return (
          <WriterSuiteStep5 
            topic={suiteData.topic}
            selectedAngle={suiteData.selectedAngle}
            selectedFormula={suiteData.selectedFormula}
            sections={suiteData.sections || {}}
            onFinish={handleStep5Finish}
            onBack={handleStep5Back}
          />
        )
      
      default:
        return <div>Invalid step</div>
    }
  }

  // If showing choice screen, render that
  if (showChoice) {
    return (
      <WriterSuiteChoice 
        onModeSelect={(mode) => {
          setSelectedMode(mode)
          setShowChoice(false)
          if (mode === 'marcus') {
            // Marcus mode doesn't need the step system
            // It will handle its own flow
          } else {
            // Classic mode starts with step 1
            setCurrentStep(1)
          }
        }}
      />
    )
  }

  // If Marcus mode is selected, show Marcus
  if (selectedMode === 'marcus') {
    return <MarcusCopilot onBackToChoice={() => setShowChoice(true)} />
  }

  // Otherwise, show the classic 5-step process
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back to Choice Option */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowChoice(true)}
                className="text-gray-600 hover:text-gray-800 transition"
              >
                ← Back to Mode Selection
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-slate-800 via-slate-700 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">WS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Writer Suite Classic</h1>
                <p className="text-sm text-gray-600">Step-by-step Content Creation</p>
              </div>
            </div>
            
            {/* Exit Button */}
            <button
              onClick={handleExit}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Exit Suite
            </button>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1">
        {renderCurrentStep()}
      </div>

      {/* Debug Panel (Remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm">
          <div className="font-bold mb-2">Debug Info:</div>
          <div>Mode: {selectedMode}</div>
          <div>Current Step: {currentStep}</div>
          <div>Topic: {suiteData.topic || 'Not set'}</div>
          <div>Angle: {suiteData.selectedAngle?.type || 'Not selected'}</div>
          <div>Formula: {suiteData.selectedFormula?.name || 'Not selected'}</div>
          <div>Sections: {Object.keys(suiteData.sections || {}).length}</div>
        </div>
      )}
    </div>
  )
}
