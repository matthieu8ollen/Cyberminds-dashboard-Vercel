"use client"

import { useState, useEffect } from "react"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Home,
  Lightbulb,
  Sparkles,
  BarChart3,
  Calendar,
  ArrowRight,
  TrendingUp,
  FileText,
  Users,
  Clock,
  Plus,
  ExternalLink,
  Heart,
  MessageCircle,
  Repeat2,
  X
} from "lucide-react"

// Sample data - replace with real data later
const inspirationPosts = [
  {
    id: 1,
    author: "Sarah Chen",
    avatar: "SC",
    content: "Just shipped our biggest feature update yet. Here's what we learned about product launches...",
    likes: 234,
    comments: 45,
    shares: 12,
    timeAgo: "2h",
    platform: "LinkedIn"
  },
  {
    id: 2,
    author: "Marcus Johnson",
    avatar: "MJ",
    content: "3 mistakes I made as a first-time CFO that cost us $2M. Thread below...",
    likes: 892,
    comments: 156,
    shares: 78,
    timeAgo: "4h",
    platform: "LinkedIn"
  },
  {
    id: 3,
    author: "Alex Rodriguez",
    avatar: "AR",
    content: "The SaaS metrics that actually matter (and the ones that don't)...",
    likes: 567,
    comments: 89,
    shares: 34,
    timeAgo: "6h",
    platform: "LinkedIn"
  }
]

const upcomingContent = [
  {
    id: 1,
    title: "Q4 Financial Planning Framework",
    scheduledFor: "Tomorrow, 9:00 AM",
    status: "scheduled",
    type: "Framework"
  },
  {
    id: 2,
    title: "My Biggest Startup Mistake",
    scheduledFor: "Friday, 2:00 PM",
    status: "draft",
    type: "Story"
  },
  {
    id: 3,
    title: "SaaS Metrics Deep Dive",
    scheduledFor: "Next Monday, 10:00 AM",
    status: "scheduled",
    type: "Data"
  }
]

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState("")
  const [dismissedBanner, setDismissedBanner] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
      setCurrentTime(timeString)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarNavigation />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Banner */}
        {!dismissedBanner && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">New: AI-powered content suggestions now available in Writer Suite</span>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                Learn More
                <ExternalLink className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setDismissedBanner(true)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Dashboard
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-4">
            <h1 className="text-3xl font-medium tracking-tight text-balance font-sans text-emerald-600">
              Writer Suite Dashboard
            </h1>
            <p className="text-muted-foreground text-pretty">
              {getGreeting()}! Ready to create amazing content today? • {currentTime}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Inspiration Feed */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-emerald-600">Inspiration Feed</h2>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Creators
                </Button>
              </div>
              
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {inspirationPosts.map((post) => (
                  <Card key={post.id} className="flex-shrink-0 w-80">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-emerald-700">{post.avatar}</span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{post.author}</div>
                          <div className="text-xs text-muted-foreground">{post.timeAgo} • {post.platform}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-foreground line-clamp-3">{post.content}</p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Heart className="w-3 h-3 mr-1" />
                            {post.likes}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            {post.comments}
                          </span>
                          <span className="flex items-center">
                            <Repeat2 className="w-3 h-3 mr-1" />
                            {post.shares}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          Save
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Create Similar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - Feature Cards */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-semibold text-emerald-600">Quick Actions</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Ideation Hub Card */}
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Lightbulb className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Generate Ideas</CardTitle>
                          <CardDescription>Talk with Marcus for personalized content ideas</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div>• Recent trending: AI hiring challenges</div>
                        <div>• 3 new topics available</div>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        Start Ideation
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Writer Suite Card */}
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Sparkles className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Writer Suite</CardTitle>
                          <CardDescription>Professional content creation with AI</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div>• 2 drafts in progress</div>
                        <div>• Framework templates available</div>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        Continue Writing
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Analytics Card */}
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <BarChart3 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Track Performance</CardTitle>
                          <CardDescription>View your content analytics</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div>• Last post: 892 likes</div>
                        <div>• Weekly growth: +15%</div>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        View Analytics
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Content Planning Card */}
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Plan Content</CardTitle>
                          <CardDescription>Schedule and organize your posts</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div>• 3 posts scheduled this week</div>
                        <div>• Next post: Tomorrow 9 AM</div>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        View Calendar
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                
                {/* Usage Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>This Month</CardTitle>
                    <CardDescription>Your content creation progress</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Posts created</span>
                        <span className="text-foreground">23 / 50</span>
                      </div>
                      <Progress value={46} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Ideas generated</span>
                        <span className="text-foreground">67</span>
                      </div>
                      <Progress value={89} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Engagement rate</span>
                        <span className="text-foreground">4.2%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">+0.8% from last month</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Content */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Content</CardTitle>
                    <CardDescription>Your scheduled posts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {upcomingContent.map((content) => (
                      <div key={content.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-foreground">{content.title}</div>
                          <div className="text-xs text-muted-foreground">{content.scheduledFor}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge 
                              variant={content.status === 'scheduled' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {content.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {content.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button className="w-full" variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule New Post
                    </Button>
                  </CardContent>
                </Card>

                {/* What's New */}
                <Card>
                  <CardHeader>
                    <CardTitle>What's New</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <div className="font-medium text-foreground mb-1">AI Content Suggestions</div>
                      <div className="text-muted-foreground text-xs">New feature helps you improve your content with AI-powered suggestions.</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-foreground mb-1">Enhanced Analytics</div>
                      <div className="text-muted-foreground text-xs">Track engagement metrics and content performance over time.</div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      View All Updates
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
