'use client'

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Strikethrough, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react'

// This is the new Rich Text Editor component
const RichTextEditor = ({ content, onChange }: { content: string, onChange: (newContent: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      BubbleMenu.configure({
        element: document.querySelector('.menu-container') as HTMLElement,
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  })

  // When the external content changes (e.g., switching drafts), update the editor
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 min-h-[300px]">
      {/* Basic Toolbar */}
      <div className="p-2 border-b border-gray-200 flex items-center space-x-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded ${editor.isActive('strike') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        >
          <Strikethrough className="w-4 h-4" />
        </button>
      </div>

      {/* Inline AI Tools Bubble Menu */}
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <div className="flex space-x-1 bg-gray-800 text-white rounded-lg p-1 shadow-lg">
          <button className="flex items-center space-x-1 p-2 rounded hover:bg-gray-700">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Improve</span>
          </button>
          <button className="flex items-center space-x-1 p-2 rounded hover:bg-gray-700">
            <ArrowRight className="w-4 h-4" />
            <span className="text-sm">Expand</span>
          </button>
          <button className="flex items-center space-x-1 p-2 rounded hover:bg-gray-700">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Shorten</span>
          </button>
        </div>
      </BubbleMenu>

      <EditorContent editor={editor} />
    </div>
  )
}

// Need to import useEffect from react
import { useEffect } from 'react';

export default RichTextEditor
