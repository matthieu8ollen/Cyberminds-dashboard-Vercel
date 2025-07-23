'use client'

import { useState, useRef, useEffect } from 'react'
import { Bold, Italic, Link, Type, Zap, Sparkles, PlusCircle } from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  onAIImprove?: (text: string, type: 'bold' | 'improve' | 'expand') => Promise<string>
}

export default function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Start typing...",
  onAIImprove 
}: RichTextEditorProps) {
  const [isAILoading, setIsAILoading] = useState<'bold' | 'improve' | 'expand' | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content
    }
  }, [content])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const handleAIImprovement = async (type: 'bold' | 'improve' | 'expand') => {
    if (!onAIImprove || !editorRef.current) return

    const selection = window.getSelection()
    let textToImprove = content

    if (selection && selection.toString().trim()) {
      textToImprove = selection.toString()
    }

    if (!textToImprove.trim()) return

    setIsAILoading(type)
    try {
      const improvedText = await onAIImprove(textToImprove, type)
      
      if (selection && selection.toString().trim()) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        range.insertNode(document.createTextNode(improvedText))
      } else {
        editorRef.current.innerHTML = improvedText
      }
      
      handleInput()
    } catch (error) {
      console.error('AI improvement failed:', error)
    } finally {
      setIsAILoading(null)
    }
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center space-x-1">
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
          title="Bold (Cmd+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
          title="Italic (Cmd+I)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {onAIImprove && (
          <>
            <button
              type="button"
              onClick={() => handleAIImprovement('bold')}
              disabled={isAILoading === 'bold'}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded transition"
              title="Make text bolder with AI"
            >
              {isAILoading === 'bold' ? (
                <div className="w-3 h-3 border border-orange-600 rounded-full animate-spin border-t-transparent" />
              ) : (
                <Zap className="w-3 h-3" />
              )}
              <span>Bold</span>
            </button>

            <button
              type="button"
              onClick={() => handleAIImprovement('improve')}
              disabled={isAILoading === 'improve'}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition"
              title="Improve clarity with AI"
            >
              {isAILoading === 'improve' ? (
                <div className="w-3 h-3 border border-blue-600 rounded-full animate-spin border-t-transparent" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              <span>Improve</span>
            </button>

            <button
              type="button"
              onClick={() => handleAIImprovement('expand')}
              disabled={isAILoading === 'expand'}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition"
              title="Expand content with AI"
            >
              {isAILoading === 'expand' ? (
                <div className="w-3 h-3 border border-green-600 rounded-full animate-spin border-t-transparent" />
              ) : (
                <PlusCircle className="w-3 h-3" />
              )}
              <span>Expand</span>
            </button>
          </>
        )}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[120px] p-4 focus:outline-none prose max-w-none"
        style={{ wordBreak: 'break-word' }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />
    </div>
  )
}
