'use client'

import MarcusCopilot from './MarcusCopilot'

interface WriterSuiteProps {
  onComplete?: (data: any) => void
  onBack?: () => void
  ideationData?: any
  onExitWorkflow?: () => void
  onContinueToImages?: (contentId: string) => void
  onUserStartedWorking?: () => void
}

export default function WriterSuite({ 
  onComplete, 
  onBack, 
  ideationData, 
  onExitWorkflow, 
  onContinueToImages,
  onUserStartedWorking
}: WriterSuiteProps) {
  return (
  <MarcusCopilot 
    onComplete={onComplete}
    onBack={onBack}
    ideationData={ideationData}
    onExitWorkflow={onExitWorkflow}
    onContinueToImages={onContinueToImages}
    onUserStartedWorking={onUserStartedWorking}
  />
)
}
