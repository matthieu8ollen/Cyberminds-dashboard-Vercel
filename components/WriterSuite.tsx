'use client'

import MarcusCopilot from './MarcusCopilot'

interface WriterSuiteProps {
  onComplete?: (data: any) => void
  onBack?: () => void
  ideationData?: any
  aiFormulas?: any[]
  isLoadingAIFormulas?: boolean
  onExitWorkflow?: () => void
  onContinueToImages?: (contentId: string) => void
  onUserStartedWorking?: () => void
}

export default function WriterSuite({ 
  onComplete, 
  onBack, 
  ideationData, 
  aiFormulas = [],
  isLoadingAIFormulas = false,
  onExitWorkflow, 
  onContinueToImages,
  onUserStartedWorking
}: WriterSuiteProps) {
  return (
  <MarcusCopilot 
    onComplete={onComplete}
    onBack={onBack}
    ideationData={ideationData}
    aiFormulas={aiFormulas}
    isLoadingAIFormulas={isLoadingAIFormulas}
    onExitWorkflow={onExitWorkflow}
    onContinueToImages={onContinueToImages}
    onUserStartedWorking={onUserStartedWorking}
  />
)
}
