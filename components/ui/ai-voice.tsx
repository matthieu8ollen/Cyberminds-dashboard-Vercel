"use client"

import { useState, useRef, useEffect } from "react"
import { Mic } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIVoiceProps {
  className?: string
  onStart?: () => void
  onStop?: () => void
}

export function AIVoice({ className, onStart, onStop }: AIVoiceProps) {
  const [isListening, setIsListening] = useState(false)
  const [duration, setDuration] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout>()
  const cycleRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const startCycle = () => {
      cycleRef.current = setInterval(() => {
        setIsListening((prev) => {
          if (!prev) {
            // Starting to listen
            onStart?.()
            return true
          } else {
            // Stopping listening
            setDuration(0)
            onStop?.()
            return false
          }
        })
      }, 3000)
    }

    startCycle()

    return () => {
      if (cycleRef.current) {
        clearInterval(cycleRef.current)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [onStart, onStop])

  useEffect(() => {
    if (isListening) {
      intervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isListening])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Generate animated waveform bars
  const generateWaveform = () => {
    const bars = []
    for (let i = 0; i < 40; i++) {
      const height = isListening
        ? Math.random() * 20 + 5 // Random heights when listening
        : 2 // Flat line when not listening
      bars.push(
        <div
          key={i}
          className={cn("bg-gray-400 transition-all duration-150", isListening && "animate-pulse")}
          style={{
            width: "2px",
            height: `${height}px`,
            animationDelay: `${i * 50}ms`,
          }}
        />,
      )
    }
    return bars
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center blur-[1px] hover:blur-none transition-all duration-300",
        className,
      )}
    >
      {/* Icon */}
      <div className="mb-4">
        {isListening ? (
          <div className="w-8 h-8 bg-white transform rotate-45 rounded-sm" />
        ) : (
          <Mic className="w-8 h-8 text-gray-600" />
        )}
      </div>

      {/* Timer */}
      <div className="text-gray-600 text-lg font-mono mb-4">{formatTime(duration)}</div>

      {/* Waveform */}
      <div className="flex items-center justify-center gap-1 mb-4 h-6">{generateWaveform()}</div>

      {/* Status Text */}
      <div className="text-gray-500 text-sm">{isListening ? "Listening..." : "Click to speak"}</div>
    </div>
  )
}
