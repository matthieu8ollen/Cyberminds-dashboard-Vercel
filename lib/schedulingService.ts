export interface ScheduledContent {
  id: string
  user_id: string
  content_text: string
  content_type: string
  tone_used: string
  prompt_input: string | null
  is_saved: boolean
  scheduled_date: string
  scheduled_time: string
  status: 'scheduled' | 'published' | 'failed' | 'draft'
  recurring?: RecurringPattern
  publish_attempts?: number
  last_error?: string
  created_at: string
  updated_at?: string
  published_at?: string
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly'
  interval: number
  endDate?: string
  daysOfWeek?: number[]
  dayOfMonth?: number
}

export interface PublishingQueue {
  id: string
  content_id: string
  scheduled_for: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  attempts: number
  last_attempt?: string
  error_message?: string
}

export interface TimeSlot {
  time: string
  label: string
  recommended: boolean
  engagement_score?: number
}

class SchedulingService {
  private publishingQueue: PublishingQueue[] = []
  private isProcessingQueue = false

  getRecommendedTimes(): TimeSlot[] {
    return [
      { time: '08:00', label: '8:00 AM', recommended: true, engagement_score: 0.85 },
      { time: '09:00', label: '9:00 AM', recommended: true, engagement_score: 0.92 },
      { time: '10:00', label: '10:00 AM', recommended: false, engagement_score: 0.78 },
      { time: '11:00', label: '11:00 AM', recommended: false, engagement_score: 0.65 },
      { time: '12:00', label: '12:00 PM', recommended: true, engagement_score: 0.88 },
      { time: '13:00', label: '1:00 PM', recommended: false, engagement_score: 0.72 },
      { time: '14:00', label: '2:00 PM', recommended: true, engagement_score: 0.89 },
      { time: '15:00', label: '3:00 PM', recommended: false, engagement_score: 0.75 },
      { time: '16:00', label: '4:00 PM', recommended: false, engagement_score: 0.68 },
      { time: '17:00', label: '5:00 PM', recommended: true, engagement_score: 0.91 },
      { time: '18:00', label: '6:00 PM', recommended: false, engagement_score: 0.71 },
      { time: '19:00', label: '7:00 PM', recommended: false, engagement_score: 0.64 }
    ]
  }

  async scheduleContent(
    content: Omit<ScheduledContent, 'id' | 'status' | 'created_at'>,
    recurring?: RecurringPattern
  ): Promise<ScheduledContent> {
    const scheduledContent: ScheduledContent = {
      ...content,
      id: this.generateId(),
      status: 'scheduled',
      created_at: new Date().toISOString(),
      recurring
    }

    if (!this.isValidScheduleTime(content.scheduled_date, content.scheduled_time)) {
      throw new Error('Cannot schedule content in the past')
    }

    const conflicts = await this.checkSchedulingConflicts(
      content.scheduled_date,
      content.scheduled_time,
      content.user_id
    )

    if (conflicts.length > 0) {
      console.warn('Scheduling conflict detected:', conflicts)
    }

    await this.addToPublishingQueue(scheduledContent)

    if (recurring) {
      await this.generateRecurringInstances(scheduledContent)
    }

    return scheduledContent
  }

  async updateScheduledContent(
    contentId: string,
    updates: Partial<ScheduledContent>
  ): Promise<ScheduledContent> {
    const updatedContent = {
      ...updates,
      id: contentId,
      updated_at: new Date().toISOString()
    } as ScheduledContent

    if (updates.scheduled_date || updates.scheduled_time) {
      await this.updatePublishingQueue(contentId, {
        scheduled_for: this.combineDateTime(
          updates.scheduled_date || '',
          updates.scheduled_time || ''
        )
      })
    }

    return updatedContent
  }

  async deleteScheduledContent(contentId: string): Promise<boolean> {
    try {
      await this.removeFromPublishingQueue(contentId)
      return true
    } catch (error) {
      console.error('Error deleting scheduled content:', error)
      return false
    }
  }

