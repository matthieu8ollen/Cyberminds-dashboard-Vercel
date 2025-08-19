declare global {
  interface Window {
    exitWorkflow?: () => void
    continueWorkflowToImages?: (contentId: string) => void
  }
}

export {}
