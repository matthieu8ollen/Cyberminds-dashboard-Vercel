'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Strikethrough, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react'

// This is the new Rich Text Editor component for Phase 4
const RichTextEditor = ({ content, onChange }: { content: string, onChange: (newContent: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configure extensions as needed
      }),
      BubbleMenu.configure({
        element: document.querySelector('.menu-container') as HTMLElement,
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose max-w-none p-4 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  })

  // When the external content changes (e.g., switching drafts), update the editor
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content, false); // 'false' prevents the cursor from jumping
    }
  }, [content, editor]);

  if (!editor) {
    return null
  }

  return (
    <div className="bg-white rounded-lg border border-gray-300 min-h-[350px] flex flex-col">
      {/* Basic Toolbar */}
      <div className="p-2 border-b border-gray-200 flex items-center space-x-1 bg-gray-50 rounded-t-lg">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`p-2 rounded ${editor.isActive('strike') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
        >
          <Strikethrough className="w-4 h-4" />
        </button>
      </div>

      {/* Inline AI Tools Bubble Menu */}
      {editor && <BubbleMenu editor={editor} tippyOptions={{ duration: 100, placement: 'top-start' }}>
        <div className="flex space-x-1 bg-gray-800 text-white rounded-lg p-1 shadow-xl border border-gray-700">
          <button className="flex items-center space-x-1 p-2 rounded hover:bg-gray-700 transition-colors">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Improve</span>
          </button>
          <div className="border-r border-gray-600 h-6 my-auto"></div>
          <button className="flex items-center space-x-1 p-2 rounded hover:bg-gray-700 transition-colors">
            <ArrowRight className="w-4 h-4" />
            <span className="text-sm font-medium">Expand</span>
          </button>
          <button className="flex items-center space-x-1 p-2 rounded hover:bg-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Shorten</span>
          </button>
        </div>
      </BubbleMenu>}

      <div className="flex-grow overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default RichTextEditor
