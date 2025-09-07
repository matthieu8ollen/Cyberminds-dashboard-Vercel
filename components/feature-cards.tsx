"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InteractiveHoverButton } from "@/components/interactive-hover-button"
import Image from "next/image"
import { useRouter } from "next/navigation"

const features = [
  {
    icon: "lightbulb-3d",
    title: "Generate Ideas",
    description: "AI-powered content ideation",
    preview: "5 trending topics ready",
    href: "/ideas-hub",
    color: "text-chart-1",
  },
  {
    icon: "fountain-pen-3d",
    title: "Create Professional Content",
    description: "Guided content creation suite",
    preview: "3 drafts in progress",
    href: "/create",
    color: "text-chart-2",
  },
  {
    icon: "analytics-3d",
    title: "Track Your Success",
    description: "Comprehensive analytics dashboard",
    preview: "+23% engagement this week",
    href: "/analytics",
    color: "text-chart-3",
  },
  {
    icon: "calendar-3d",
    title: "Plan Your Content",
    description: "Strategic content planning",
    preview: "12 posts scheduled",
    href: "/calendar",
    color: "text-chart-4",
  },
]

export function FeatureCards() {
  const router = useRouter()

  const handleCardClick = (href: string) => {
    router.push(href)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="group bg-muted/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 cursor-pointer"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 border border-emerald-200 overflow-hidden">
                  {typeof feature.icon === "string" ? (
                    <Image
                      src={`/${feature.icon}-icon.png`}
                      alt={feature.title}
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    <feature.icon className="h-6 w-6 text-emerald-700" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg leading-tight text-emerald-800 font-sans font-medium">
                    {feature.title}
                  </CardTitle>
                  <p className="text-sm leading-relaxed text-gray-600">{feature.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-600">{feature.preview}</span>
                <InteractiveHoverButton
                  text="Open →"
                  className="w-20 h-8 text-xs bg-muted text-muted-foreground rounded-full"
                  onClick={() => handleCardClick(feature.href)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
