'use client'

import MarcusCopilot from './MarcusCopilot'

interface WriterSuiteProps {
  onComplete?: (data: any) => void
  onBack?: () => void
}

export default function WriterSuite({ onComplete, onBack }: WriterSuiteProps) {
  return (
    <MarcusCopilot 
      onComplete={onComplete}
      onBack={onBack}
    />
  )
}
