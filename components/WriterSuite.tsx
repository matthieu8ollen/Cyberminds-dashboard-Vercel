'use client'

import MarcusCopilot from './MarcusCopilot'

interface WriterSuiteProps {
  onComplete?: (data: any) => void
  onBack?: () => void
  ideationData?: any
}

export default function WriterSuite({ onComplete, onBack, ideationData }: WriterSuiteProps) {
  return (
    <MarcusCopilot 
      onComplete={onComplete}
      onBack={onBack}
      ideationData={ideationData}
    />
  )
}
