"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share, Bookmark, Eye, EyeOff } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const mockPosts = [
  {
    id: 1,
    author: "Sarah Chen",
    avatar: "/professional-woman-diverse.png",
    content:
      "Just launched our new AI-powered content strategy tool! The results have been incredible - 300% increase in engagement...",
    likes: 245,
    comments: 32,
    shares: 18,
    timestamp: "2h ago",
  },
  {
    id: 2,
    author: "Marcus Johnson",
    avatar: "/professional-man.png",
    content:
      "Here's what I learned from analyzing 10,000+ LinkedIn posts: The best performing content follows these 5 patterns...",
    likes: 892,
    comments: 156,
    shares: 89,
    timestamp: "4h ago",
  },
  {
    id: 3,
    author: "Emily Rodriguez",
    avatar: "/professional-woman-smiling.png",
    content:
      "Stop writing generic LinkedIn posts. Here's my framework for creating content that actually converts prospects...",
    likes: 567,
    comments: 78,
    shares: 45,
    timestamp: "6h ago",
  },
]

export function InspirationFeed() {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [start, setStart] = useState(false)

  useEffect(() => {
    addAnimation()
  }, [])

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children)

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true)
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem)
        }
      })

      getDirection()
      getSpeed()
      setStart(true)
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      containerRef.current.style.setProperty("--animation-direction", "forwards")
    }
  }

  const getSpeed = () => {
    if (containerRef.current) {
      containerRef.current.style.setProperty("--animation-duration", "40s")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Inspiration Feed</h2>
        <Button variant="outline" size="sm">
          Manage Creators
        </Button>
      </div>

      <div
        ref={containerRef}
        className={cn(
          "scroller relative z-20 max-w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        )}
      >
        <div
          ref={scrollerRef}
          className={cn(
            "flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap",
            start && "animate-scroll",
            "hover:[animation-play-state:paused]",
          )}
        >
          {mockPosts.map((post) => (
            <Card
              key={post.id}
              className="w-[400px] max-w-full relative rounded-2xl border border-border flex-shrink-0 bg-card px-8 py-6"
            >
              <CardContent className="p-0">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.author} />
                    <AvatarFallback>
                      {post.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-card-foreground">{post.author}</h3>
                    <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                  </div>
                </div>

                <p className="text-card-foreground mb-4 line-clamp-3">{post.content}</p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {post.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share className="h-4 w-4" />
                    {post.shares}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <Bookmark className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <Eye className="h-4 w-4 mr-1" />
                    View Full
                  </Button>
                  <Button size="sm" variant="outline">
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
