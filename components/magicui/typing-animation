"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface TypingAnimationProps {
  children: string
  className?: string
  duration?: number
  delay?: number
  as?: React.ElementType
  startOnView?: boolean
}

export default function TypingAnimation({
  children,
  className,
  duration = 100,
  delay = 0,
  as: Component = "div",
  startOnView = false,
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [i, setI] = useState(0)

  const text = children || ""

  useEffect(() => {
    const typingEffect = setTimeout(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1))
        setI(i + 1)
      }
    }, duration)

    return () => {
      clearTimeout(typingEffect)
    }
  }, [i, text, duration])

  useEffect(() => {
    if (delay > 0) {
      const delayTimeout = setTimeout(() => {
        setI(0)
      }, delay)
      return () => clearTimeout(delayTimeout)
    }
  }, [delay])

  return (
    <Component
      className={cn(
        "font-display text-center text-4xl font-bold leading-[5rem] tracking-[-0.02em] drop-shadow-sm",
        className,
      )}
    >
      {displayedText}
    </Component>
  )
}

export { TypingAnimation }
