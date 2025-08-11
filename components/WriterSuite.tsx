'use client'

import MarcusCopilot from './MarcusCopilot'

interface WriterSuiteProps {
  onComplete?: (data: any) => void
}

export default function WriterSuite({ onComplete }: WriterSuiteProps) {
  return (
    <MarcusCopilot 
      onComplete={onComplete}
    />
  )
}
