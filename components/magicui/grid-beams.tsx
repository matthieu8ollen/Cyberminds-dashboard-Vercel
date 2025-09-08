"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface GridBeamsProps {
  children?: React.ReactNode
  gridSize?: number
  gridColor?: string
  rayCount?: number
  rayOpacity?: number
  raySpeed?: number
  rayLength?: string
  gridFadeStart?: number
  gridFadeEnd?: number
  backgroundColor?: string
  className?: string
}

export function GridBeams({
  children,
  gridSize = 40,
  gridColor = "rgba(200, 220, 255, 0.2)",
  rayCount = 15,
  rayOpacity = 0.35,
  raySpeed = 1,
  rayLength = "45vh",
  gridFadeStart = 30,
  gridFadeEnd = 90,
  backgroundColor = "#020412",
  className,
}: GridBeamsProps) {
  return (
    <div className={cn("relative overflow-hidden", className)} style={{ backgroundColor }}>
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${gridColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          maskImage: `linear-gradient(to bottom, transparent ${gridFadeStart}%, white ${gridFadeEnd}%)`,
          WebkitMaskImage: `linear-gradient(to bottom, transparent ${gridFadeStart}%, white ${gridFadeEnd}%)`,
        }}
      />

      {/* Animated Rays */}
      {Array.from({ length: rayCount }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: "2px",
            height: rayLength,
            background: `linear-gradient(to bottom, transparent, rgba(59, 130, 246, ${rayOpacity}), transparent)`,
            transform: `rotate(${Math.random() * 360}deg)`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 / raySpeed}s`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
