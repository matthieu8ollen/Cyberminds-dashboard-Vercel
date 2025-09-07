"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FocusCards } from "@/components/ui/focus-cards"
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"
import { TweetCard } from "@/components/magicui/tweet-card"
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button"
import {
  Lightbulb,
  Sparkles,
  BarChart3,
  Calendar as CalendarIcon,
  TrendingUp,
  Users,
  FileText,
  Zap,
  Plus,
  ArrowRight,
  Clock,
  Star,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  Eye,
  MoreHorizontal
} from "lucide-react"
import { cn } from "@/lib/utils"

// Types based on existing Dashboard component
interface ContentIdea {
  id: string
  title: string
  description: string
  category: string
  trending: boolean
}

interface UserProfile {
  name: string
  email: string
  plan: string
  usage: {
    posts_generated: number
    monthly_limit: number
  }
}

interface InspirationPost {
  id: string
  author: {
    name: string
    handle: string
    avatar: string
    verified: boolean
  }
  content: string
  engagement: {
    likes: number
    comments: number
    shares: number
  }
  timestamp: string
  tags: string[]
}

interface ScheduledPost {
  id: string
  title: string
  scheduled_date: string
  status: 'draft' | 'scheduled' | 'published'
  type: string
}

export default function DashboardPage() {
  const router = useRouter()
  
  // State management (preserve existing functionality)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [trendingTopics, setTrendingTopics] = useState<ContentIdea[]>([])
  const [inspirationPosts, setInspirationPosts] = useState<InspirationPost[]>([])
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(true)

  // Load data on component mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Simulate API calls - replace with your actual API endpoints
      await Promise.all([
        loadUserProfile(),
        loadTrendingTopics(),
        loadInspirationPosts(),
        loadScheduledPosts()
      ])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserProfile = async () => {
    // Mock data - replace with actual API call
    setUser({
      name: "Marcus Thompson",
      email: "marcus@cyberminds.com",
      plan: "Pro",
      usage: {
        posts_generated: 23,
        monthly_limit: 100
      }
    })
  }

  const loadTrendingTopics = async () => {
    // Mock data - replace with actual API call
    setTrendingTopics([
      {
        id: "1",
        title: "AI Impact on SaaS Metrics",
        description: "How artificial intelligence is changing the way we measure SaaS success",
        category: "Technology",
        trending: true
      },
      {
        id: "2", 
        title: "Remote Team Leadership",
        description: "Strategies for leading distributed teams in 2024",
        category: "Leadership",
        trending: true
      },
      {
        id: "3",
        title: "Customer Success ROI",
        description: "Measuring the real impact of customer success initiatives", 
        category: "Business",
        trending: false
      }
    ])
  }

  const loadInspirationPosts = async () => {
    // Mock data - replace with actual API call
    setInspirationPosts([
      {
        id: "1",
        author: {
          name: "Sarah Chen",
          handle: "@sarahchen",
          avatar: "/avatars/sarah.jpg",
          verified: true
        },
        content: "Just shipped our biggest feature update yet. The key? We listened to user feedback for 6 months before writing a single line of code. Sometimes the best product decisions come from patience, not speed.",
        engagement: {
          likes: 1247,
          comments: 89,
          shares: 156
        },
        timestamp: "2h ago",
        tags: ["product", "startup", "feedback"]
      },
      {
        id: "2",
        author: {
          name: "David Kim",
          handle: "@davidkim",
          avatar: "/avatars/david.jpg", 
          verified: false
        },
        content: "Revenue hit $2M ARR today. Three lessons that got us here:\n\n1. Solve a real problem\n2. Talk to customers daily\n3. Focus on retention over acquisition\n\nThe fundamentals never go out of style.",
        engagement: {
          likes: 892,
          comments: 67,
          shares: 123
        },
        timestamp: "4h ago",
        tags: ["saas", "revenue", "growth"]
      },
      {
        id: "3",
        author: {
          name: "Emily Rodriguez",
          handle: "@emilyrodriguez",
          avatar: "/avatars/emily.jpg",
          verified: true
        },
        content: "Hiring mistake I see constantly: focusing on skills over culture fit. You can teach skills. You can't teach someone to care about your mission. Culture carriers are worth their weight in gold.",
        engagement: {
          likes: 634,
          comments: 45,
          shares: 89
        },
        timestamp: "6h ago", 
        tags: ["hiring", "culture", "team"]
      }
    ])
  }

  const loadScheduledPosts = async () => {
    // Mock data - replace with actual API call
    setScheduledPosts([
      {
        id: "1",
        title: "Weekly SaaS metrics roundup",
        scheduled_date: "2024-01-08T09:00:00Z",
        status: "scheduled",
        type: "Framework"
      },
      {
        id: "2", 
        title: "Leadership lessons from Q4",
        scheduled_date: "2024-01-09T14:00:00Z",
        status: "draft",
        type: "Story"
      }
    ])
  }

  // Navigation handlers (preserve existing functionality)
  const handleNavigateToPage = (page: string) => {
    router.push(`/${page}`)
  }

  const handleCreateContent = (type?: string) => {
    router.push(`/content/create${type ? `?type=${type}` : ''}`)
  }

  const handleInspirationAction = (action: string, postId: string) => {
    console.log(`${action} for post ${postId}`)
    // Implement your inspiration post actions
  }

  // Feature cards for main navigation hub
  const featureCards = [
    {
      id: "ideation",
      title: "Ideation Hub",
      description: "Generate ideas with Marcus AI",
      icon: Lightbulb,
      preview: `${trendingTopics.length} trending topics`,
      color: "from-blue-500 to-cyan-500",
      href: "/ideas",
      stats: {
        label: "Ideas generated",
        value: "47 this week"
      }
    },
    {
      id: "writer-suite",
      title: "Writer Suite", 
      description: "Create professional content",
      icon: Sparkles,
      preview: "Advanced AI writing tools",
      color: "from-purple-500 to-pink-500", 
      href: "/writer-suite",
      stats: {
        label: "Posts created",
        value: `${user?.usage.posts_generated || 0}/${user?.usage.monthly_limit || 100}`
      }
    },
    {
      id: "analytics",
      title: "Performance Tracking",
      description: "Track your content success",
      icon: BarChart3,
      preview: "Real-time engagement metrics",
      color: "from-green-500 to-emerald-500",
      href: "/analytics", 
      stats: {
        label: "Avg engagement",
        value: "+24% this month"
      }
    },
    {
      id: "content-strategist",
      title: "Content Strategist",
      description: "Plan your content calendar",
      icon: CalendarIcon,
      preview: `${scheduledPosts.length} posts scheduled`,
      color: "from-orange-500 to-red-500",
      href: "/calendar",
      stats: {
        label: "Success rate",
        value: "89% on-time"
      }
    }
  ]

  // Transform inspiration posts for InfiniteMovingCards
  const inspirationItems = inspirationPosts.map(post => ({
    quote: post.content,
    name: post.author.name,
    title: post.author.handle,
    avatar: post.author.avatar,
    engagement: post.engagement,
    timestamp: post.timestamp,
    tags: post.tags,
    id: post.id
  }))

  const getCurrentGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon" 
    return "Good evening"
  }

  const getUpcomingPosts = () => {
    return scheduledPosts
      .filter(post => new Date(post.scheduled_date) > new Date())
      .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
      .slice(0, 3)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header Section */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Writer Suite Dashboard
              </h1>
              <p className="text-muted-foreground">
                {getCurrentGreeting()}, {user?.name || 'there'}! Ready to create amazing content?
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                {user?.plan} Plan
              </Badge>
              <InteractiveHoverButton
                text="Create Content"
                className="bg-primary hover:bg-primary/90"
                onClick={() => handleCreateContent()}
              />
            </div>
          </div>
          
          {/* Usage Progress */}
          {user && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Monthly Usage</span>
                <span className="text-sm text-muted-foreground">
                  {user.usage.posts_generated}/{user.usage.monthly_limit} posts
                </span>
              </div>
              <Progress 
                value={(user.usage.posts_generated / user.usage.monthly_limit) * 100} 
                className="h-2"
              />
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Inspiration Feed */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Creator Inspiration Feed</h2>
              <p className="text-muted-foreground">
                Latest posts from thought leaders you follow
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Creators
            </Button>
          </div>
          
          <div className="relative">
            <InfiniteMovingCards
              items={inspirationItems}
              direction="right"
              speed="slow"
              pauseOnHover={true}
              className="py-4"
            />
          </div>
        </section>

        <Separator />

        {/* Main Navigation Hub */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">What would you like to do today?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose from our powerful suite of content creation and analysis tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {navigationFeatures.map((feature) => {
              const IconComponent = feature.icon
              return (
                <Card 
                  key={feature.id} 
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 overflow-hidden"
                  onClick={() => handleNavigateToPage(feature.href.slice(1))}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center",
                        feature.bgColor
                      )}>
                        <IconComponent className={cn("w-6 h-6", feature.color)} />
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {feature.description}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{feature.preview}</span>
                      <Badge variant="secondary" className="text-xs">
                        {feature.stats}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        <Separator />

        {/* Bottom Section: Schedule Overview & Quick Stats */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schedule Overview */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold">Upcoming Schedule</h3>
            
            {getUpcomingPosts().length > 0 ? (
              <div className="space-y-3">
                {getUpcomingPosts().map((post) => (
                  <Card key={post.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{post.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(post.scheduled_date).toLocaleDateString()}</span>
                          <Badge variant="outline" size="sm">{post.type}</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium mb-2">No upcoming posts</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Schedule your first post to see it here
                </p>
                <Button onClick={() => handleNavigateToPage('calendar')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Post
                </Button>
              </Card>
            )}
          </div>

          {/* Quick Stats & Calendar */}
          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="font-medium mb-3">Quick Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Week</span>
                  <span className="font-medium">12 posts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Engagement</span>
                  <span className="font-medium text-green-600">+24%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ideas Generated</span>
                  <span className="font-medium">47</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium mb-3">Calendar</h4>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border-0"
              />
            </Card>
          </div>
        </section>

        {/* Recent Activity Alert */}
        {trendingTopics.length > 0 && (
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/50">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>{trendingTopics.length} trending topics</strong> are perfect for your next post. 
              <Button variant="link" className="p-0 h-auto ml-1 text-blue-600" onClick={() => handleNavigateToPage('ideas')}>
                Explore topics →
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
