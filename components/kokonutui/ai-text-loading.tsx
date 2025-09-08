"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AITextLoadingProps {
  className?: string
}

const AITextLoading = React.forwardRef<HTMLDivElement, AITextLoadingProps>(({ className }, ref) => {
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0)
  const words = ["Thinking", "Processing", "Analyzing", "Generating"]

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length)
    }, 1200) // Slowed down from 750ms to 1200ms for more relaxed cycling

    return () => clearInterval(interval)
  }, [words.length])

  return (
    <div className={cn("flex items-center justify-center py-4", className)} ref={ref}>
      <div className="relative overflow-hidden">
        <div
          key={currentWordIndex}
          className="animate-in fade-in-0 slide-in-from-bottom-2 duration-700 text-gray-700 text-xl font-medium" // Increased animation duration from 500ms to 700ms
        >
          <span className="inline-block bg-gradient-to-r from-gray-700 via-gray-900 to-gray-700 bg-clip-text text-transparent animate-pulse bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]">
            {" "}
            {/* Slowed shimmer from 2s to 3s */}
            {words[currentWordIndex]}...
          </span>
        </div>
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
})
AITextLoading.displayName = "AITextLoading"

export { AITextLoading }
