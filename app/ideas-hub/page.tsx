"use client"

import { SidebarNavigation } from "@/components/sidebar-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button"
import { Badge } from "@/components/ui/badge"
import { AnimatedTooltip } from "@/components/ui/animated-tooltip"
import { AIVoice } from "@/components/ui/ai-voice"
import { PromptInput } from "@/components/ui/prompt-input"
import { FocusCards } from "@/components/ui/focus-cards"
import { GridBeams } from "@/components/magicui/grid-beams"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Home, Lightbulb, BookOpen } from "lucide-react"
import React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function IdeasHubPage() {
  const experts = [
    {
      id: 1,
      name: "Sarah",
      designation: "SaaS Growth Expert",
      image: "/professional-woman-avatar.png",
    },
    {
      id: 2,
      name: "Marcus",
      designation: "Content Strategist",
      image: "/professional-man-avatar.png",
    },
    {
      id: 3,
      name: "David",
      designation: "Leadership Coach",
      image: "/professional-coach-avatar.png",
    },
  ]

  const [showOverlay, setShowOverlay] = React.useState(false)
  const [showVoiceOverlay, setShowVoiceOverlay] = React.useState(false)
  const [promptValue, setPromptValue] = React.useState("")

  const router = useRouter()

  const handlePromptSubmit = () => {
    console.log("Prompt submitted:", promptValue)
  }

  const handleTabChange = (value: string) => {
    if (value === "ideas-library") {
      router.push("/ideas-library")
    }
  }

  const consultationCards = [
    {
      title: "Talk with Marcus",
      src: "/marcus-professional-avatar.png",
      onClick: () => router.push("/chat/marcus"),
    },
    {
      title: "LinkedIn Growth Consultation",
      src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=3000&auto=format&fit=crop",
    },
    {
      title: "Personal Branding Workshop",
      src: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=3000&auto=format&fit=crop",
    },
    {
      title: "Industry Expert Mentoring",
      src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=3000&auto=format&fit=crop",
    },
  ]

  const voiceSessionCards = [
    {
      title: "Voice Strategy Deep Dive",
      src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=3000&auto=format&fit=crop",
    },
    {
      title: "Live Content Coaching",
      src: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=3000&auto=format&fit=crop",
    },
    {
      title: "Voice-to-Text Brainstorming",
      src: "https://images.unsplash.com/photo-1551434678-e01dd7228f2d?q=80&w=3000&auto=format&fit=crop",
    },
    {
      title: "Real-time Feedback Session",
      src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=3000&auto=format&fit=crop",
    },
  ]

  return (
    <div className="flex h-screen bg-white">
      <SidebarNavigation />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex-1 overflow-y-auto">
          <GridBeams
            className="min-h-full"
            backgroundColor="rgba(255, 255, 255, 0.95)"
            gridColor="rgba(16, 185, 129, 0.1)"
            rayCount={12}
            rayOpacity={0.2}
            gridSize={50}
          >
            <div className="p-6 space-y-8">
              <div className="flex items-center justify-between">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/" className="flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          Dashboard
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Ideas Hub
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>

                <Tabs value="ideas-hub" onValueChange={handleTabChange}>
                  <TabsList className="grid grid-cols-2 w-80">
                    <TabsTrigger value="ideas-hub" className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Ideas Hub
                    </TabsTrigger>
                    <TabsTrigger value="ideas-library" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Ideas Library
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-6">
                {/* Page Header */}
                <div className="space-y-2">
                  <h1 className="text-3xl font-medium tracking-tight text-balance font-sans text-emerald-800">
                    Ideas Hub
                  </h1>
                  <p className="text-gray-600 text-pretty max-w-3xl">
                    Choose how you'd like to develop your next LinkedIn post idea. Each path is designed for different
                    content creation styles and workflows.
                  </p>
                </div>
              </div>

              {/* 5-card bento grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {/* Expert Chat Consultations - Large card spanning 2 columns */}
                <Card className="relative bg-muted/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 lg:col-span-2">
                  <CardHeader className="pb-4 overflow-visible">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-emerald-800 font-sans font-medium">
                          Expert Chat Consultations
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          Get personalized advice through text-based consultations with industry specialists
                        </CardDescription>
                      </div>
                      <div className="flex items-center">
                        <AnimatedTooltip items={experts} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <div className="flex-1 flex items-center justify-center">
                      <PromptInput
                        value={promptValue}
                        onValueChange={setPromptValue}
                        onSubmit={handlePromptSubmit}
                        placeholder="Ask an expert about your content strategy..."
                        className="w-full"
                      />
                    </div>
                    <InteractiveHoverButton text="Start Chat Consultation" onClick={() => setShowOverlay(true)} />
                  </CardContent>
                </Card>

                {/* Voice Strategy Sessions - Moved to top right */}
                <Card className="relative bg-muted/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2">
                  <CardHeader className="pb-2 overflow-visible">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-emerald-800 font-sans font-medium">
                          Voice Strategy Sessions
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          Interactive voice conversations with expert specialists
                        </CardDescription>
                      </div>
                      <div className="flex items-center">
                        <AnimatedTooltip items={experts} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-center">
                      <AIVoice />
                    </div>
                    <InteractiveHoverButton text="Start Voice Session" onClick={() => setShowVoiceOverlay(true)} />{" "}
                    {/* Added onClick handler to show voice overlay */}
                  </CardContent>
                </Card>

                {/* Content Repurposer - Now equal size in bottom row */}
                <Card className="relative overflow-hidden bg-muted/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 border border-emerald-200 overflow-hidden">
                        <img
                          src="/content-repurposer-icon-3d.png"
                          alt="Content Repurposer"
                          className="h-8 w-8 object-cover rounded-sm"
                        />
                      </div>
                      <CardTitle className="text-lg leading-tight text-emerald-800 font-sans font-medium">
                        Content Repurposer
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <CardDescription className="text-sm leading-relaxed text-gray-600">
                      Transform existing content into LinkedIn posts. Upload blogs, videos, or documents.
                    </CardDescription>
                    <div className="space-y-2 mt-4">
                      <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 block w-fit">
                        Multi-format support
                      </Badge>
                      <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 block w-fit">
                        Blog to topics
                      </Badge>
                      <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 block w-fit">
                        Youtube videos to topics
                      </Badge>
                      <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 block w-fit">
                        Newsletters to topics
                      </Badge>
                    </div>
                    <div className="flex-1"></div>
                    <div className="mt-4">
                      <InteractiveHoverButton text="Get Started" onClick={() => router.push("/content-repurposer")} />
                    </div>
                  </CardContent>
                </Card>

                {/* Formula Workshop - Now equal size in bottom row */}
                <Card className="relative overflow-hidden bg-muted/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 border border-emerald-200 overflow-hidden">
                        <img src="/workshop-icon-3d.png" alt="Workshop" className="h-8 w-8 object-cover rounded-sm" />
                      </div>
                      <CardTitle className="text-lg leading-tight text-emerald-800 font-sans font-medium">
                        Formula Workshop
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <CardDescription className="text-sm leading-relaxed text-gray-600">
                      Master proven content formulas like AIDA, Problem-Solution, and Story Arc.
                    </CardDescription>
                    <div className="space-y-2 mt-4">
                      <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 block w-fit">
                        Over 100+ Viral Templates
                      </Badge>
                      <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 block w-fit">
                        Custom builder
                      </Badge>
                      <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 block w-fit">
                        Hook Templates
                      </Badge>
                      <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 block w-fit">
                        Industry Proven
                      </Badge>
                    </div>
                    <div className="flex-1"></div>
                    <div className="mt-4">
                      <InteractiveHoverButton
                        text="Explore Formulas"
                        onClick={() => router.push("/formula-workshop")}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Trending Topics - Now equal size in bottom row */}
                <Card className="relative overflow-hidden bg-muted/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 border border-emerald-200 overflow-hidden">
                        <img
                          src="/trending-topics-icon-3d.png"
                          alt="Trending Topics"
                          className="h-8 w-8 object-cover rounded-sm"
                        />
                      </div>
                      <CardTitle className="text-lg leading-tight text-emerald-800 font-sans font-medium">
                        Trending Topics
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <CardDescription className="text-sm leading-relaxed text-gray-600">
                      Discover what's trending in your industry right now with AI-curated topics.
                    </CardDescription>
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">AI in Content Marketing</span>
                        <Badge variant="default" className="text-xs bg-emerald-600 hover:bg-emerald-700">
                          High
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Remote Leadership</span>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200"
                        >
                          Medium
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">SaaS Growth Hacks</span>
                        <Badge variant="default" className="text-xs bg-emerald-600 hover:bg-emerald-700">
                          High
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Personal Branding</span>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200"
                        >
                          Medium
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-1"></div>
                    <div className="mt-6">
                      <InteractiveHoverButton text="Explore Topics" onClick={() => router.push("/explore-topics")} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </GridBeams>
        </div>

        {showOverlay && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-medium text-emerald-800">Choose Your Expert Consultation</h2>
                  <p className="text-gray-600 mt-1">Select the type of consultation that best fits your needs</p>
                </div>
                <button
                  onClick={() => setShowOverlay(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <FocusCards cards={consultationCards} />
              </div>
            </div>
          </div>
        )}

        {showVoiceOverlay && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-medium text-emerald-800">Choose Your Voice Strategy Session</h2>
                  <p className="text-gray-600 mt-1">Select the type of voice session that best fits your needs</p>
                </div>
                <button
                  onClick={() => setShowVoiceOverlay(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <FocusCards cards={voiceSessionCards} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
