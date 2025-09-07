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

  // FocusCards data for main navigation hub (as per Dashboard Page plan)
  const focusCardsData = [
    {
      title: "Ideation Hub",
      src: "/dashboard/ideation-hero.jpg", // Add these images to your public folder
      onClick: () => handleNavigateToPage('ideas')
    },
    {
      title: "Writer Suite", 
      src: "/dashboard/writer-suite-hero.jpg",
      onClick: () => handleNavigateToPage('writer-suite')
    },
    {
      title: "Performance Tracking",
      src: "/dashboard/analytics-hero.jpg",
      onClick: () => handleNavigateToPage('analytics')
    },
    {
      title: "Content Strategist",
      src: "/dashboard/calendar-hero.jpg", 
      onClick: () => handleNavigateToPage('calendar')
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
      {/* Sticky Banner (as per Dashboard Page plan) */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-3">
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/50">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              🎉 <strong>New Feature:</strong> AI content optimization is now live! 
              <Button variant="link" className="p-0 h-auto ml-1 text-blue-600">
                Learn more →
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Page Header Section (as per Dashboard Page plan) */}
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
  className="bg-primary hover:bg-primary/90 text-white"
  onClick={() => handleCreateContent()}
>
  Create Content
</InteractiveHoverButton>
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
        {/* Top Content: Inspiration Feed (as per Dashboard Page plan) */}
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

        {/* Main Navigation Hub - Four Core Feature Cards in 2x2 Grid (as per Dashboard Page plan) */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">What would you like to do today?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose from our powerful suite of content creation and analysis tools
            </p>
          </div>

          {/* Using FocusCards for the main navigation as specified */}
          <div className="max-w-5xl mx-auto">
            <FocusCards cards={focusCardsData} />
          </div>

          {/* Feature Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-6">
            <Card className="p-4 text-center">
              <div className="space-y-2">
                <Lightbulb className="w-8 h-8 mx-auto text-blue-600" />
                <h4 className="font-medium">Ideas Generated</h4>
                <p className="text-2xl font-bold text-blue-600">47</p>
                <p className="text-xs text-muted-foreground">This week</p>
              </div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-purple-600" />
                <h4 className="font-medium">Posts Created</h4>
                <p className="text-2xl font-bold text-purple-600">{user?.usage.posts_generated || 0}</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="space-y-2">
                <BarChart3 className="w-8 h-8 mx-auto text-green-600" />
                <h4 className="font-medium">Engagement</h4>
                <p className="text-2xl font-bold text-green-600">+24%</p>
                <p className="text-xs text-muted-foreground">vs last month</p>
              </div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto text-orange-600" />
                <h4 className="font-medium">Scheduled</h4>
                <p className="text-2xl font-bold text-orange-600">{scheduledPosts.length}</p>
                <p className="text-xs text-muted-foreground">Posts pending</p>
              </div>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Weekly Schedule Overview (as per Dashboard Page plan) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schedule Overview */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold">Weekly Schedule Overview</h3>
            
            {getUpcomingPosts().length > 0 ? (
              <div className="space-y-3">
                {getUpcomingPosts().map((post) => (
                  <Card key={post.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{post.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(post.scheduled_date).toLocaleDateString()}</span>
                          <Badge variant="outline">{post.type}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <InteractiveHoverButton
                          text="Edit"
                          className="w-16 h-8 text-xs"
                          onClick={() => handleNavigateToPage(`edit/${post.id}`)}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                <Card className="p-4 border-dashed border-2 border-muted-foreground/20 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-center space-x-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    <Plus className="w-5 h-5" />
                    <span>Add to schedule</span>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-8 text-center">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium mb-2">No upcoming posts</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Schedule your first post to see it here
                </p>
                <InteractiveHoverButton
                  onClick={() => handleNavigateToPage('calendar')}
                >
                  Schedule Post
                </InteractiveHoverButton>
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
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="font-medium text-blue-600">89%</span>
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
