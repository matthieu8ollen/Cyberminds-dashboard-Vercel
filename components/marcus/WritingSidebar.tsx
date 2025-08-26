'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SectionData {
  id: string
  title: string
  content: string
  guidance: string
  placeholder: string
  completed: boolean
  wordCountTarget?: number
}

interface FormulaTemplate {
  name: string
}

interface WritingSidebarProps {
  formula: FormulaTemplate
  sections: SectionData[]
  currentSectionIndex: number
  totalSections: number
  sidebarCollapsed: boolean
  onSectionNavigation: (index: number) => void
  onToggleCollapse: () => void
}

export default function WritingSidebar({
  formula,
  sections,
  currentSectionIndex,
  totalSections,
  sidebarCollapsed,
  onSectionNavigation,
  onToggleCollapse
}: WritingSidebarProps) {
  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
      sidebarCollapsed ? 'w-16' : 'w-80'
    }`}>
      {/* Sidebar Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        {!sidebarCollapsed && (
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{formula.name}</h2>
            <p className="text-sm text-gray-600">Section {currentSectionIndex + 1} of {totalSections}</p>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      
      {/* Section Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => onSectionNavigation(index)}
              className={`w-full p-3 text-left rounded-lg border transition-all ${
                index === currentSectionIndex 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${
                section.completed && index !== currentSectionIndex 
                  ? 'bg-teal-50 border-l-4 border-l-teal-600' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  section.completed 
                    ? 'bg-green-500 text-white' 
                    : index === currentSectionIndex 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {section.completed ? '✓' : index + 1}
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{section.title}</div>
                    <div className="text-xs text-gray-500">
                      {section.content.trim().split(/\s+/).length} words
                      {section.wordCountTarget && ` / ${section.wordCountTarget} target`}
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