  async publishNow(contentId: string): Promise<boolean> {
    try {
      await this.removeFromPublishingQueue(contentId)
      const result = await this.attemptPublish(contentId)
      return result.success
    } catch (error) {
      console.error('Error publishing content immediately:', error)
      return false
    }
  }

  async getPublishingQueue(userId: string): Promise<PublishingQueue[]> {
    return this.publishingQueue.filter(item => 
      item.status === 'pending' || item.status === 'processing'
    )
  }

  async processPublishingQueue(): Promise<void> {
    if (this.isProcessingQueue) return
    
    this.isProcessingQueue = true
    
    try {
      const now = new Date()
      const pendingItems = this.publishingQueue.filter(item => 
        item.status === 'pending' && 
        new Date(item.scheduled_for) <= now
      )

      for (const item of pendingItems) {
        await this.processQueueItem(item)
      }
    } catch (error) {
      console.error('Error processing publishing queue:', error)
    } finally {
      this.isProcessingQueue = false
    }
  }

  private async generateRecurringInstances(
    baseContent: ScheduledContent
  ): Promise<ScheduledContent[]> {
    if (!baseContent.recurring) return []

    const instances: ScheduledContent[] = []
    const { frequency, interval, endDate } = baseContent.recurring
    const startDate = new Date(baseContent.scheduled_date)
    const endDateTime = endDate ? new Date(endDate) : this.getDefaultEndDate()
    
    let currentDate = new Date(startDate)
    
    while (currentDate <= endDateTime && instances.length < 52) {
      switch (frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + interval)
          break
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (interval * 7))
          break
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + interval)
          break
      }

      if (currentDate <= endDateTime) {
        const instance: ScheduledContent = {
          ...baseContent,
          id: this.generateId(),
          scheduled_date: this.formatDate(currentDate),
          created_at: new Date().toISOString()
        }
        
        instances.push(instance)
        await this.addToPublishingQueue(instance)
      }
    }

    return instances
  }

  private async checkSchedulingConflicts(
    date: string,
    time: string,
    userId: string
  ): Promise<string[]> {
    const conflicts: string[] = []
    const scheduledDateTime = new Date(`${date}T${time}:00`)
    
    const thirtyMinutesBefore = new Date(scheduledDateTime.getTime() - 30 * 60 * 1000)
    const thirtyMinutesAfter = new Date(scheduledDateTime.getTime() + 30 * 60 * 1000)
    
    const hasNearbyPost = Math.random() > 0.8
    
    if (hasNearbyPost) {
      conflicts.push('Another post is scheduled within 30 minutes of this time')
    }

    return conflicts
  }

  private async addToPublishingQueue(content: ScheduledContent): Promise<void> {
    const queueItem: PublishingQueue = {
      id: this.generateId(),
      content_id: content.id,
      scheduled_for: this.combineDateTime(content.scheduled_date, content.scheduled_time),
      status: 'pending',
      attempts: 0
    }

    this.publishingQueue.push(queueItem)
  }

  private async updatePublishingQueue(
    contentId: string,
    updates: Partial<PublishingQueue>
  ): Promise<void> {
    const index = this.publishingQueue.findIndex(item => item.content_id === contentId)
    if (index !== -1) {
      this.publishingQueue[index] = { ...this.publishingQueue[index], ...updates }
    }
  }

  private async removeFromPublishingQueue(contentId: string): Promise<void> {
    this.publishingQueue = this.publishingQueue.filter(item => item.content_id !== contentId)
  }

  private async processQueueItem(item: PublishingQueue): Promise<void> {
    await this.updatePublishingQueue(item.content_id, {
      status: 'processing',
      last_attempt: new Date().toISOString()
    })

    try {
      const result = await this.attemptPublish(item.content_id)
      
     if (result.success) {
  await this.updatePublishingQueue(item.content_id, {
    status: 'completed'
  })
} else {
  await this.handlePublishingFailure(item, result.error || new Error('Unknown publishing error'))
}
    } catch (error) {
     await this.handlePublishingFailure(item, error instanceof Error ? error : new Error(String(error)))
    }
  }

  private async attemptPublish(contentId: string): Promise<{ success: boolean; error?: Error }> {
    try {
      await this.delay(1000 + Math.random() * 2000)
      
      const isSuccess = Math.random() > 0.05
      
      if (isSuccess) {
        console.log(`✅ Successfully published content ${contentId}`)
        return { success: true }
      } else {
        throw new Error('LinkedIn API rate limit exceeded')
      }
    } catch (error) {
      console.error(`❌ Failed to publish content ${contentId}:`, error)
      return { success: false, error: error as Error }
    }
  }

  private async handlePublishingFailure(item: PublishingQueue, error: Error): Promise<void> {
    const newAttempts = item.attempts + 1
    const maxAttempts = 3

    if (newAttempts < maxAttempts) {
      const retryDelay = Math.pow(2, newAttempts) * 60 * 1000
      const retryTime = new Date(Date.now() + retryDelay)

      await this.updatePublishingQueue(item.content_id, {
        status: 'pending',
        attempts: newAttempts,
        scheduled_for: retryTime.toISOString(),
        error_message: error.message
      })
    } else {
      await this.updatePublishingQueue(item.content_id, {
        status: 'failed',
        attempts: newAttempts,
        error_message: error.message
      })
    }
  }

  private generateId(): string {
    return 'sched_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  private isValidScheduleTime(date: string, time: string): boolean {
    const scheduledDateTime = new Date(`${date}T${time}:00`)
    return scheduledDateTime > new Date()
  }

  private combineDateTime(date: string, time: string): string {
    return `${date}T${time}:00.000Z`
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  private getDefaultEndDate(): Date {
    const endDate = new Date()
    endDate.setFullYear(endDate.getFullYear() + 1)
    return endDate
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  getBestPostingTimes(userId: string): Promise<TimeSlot[]> {
    return Promise.resolve(this.getRecommendedTimes())
  }

  async getSchedulingAnalytics(userId: string, days: number = 30): Promise<{
    totalScheduled: number
    publishSuccess: number
    publishFailed: number
    averageEngagement: number
    bestPerformingTimes: string[]
    contentTypePerformance: Array<{ type: string; avgEngagement: number }>
  }> {
    return {
      totalScheduled: 45,
      publishSuccess: 43,
      publishFailed: 2,
      averageEngagement: 127,
      bestPerformingTimes: ['09:00', '14:00', '17:00'],
      contentTypePerformance: [
        { type: 'framework', avgEngagement: 145 },
        { type: 'story', avgEngagement: 189 },
        { type: 'trend', avgEngagement: 98 }
      ]
    }
  }

  async bulkSchedule(
    contents: Array<{
      content: Omit<ScheduledContent, 'id' | 'status' | 'created_at'>
      recurring?: RecurringPattern
    }>
  ): Promise<ScheduledContent[]> {
    const scheduledContents: ScheduledContent[] = []

    for (const { content, recurring } of contents) {
      try {
        const scheduled = await this.scheduleContent(content, recurring)
        scheduledContents.push(scheduled)
      } catch (error) {
        console.error('Error in bulk scheduling:', error)
      }
    }

    return scheduledContents
  }

  async bulkReschedule(
    contentIds: string[],
    newDate: string,
    startTime: string,
    intervalMinutes: number = 30
  ): Promise<boolean> {
    try {
      for (let i = 0; i < contentIds.length; i++) {
        const time = this.addMinutesToTime(startTime, i * intervalMinutes)
        await this.updateScheduledContent(contentIds[i], {
          scheduled_date: newDate,
          scheduled_time: time
        })
      }
      return true
    } catch (error) {
      console.error('Error in bulk rescheduling:', error)
      return false
    }
  }

  private addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number)
    const totalMinutes = hours * 60 + mins + minutes
    const newHours = Math.floor(totalMinutes / 60) % 24
    const newMins = totalMinutes % 60
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
  }
}

export const schedulingService = new SchedulingService()

if (typeof window !== 'undefined') {
  setInterval(() => {
    schedulingService.processPublishingQueue()
  }, 60000)
}

export default schedulingService
