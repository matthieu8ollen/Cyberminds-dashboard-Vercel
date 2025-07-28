'use client'

import { useState } from 'react'
import { Plus, PenTool } from 'lucide-react'

export default function FloatingNewPostButton() {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
  window.dispatchEvent(new CustomEvent('openModeSelection'))
}

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-50 group"
    >
      {/* Main Button */}
      <div className={`
        w-14 h-14 bg-gradient-to-r from-slate-700 to-teal-600 
        rounded-full shadow-lg hover:shadow-xl 
        flex items-center justify-center
        transform transition-all duration-200 ease-out
        ${isHovered ? 'scale-110' : 'scale-100'}
        hover:from-slate-800 hover:to-teal-700
      `}>
        <Plus className="w-6 h-6 text-white" />
      </div>
      
      {/* Tooltip */}
      <div className={`
        absolute bottom-full right-0 mb-2 px-3 py-2
        bg-gray-900 text-white text-sm rounded-lg
        whitespace-nowrap pointer-events-none
        transform transition-all duration-200 ease-out
        ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}>
        New Post
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </button>
  )
}
