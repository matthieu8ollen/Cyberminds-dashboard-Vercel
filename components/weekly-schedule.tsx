"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Plus } from "lucide-react"

const scheduledPosts = [
  {
    id: 1,
    title: "5 LinkedIn Growth Strategies",
    scheduledFor: "Today, 2:00 PM",
    status: "ready",
  },
  {
    id: 2,
    title: "Content Creation Workflow",
    scheduledFor: "Tomorrow, 9:00 AM",
    status: "draft",
  },
  {
    id: 3,
    title: "AI Tools for Marketers",
    scheduledFor: "Friday, 11:00 AM",
    status: "ready",
  },
]

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function WeeklySchedule() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">This Week</h2>
        <Button size="sm" variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          View Full Calendar
        </Button>
      </div>

      {/* Mini Calendar View */}
      <Card className="bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-card-foreground">Quick Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">{day}</div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    index === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 15}
                </div>
                {(index === 0 || index === 2 || index === 4) && (
                  <div className="w-2 h-2 bg-accent rounded-full mx-auto mt-1"></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Posts */}
      <Card className="bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-card-foreground">Next 3 Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {scheduledPosts.map((post) => (
            <div key={post.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-card-foreground text-sm">{post.title}</h4>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  {post.scheduledFor}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    post.status === "ready" ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {post.status}
                </span>
                <Button size="sm" variant="ghost">
                  Edit
                </Button>
              </div>
            </div>
          ))}

          <Button variant="outline" className="w-full mt-3 bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Schedule New Post
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
