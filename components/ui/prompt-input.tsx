"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ArrowUp } from "lucide-react"
import TypingAnimation from "@/components/magicui/typing-animation"
import { AITextLoading } from "@/components/kokonutui/ai-text-loading"

interface PromptInputProps {
  isLoading?: boolean
  className?: string
}

const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(({ isLoading = false, className }, ref) => {
  const [phase, setPhase] = React.useState<"typing" | "hidden" | "loading">("typing")
  const [key, setKey] = React.useState(0)

  React.useEffect(() => {
    const typingDuration = 50 * "Hey Lisa can you help me write a topic about...".length + 500 // delay + typing time

    const hideTimer = setTimeout(() => {
      setPhase("hidden")
    }, typingDuration + 1000) // 1 second after typing completes

    const loadingTimer = setTimeout(() => {
      setPhase("loading")
    }, typingDuration + 2000) // Show loading after 1 second of being hidden

    const restartTimer = setTimeout(() => {
      setPhase("typing")
      setKey((prev) => prev + 1) // Reset typing animation
    }, typingDuration + 4500) // Show loading for 2.5 seconds then restart

    return () => {
      clearTimeout(hideTimer)
      clearTimeout(loadingTimer)
      clearTimeout(restartTimer)
    }
  }, [key]) // Re-run when key changes to create loop

  if (phase === "hidden") {
    return null
  }

  if (phase === "loading") {
    return (
      <div className={cn("relative", className)} ref={ref}>
        <AITextLoading className="text-gray-400" />
      </div>
    )
  }

  return (
    <div className={cn("relative", className)} ref={ref}>
      <div className="relative flex items-center w-full rounded-full border border-gray-200 bg-gray-50 px-6 py-4 shadow-sm blur-[1px] hover:blur-none transition-all duration-300">
        <div className="flex-1">
          <TypingAnimation
            key={key}
            className="text-base text-gray-500 font-normal leading-normal tracking-normal drop-shadow-none text-left"
            duration={50}
            delay={500}
          >
            Hey Lisa can you help me write a topic about...
          </TypingAnimation>
        </div>
        <button
          type="button"
          disabled={isLoading}
          className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})
PromptInput.displayName = "PromptInput"

export { PromptInput }
