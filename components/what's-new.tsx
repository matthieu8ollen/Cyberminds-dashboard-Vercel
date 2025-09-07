"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Gift, Zap, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const newsItems = [
  {
    id: 1,
    type: "New Feature",
    title: "Content Generation in 100+ Languages",
    description: "Create content in your preferred language! Change your language preference in Settings.",
    icon: Zap,
    bgColor: "bg-blue-600",
    iconColor: "text-white",
  },
  {
    id: 2,
    type: "Update",
    title: "Chrome Extension Compliance Update",
    description:
      "We've updated our Chrome extension to use right-click options instead of buttons, ensuring full compliance with LinkedIn's Terms of Service.",
    icon: RefreshCw,
    bgColor: "bg-green-600",
    iconColor: "text-white",
  },
]

export function WhatsNew() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerPage = 2
  const totalPages = Math.ceil(newsItems.length / itemsPerPage)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages)
  }

  const currentItems = newsItems.slice(currentIndex * itemsPerPage, (currentIndex + 1) * itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">What's New</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={prevSlide} disabled={totalPages <= 1} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={nextSlide} disabled={totalPages <= 1} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentItems.map((item) => {
          const IconComponent = item.icon
          return (
            <Card key={item.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className={`${item.bgColor} rounded-lg p-3 flex-shrink-0`}>
                    <IconComponent className={`h-6 w-6 ${item.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{item.type}</div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-balance">{item.title}</h3>
                    <p className="text-sm text-gray-600 text-pretty">{item.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-1">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
