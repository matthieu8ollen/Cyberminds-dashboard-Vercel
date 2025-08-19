'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { 
  saveWorkflowState, 
  updateWorkflowState, 
  getUserWorkflowState,
  deleteWorkflowState,
  WorkflowState,
  IdeationOutput,
  supabase
} from '../lib/supabase'

interface WorkflowContextType {
  workflowState: WorkflowState | null
  ideationData: IdeationOutput | null
  currentStage: 'ideas' | 'create' | 'image' | 'pipeline'
  
  // Workflow actions
  startIdeation: (ideationData: IdeationOutput) => Promise<void>
  moveToCreate: (createMode: string) => Promise<void>
  moveToImages: (contentId: string) => Promise<void>
  moveToPipeline: (contentId: string) => Promise<void>
  completeWorkflow: () => Promise<void>
  
  // Auto-save
  saveProgress: (stageData: any) => Promise<void>
  loadUserProgress: () => Promise<void>
  clearProgress: () => Promise<void>
  clearAllProgress: () => Promise<void>
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

export const useWorkflow = () => {
  const context = useContext(WorkflowContext)
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider')
  }
  return context
}

interface WorkflowProviderProps {
  children: React.ReactNode
}

export const WorkflowProvider: React.FC<WorkflowProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null)
  const [ideationData, setIdeationData] = useState<IdeationOutput | null>(null)
  const [currentStage, setCurrentStage] = useState<'ideas' | 'create' | 'image' | 'pipeline'>('ideas')

  // Load user's existing workflow progress on mount
  useEffect(() => {
    if (user) {
      loadUserProgress()
    }
  }, [user])

  // Setup auto-save when workflow is active
useEffect(() => {
  if (workflowState) {
    const cleanup = setupAutoSave()
    return cleanup
  }
}, [workflowState])

  const startIdeation = async (ideation: IdeationOutput) => {
    if (!user) return

    try {
      setIdeationData(ideation)
      setCurrentStage('ideas')

      const { data } = await saveWorkflowState({
        user_id: user.id,
        session_id: ideation.session_id,
        current_stage: 'ideas',
        stage_data: { ideation },
        continuation_route: '/ideas',
        last_save: new Date().toISOString()
      })

      if (data) {
        setWorkflowState(data)
      }
    } catch (error) {
      console.error('Error starting ideation workflow:', error)
    }
  }

  const moveToCreate = async (createMode: string) => {
    if (!user || !workflowState) return

    try {
      setCurrentStage('create')

      const { data } = await updateWorkflowState(workflowState.id, {
        current_stage: 'create',
        stage_data: { 
          ...workflowState.stage_data,
          createMode,
          transitionTime: new Date().toISOString()
        },
        continuation_route: `/create/${createMode}`
      })

      if (data) {
        setWorkflowState(data)
      }
    } catch (error) {
      console.error('Error moving to create stage:', error)
    }
  }

  const moveToImages = async (contentId: string) => {
    if (!user || !workflowState) return

    try {
      setCurrentStage('image')

      const { data } = await updateWorkflowState(workflowState.id, {
        current_stage: 'image',
        stage_data: { 
          ...workflowState.stage_data,
          contentId,
          transitionTime: new Date().toISOString()
        },
        continuation_route: `/images?contentId=${contentId}`
      })

      if (data) {
        setWorkflowState(data)
      }
    } catch (error) {
      console.error('Error moving to images stage:', error)
    }
  }

  const moveToPipeline = async (contentId: string) => {
    if (!user || !workflowState) return

    try {
      setCurrentStage('pipeline')

      const { data } = await updateWorkflowState(workflowState.id, {
        current_stage: 'pipeline',
        stage_data: { 
          ...workflowState.stage_data,
          contentId,
          transitionTime: new Date().toISOString()
        },
        continuation_route: `/pipeline?contentId=${contentId}`
      })

      if (data) {
        setWorkflowState(data)
      }
    } catch (error) {
      console.error('Error moving to pipeline stage:', error)
    }
  }

  const completeWorkflow = async () => {
    if (!workflowState) return

    try {
      // Clear workflow state
      setWorkflowState(null)
      setIdeationData(null)
      setCurrentStage('ideas')

      // Could delete the workflow state from database or mark as complete
      // For now, we'll keep it for analytics
    } catch (error) {
      console.error('Error completing workflow:', error)
    }
  }

  const saveProgress = async (stageData: any) => {
  if (!user || !workflowState) return

  try {
    const { data } = await updateWorkflowState(workflowState.id, {
      stage_data: { 
        ...workflowState.stage_data,
        ...stageData,
        lastAutoSave: new Date().toISOString()
      }
    })

    if (data) {
      setWorkflowState(data)
    }
  } catch (error) {
    console.error('Error saving progress:', error)
  }
}

// Auto-save every 30 seconds
const setupAutoSave = () => {
  const interval = setInterval(() => {
    if (workflowState && currentStage !== 'ideas') {
      saveProgress({ autoSave: true })
    }
  }, 30000) // 30 seconds

  return () => clearInterval(interval)
}

  const loadUserProgress = async () => {
    if (!user) return

    try {
      const { data, error } = await getUserWorkflowState(user.id)
      
      if (data && !error) {
        setWorkflowState(data)
        setCurrentStage(data.current_stage)
        
        // Extract ideation data if it exists
        if (data.stage_data?.ideation) {
          setIdeationData(data.stage_data.ideation)
        }
      }
    } catch (error) {
      console.error('Error loading user progress:', error)
    }
  }

  const clearProgress = async () => {
  try {
    // Delete from database to prevent ghost workflows
    if (workflowState?.id) {
      await deleteWorkflowState(workflowState.id)
    }
  } catch (error) {
    console.error('Error clearing workflow state:', error)
  }
  
  setWorkflowState(null)
  setIdeationData(null)
  setCurrentStage('ideas')
}

  const clearAllProgress = async () => {
  if (!user) return
  
  try {
    console.log('🧹 Clearing ALL workflow states for user')
    const { error } = await supabase
      .from('workflow_states')
      .delete()
      .eq('user_id', user.id)
    
    if (error) throw error
    
    console.log('✅ All workflow states cleared')
  } catch (error) {
    console.error('Error clearing all workflow states:', error)
  }
  
  setWorkflowState(null)
  setIdeationData(null)
  setCurrentStage('ideas')
}

  const contextValue: WorkflowContextType = {
  workflowState,
  ideationData,
  currentStage,
  startIdeation,
  moveToCreate,
  moveToImages,
  moveToPipeline,
  completeWorkflow,
  saveProgress,
  loadUserProgress,
  clearProgress,
  clearAllProgress
}

  return (
    <WorkflowContext.Provider value={contextValue}>
      {children}
    </WorkflowContext.Provider>
  )
}
