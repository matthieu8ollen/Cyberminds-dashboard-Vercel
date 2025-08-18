'use client'

import { CheckCircle, Circle, ArrowRight } from 'lucide-react'

interface WorkflowProgressIndicatorProps {
  route: 'ideas' | 'library' | 'direct' | null
  currentPage: string
}

export default function WorkflowProgressIndicator({ route, currentPage }: WorkflowProgressIndicatorProps) {
  const getStageFromPage = (page: string) => {
    if (page === 'ideas') return 'ideas'
    if (page === 'writer-suite' || page === 'standard') return 'create'
    if (page === 'images') return 'images'
    return 'ideas'
  }

  const getCurrentStage = () => getStageFromPage(currentPage)
  
  const stages = [
    { 
      id: 'ideas', 
      label: 'Ideas', 
      completed: ['create', 'images'].includes(getCurrentStage()),
      active: getCurrentStage() === 'ideas'
    },
    { 
      id: 'create', 
      label: 'Create', 
      completed: getCurrentStage() === 'images',
      active: getCurrentStage() === 'create'
    },
    { 
      id: 'images', 
      label: 'Images', 
      completed: false,
      active: getCurrentStage() === 'images'
    }
  ]

  const getRouteLabel = (route: string | null) => {
    switch (route) {
      case 'ideas': return 'Ideas Hub'
      case 'library': return 'Idea Library'
      case 'direct': return 'Direct Create'
      default: return 'Workflow'
    }
  }

  return (
    <div className="bg-gradient-to-r from-slate-50 to-teal-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Workflow Status */}
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-gradient-to-br from-slate-700 to-teal-600 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-medium text-slate-700">Strict Workflow Active</span>
              <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full ml-2">
                {getRouteLabel(route)}
              </span>
            </div>
          </div>
          
          {/* Center: Progress Steps */}
          <div className="flex items-center space-x-2">
            {stages.map((stage, index) => (
              <div key={stage.id} className="flex items-center">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    stage.completed 
                      ? 'bg-teal-600 text-white' 
                      : stage.active 
                        ? 'bg-slate-600 text-white ring-2 ring-slate-300' 
                        : 'bg-slate-200 text-slate-500'
                  }`}>
                    {stage.completed ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`text-sm font-medium transition-colors ${
                    stage.active 
                      ? 'text-slate-700' 
                      : stage.completed 
                        ? 'text-teal-600'
                        : 'text-slate-500'
                  }`}>
                    {stage.label}
                  </span>
                </div>
                {index < stages.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-400 mx-3" />
                )}
              </div>
            ))}
          </div>
          
          {/* Right: Current Stage Info */}
          <div className="text-right">
            <div className="text-xs text-slate-500">Current Stage</div>
            <div className="text-sm font-medium text-slate-700 capitalize">
              {getCurrentStage()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
