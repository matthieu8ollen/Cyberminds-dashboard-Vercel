"use client"

import { SidebarNavigation } from "@/components/sidebar-navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GridBeams } from "@/components/magicui/grid-beams"
import { ExpandableCard } from "@/components/ui/expandable-card"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, MessageSquare, Lightbulb, BookOpen, Home, Recycle, Copy, Trash2 } from "lucide-react"
import React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function IdeasLibraryPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedFilter, setSelectedFilter] = React.useState("all")
  const [selectedItems, setSelectedItems] = React.useState<string[]>([])

  const handleTabChange = (value: string) => {
    if (value === "ideas-hub") {
      router.push("/ideas-hub")
    }
  }

  // Sample data for saved ideas
  const savedIdeas = [
    {
      id: "1",
      type: "conversation",
      title: "AI Content Strategy Discussion",
      description: "Conversation with Marcus about implementing AI in content workflows",
      date: "2024-01-15",
      tags: ["AI", "Strategy", "Content"],
      performance: "High",
      icon: MessageSquare,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "2",
      type: "topic",
      title: "Remote Leadership Best Practices",
      description: "AI-generated topic about managing distributed teams effectively",
      date: "2024-01-14",
      tags: ["Leadership", "Remote Work"],
      performance: "Medium",
      icon: Lightbulb,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      id: "4",
      type: "repurposed",
      title: "Blog to LinkedIn Series",
      description: "Repurposed content from 'The Future of SaaS' blog post",
      date: "2024-01-12",
      tags: ["SaaS", "Repurposed"],
      performance: "Medium",
      icon: Recycle,
      color: "bg-green-100 text-green-600",
    },
  ]

  const filteredIdeas = savedIdeas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === "all" || idea.type === selectedFilter
    return matchesSearch && matchesFilter
  })

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

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
                      <BreadcrumbLink asChild>
                        <Link href="/ideas-hub" className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Ideas Hub
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Ideas Library
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>

                <Tabs value="ideas-library" onValueChange={handleTabChange}>
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-medium tracking-tight text-balance font-sans text-emerald-800">
                      Ideas Library
                    </h1>
                    <p className="text-gray-600 text-pretty max-w-3xl">
                      Browse, organize, and reuse your saved content ideas from conversations, topics, formulas, and
                      repurposed content.
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search your saved ideas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filter and Sort Section */}
                <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter by:</span>
                  </div>

                  <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="conversation">Marcus Conversations</SelectItem>
                      <SelectItem value="topic">Generated Topics</SelectItem>
                      <SelectItem value="repurposed">Repurposed Content</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select defaultValue="recent">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="alphabetical">A-Z</SelectItem>
                    </SelectContent>
                  </Select>

                  {selectedItems.length > 0 && (
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-sm text-gray-600">{selectedItems.length} selected</span>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-1" />
                        Duplicate
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>

                {/* Content Grid */}
                {filteredIdeas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredIdeas.map((idea) => {
                      const IconComponent = idea.icon
                      return (
                        <ExpandableCard
                          key={idea.id}
                          id={idea.id}
                          title={idea.title}
                          description={idea.description}
                          date={idea.date}
                          tags={idea.tags}
                          performance={idea.performance}
                          icon={idea.icon}
                          color={idea.color}
                          isSelected={selectedItems.includes(idea.id)}
                          onSelect={handleSelectItem}
                          type={idea.type}
                        >
                          {/* Custom expanded content for each idea type */}
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Details</h4>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {idea.type === "conversation" &&
                                  "Full conversation transcript and key insights from the discussion with Marcus about AI implementation strategies."}
                                {idea.type === "topic" &&
                                  "Complete topic breakdown with suggested angles, target audience insights, and content pillars for maximum engagement."}
                                {idea.type === "repurposed" &&
                                  "Original source content, transformation notes, and performance comparison between original and repurposed versions."}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Performance Metrics</h4>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-gray-50 p-2 rounded">
                                  <span className="text-gray-500">Engagement:</span>
                                  <span className="ml-1 font-medium">
                                    {idea.performance === "High" ? "12.5%" : "8.2%"}
                                  </span>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <span className="text-gray-500">Saves:</span>
                                  <span className="ml-1 font-medium">{idea.performance === "High" ? "89" : "34"}</span>
                                </div>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                              <Button
                                onClick={() =>
                                  router.push(
                                    `/formula-matching?ideaId=${idea.id}&title=${encodeURIComponent(idea.title)}&type=${idea.type}`,
                                  )
                                }
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                size="sm"
                              >
                                Use Idea
                              </Button>
                            </div>
                          </div>
                        </ExpandableCard>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery ? "Try adjusting your search terms" : "Start creating ideas to see them here"}
                    </p>
                    <Button onClick={() => router.push("/ideas-hub")} className="bg-emerald-600 hover:bg-emerald-700">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Create Your First Idea
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </GridBeams>
        </div>
      </div>
    </div>
  )
}
