'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Bold, 
  Italic, 
  List, 
  Hash, 
  Zap, 
  Lightbulb, 
  RotateCcw, 
  Sparkles,
  Type,
  Plus,
  Wand2
} from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  onAIImprove?: (text: string, type: 'bold' | 'improve' | 'expand') => Promise<string>
}

interface AIToolButton {
  id: string
  label: string
  icon: any
  description: string
  action: 'bold' | 'improve' | 'expand'
  shortcut?: string
}

const AI_TOOLS: AIToolButton[] = [
  {
    id: 'bold',
    label: 'Make Bolder',
    icon: Zap,
    description: 'Make this text more direct and confident',
    action: 'bold',
    shortcut: 'Cmd+B'
  },
  {
    id: 'improve',
    label: 'Improve',
    icon: Wand2,
    description: 'Enhance clarity and impact',
    action: 'improve',
    shortcut: 'Cmd+I'
  },
  {
    id: 'expand',
    label: 'Expand',
    icon: Plus,
    description: 'Add more detail and context',
    action: 'expand',
    shortcut: 'Cmd+E'
  }
]

export default function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing your post...",
  onAIImprove 
}: RichTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null)
  const [showAITools, setShowAITools] = useState(false)
  const [aiToolPosition, setAiToolPosition] = useState({ x: 0, y: 0 })
  const [isProcessingAI, setIsProcessingAI] = useState(false)
  const [processingTool, setProcessingTool] = useState<string | null>(null)
  
  const editorRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = formatContentForEditor(content)
    }
  }, [content])

  const formatContentForEditor = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/#(\w+)/g, '<span class="hashtag">#$1</span>')
      .replace(/\n/g, '<br>')
  }

  const extractPlainText = (html: string): string => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  }

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const htmlContent = editorRef.current.innerHTML
      const plainText = extractPlainText(htmlContent)
      onChange(plainText)
    }
  }, [onChange])

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim().length > 0) {
      const selectedText = selection.toString()
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      
      setSelectedText(selectedText)
      setAiToolPosition({
        x: rect.left + (rect.width / 2),
        y: rect.top - 60
      })
      setShowAITools(true)
    } else {
      setShowAITools(false)
      setSelectedText('')
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          if (selectedText && onAIImprove) {
            handleAIImprovement('bold')
          } else {
            document.execCommand('bold')
          }
          break
        case 'i':
          e.preventDefault()
          if (selectedText && onAIImprove) {
            handleAIImprovement('improve')
          } else {
            document.execCommand('italic')
          }
          break
        case 'e':
          e.preventDefault()
          if (selectedText && onAIImprove) {
            handleAIImprovement('expand')
          }
          break
      }
    }
  }

  const handleAIImprovement = async (type: 'bold' | 'improve' | 'expand') => {
    if (!selectedText || !onAIImprove) return

    setIsProcessingAI(true)
    setProcessingTool(type)
    
    try {
      const improvedText = await onAIImprove(selectedText, type)
      
      // Replace selected text with improved version
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        range.insertNode(document.createTextNode(improvedText))
        
        // Clear selection and update content
        selection.removeAllRanges()
        handleInput()
      }
      
      setShowAITools(false)
      setSelectedText('')
    } catch (error) {
      console.error('AI improvement failed:', error)
    } finally {
      setIsProcessingAI(false)
      setProcessingTool(null)
    }
  }

  const insertFormatting = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const insertBulletPoint = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const bulletPoint = document.createElement('div')
      bulletPoint.innerHTML = '• '
      range.insertNode(bulletPoint)
      range.setStartAfter(bulletPoint)
      range.setEndAfter(bulletPoint)
      selection.removeAllRanges()
      selection.addRange(range)
      handleInput()
    }
  }

  const insertHashtag = () => {
    const hashtag = prompt('Enter hashtag (without #):')
    if (hashtag) {
      insertFormatting('insertText', `#${hashtag}`)
    }
  }

  return (
    <div className="relative">
      {/* Formatting Toolbar */}
      <div 
        ref={toolbarRef}
        className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-t-lg border-b-0"
      >
        <div className="flex items-center space-x-1">
          <button
            onClick={() => insertFormatting('bold')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Bold (Cmd+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => insertFormatting('italic')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Italic (Cmd+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          <button
            onClick={insertBulletPoint}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Bullet Point"
          >
            <List className="w-4 h-4" />
          </button>
          
          <button
            onClick={insertHashtag}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Insert Hashtag"
          >
            <Hash className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1" />
        
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Lightbulb className="w-3 h-3" />
          <span>Select text for AI improvements</span>
        </div>
      </div>

      {/* Rich Text Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onMouseUp={handleTextSelection}
        onKeyUp={handleTextSelection}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsEditing(true)}
        onBlur={() => {
          setIsEditing(false)
          setTimeout(() => setShowAITools(false), 200)
        }}
        className={`
          min-h-[300px] p-4 border border-gray-200 rounded-b-lg bg-white
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          prose prose-sm max-w-none
          ${isEditing ? 'ring-2 ring-indigo-500 border-transparent' : ''}
        `}
        style={{
          lineHeight: '1.6',
          fontSize: '14px'
        }}
        suppressContentEditableWarning={true}
      />

      {/* Floating AI Tools */}
      {showAITools && selectedText && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center space-x-2"
          style={{
            left: `${aiToolPosition.x}px`,
            top: `${aiToolPosition.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          {AI_TOOLS.map((tool) => {
            const Icon = tool.icon
            const isProcessing = isProcessingAI && processingTool === tool.action
            
            return (
              <button
                key={tool.id}
                onClick={() => handleAIImprovement(tool.action)}
                disabled={isProcessingAI}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isProcessing 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                title={`${tool.description} (${tool.shortcut})`}
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span>{tool.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Editor Guidelines */}
      <div className="mt-2 text-xs text-gray-500 flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <Type className="w-3 h-3" />
          <span>Use Cmd+B/I for basic formatting</span>
        </div>
        <div className="flex items-center space-x-1">
          <Sparkles className="w-3 h-3" />
          <span>Select text and use AI tools for improvements</span>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .hashtag {
          color: #3b82f6;
          font-weight: 500;
        }
        
        [contenteditable] strong {
          font-weight: 600;
          color: #1f2937;
        }
        
        [contenteditable] em {
          font-style: italic;
          color: #4b5563;
        }
        
        [contenteditable]:empty:before {
          content: "${placeholder}";
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
