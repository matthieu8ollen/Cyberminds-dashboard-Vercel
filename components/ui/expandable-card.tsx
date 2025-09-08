"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronUp, MoreHorizontal, Edit, Clock, TrendingUp, FileText } from "lucide-react"
import { useRouter } from "next/navigation"

interface ExpandableCardProps {
  id?: string
  title: string
  description: string
  date?: string
  tags?: string[]
  performance?: string
  icon?: React.ComponentType<{ className?: string }>
  color?: string
  isSelected?: boolean
  onSelect?: (id: string) => void
  children?: React.ReactNode
  expandedContent?: React.ReactNode
  className?: string
  type?: string
  onUseIdea?: () => void
}

export function ExpandableCard({
  id = "default",
  title,
  description,
  date = "Recently",
  tags = [],
  performance = "N/A",
  icon: IconComponent = FileText,
  color = "bg-emerald-100 text-emerald-600",
  isSelected = false,
  onSelect = () => {},
  children,
  expandedContent,
  className = "",
  type = "general",
  onUseIdea,
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()

  const handleUseIdea = () => {
    if (onUseIdea) {
      onUseIdea()
    } else {
      router.push(`/formula-matching?ideaId=${id}&title=${encodeURIComponent(title)}&type=${type}`)
    }
  }

  return (
    <Card
      className={`relative bg-muted/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Checkbox checked={isSelected} onCheckedChange={() => onSelect(id)} />
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
              <IconComponent className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg leading-tight text-emerald-800 font-sans font-medium">{title}</CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="ml-1">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="text-sm leading-relaxed text-gray-600">{description}</CardDescription>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {date}
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {performance}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-gray-200 space-y-4">
                {expandedContent || children || (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Full Content</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        This is where the expanded content would appear. You can add more detailed information,
                        additional metadata, or any other relevant content that should be hidden by default.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Performance Metrics</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="text-gray-500">Views:</span>
                          <span className="ml-1 font-medium">1,234</span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="text-gray-500">Engagement:</span>
                          <span className="ml-1 font-medium">8.5%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleUseIdea}>
            Use Idea
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
