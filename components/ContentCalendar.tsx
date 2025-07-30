'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useContent } from '../contexts/ContentContext'
import { supabase } from '../lib/supabase'
import { useToast } from './ToastNotifications'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  useDroppable,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MoreHorizontal,
  Filter,
  Settings,
  Eye,
  Edit3,
  Trash2,
  Copy,
  Send,
  BarChart3,
  Target,
  Sparkles,
  RepeatIcon,
  ExternalLink,
  X,
  ChevronDown,
  List
} from 'lucide-react'

interface ScheduledContent {
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
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
    endDate?: string
  }
  publish_attempts?: number
  last_error?: string
  created_at: string
  published_at?: string
  linkedin_post_url?: string
}

type CalendarView = 'month' | 'week' | 'day'
type ContentFilter = 'all' | 'scheduled' | 'published' | 'failed' | 'draft'

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00'
]

export default function ContentCalendar() {
  const { user } = useAuth()
  const { 
    scheduledContent: realScheduledContent, 
    draftContent, 
    publishedContent,
    loadingContent,
    setSelectedContent,
    setShowScheduleModal,
    refreshContent,
    updateContent,
    scheduleContentItem,
    publishContent,
    deleteContent
  } = useContent()
  const { showToast } = useToast()

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('month')
  const [filter, setFilter] = useState<ContentFilter>('all')
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showScheduleModalLocal, setShowScheduleModalLocal] = useState(false)
  const [selectedContentItem, setSelectedContentItem] = useState<ScheduledContent | null>(null)
  const [showContentPreview, setShowContentPreview] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [availableContent, setAvailableContent] = useState<any[]>([])

  useEffect(() => {
    loadScheduledContent()
    loadAvailableContent()
  }, [user, realScheduledContent, draftContent, publishedContent])

  const loadScheduledContent = async () => {
    const calendarContent: ScheduledContent[] = []
    
    // Add draft content that has scheduled dates
    draftContent.forEach((content) => {
      if (content.scheduled_date) {
        calendarContent.push({
          ...content,
          scheduled_date: content.scheduled_date,
          scheduled_time: content.scheduled_time || '09:00',
          status: content.status || 'scheduled'
        })
      }
    })
    
    // Add some sample scheduled content for testing
    draftContent.slice(0, 3).forEach((content, index) => {
      const dates = [
        getTomorrowDate(),
        getDateString(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
        getDateString(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000))
      ]
      const times = ['09:00', '14:00', '11:00']
      
      calendarContent.push({
        ...content,
        scheduled_date: dates[index],
        scheduled_time: times[index],
        status: 'scheduled'
      })
    })
    
    // Add published content
    publishedContent.forEach((content) => {
      calendarContent.push({
        ...content,
        scheduled_date: content.published_at ? content.published_at.split('T')[0] : getYesterdayDate(),
        scheduled_time: content.published_at ? content.published_at.split('T')[1]?.substring(0, 5) || '10:00' : '10:00',
        status: 'published'
      })
    })
    
    setScheduledContent(calendarContent)
  }

  const loadAvailableContent = async () => {
    if (!user) return
    try {
      const unscheduledContent = draftContent.filter(content => 
        !scheduledContent.some(scheduled => scheduled.id === content.id)
      )
      setAvailableContent(unscheduledContent)
    } catch (error) {
      console.error('Error loading available content:', error)
    }
  }

  function getTomorrowDate(): string {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return getDateString(tomorrow)
  }

  function getYesterdayDate(): string {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return getDateString(yesterday)
  }

  function getDateString(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  function getDaysInMonth(date: Date): Date[] {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    const days: Date[] = []
    const firstDayOfWeek = firstDay.getDay()
    
    // Add previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push(prevDate)
    }
    
    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    // Add next month days to complete 6 weeks
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push(new Date(year, month + 1, day))
    }
    
    return days
  }

  function getWeekDays(date: Date): Date[] {
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      return day
    })
  }

  function getContentForDate(date: Date): ScheduledContent[] {
    const dateString = getDateString(date)
    return scheduledContent.filter(content => 
      content.scheduled_date === dateString &&
      (filter === 'all' || content.status === filter)
    ).sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time))
  }

  function getContentCountForDate(date: Date): number {
    return getContentForDate(date).length
  }

  function navigateMonth(direction: 'prev' | 'next') {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  function handleDateClick(date: Date) {
    setSelectedDate(date)
  }

  function handleContentClick(content: ScheduledContent, event: React.MouseEvent) {
    event.stopPropagation()
    setSelectedContentItem(content)
    setShowContentPreview(true)
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    
    if (!over) return
    
    const activeContent = scheduledContent.find(c => c.id === active.id)
    if (!activeContent) return
    
    const newDate = over.id.toString().replace('date-', '')
    
    if (activeContent.scheduled_date !== newDate) {
      setScheduledContent(prev => prev.map(content =>
        content.id === activeContent.id
          ? { ...content, scheduled_date: newDate }
          : content
      ))
      
      showToast('success', `Content moved to ${new Date(newDate).toLocaleDateString()}`)
      
      updateContent(activeContent.id, { 
        scheduled_date: newDate,
        scheduled_time: activeContent.scheduled_time 
      })
        .then(success => {
          if (success) {
            setTimeout(() => {
              loadScheduledContent()
              refreshContent()
            }, 500)
          } else {
            setScheduledContent(prev => prev.map(content =>
              content.id === activeContent.id
                ? { ...content, scheduled_date: activeContent.scheduled_date }
                : content
            ))
            showToast('error', 'Failed to save changes')
          }
        })
        .catch(() => {
          setScheduledContent(prev => prev.map(content =>
            content.id === activeContent.id
              ? { ...content, scheduled_date: activeContent.scheduled_date }
              : content
          ))
          showToast('error', 'Failed to save changes')
        })
    }
  }

  const handleScheduleContent = async (content: any, date: string, time: string) => {
    try {
      const success = await scheduleContentItem(content.id, date, time)
      if (success) {
        showToast('success', 'Content scheduled successfully!')
        setShowScheduleModalLocal(false)
        refreshContent()
        loadScheduledContent()
      } else {
        showToast('error', 'Failed to schedule content')
      }
    } catch (error) {
      showToast('error', 'An error occurred while scheduling')
    }
  }

  const handlePublishNow = async (content: any) => {
    try {
      const success = await publishContent(content.id)
      if (success) {
        showToast('success', 'Content published successfully!')
        refreshContent()
        loadScheduledContent()
      } else {
        showToast('error', 'Failed to publish content')
      }
    } catch (error) {
      showToast('error', 'An error occurred while publishing')
    }
  }

  const handleDeleteContent = async (contentId: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        const success = await deleteContent(contentId)
        if (success) {
          showToast('success', 'Content deleted successfully')
          refreshContent()
          loadScheduledContent()
          setShowContentPreview(false)
        } else {
          showToast('error', 'Failed to delete content')
        }
      } catch (error) {
        showToast('error', 'An error occurred while deleting')
      }
    }
  }

  const handleDuplicateContent = async (content: ScheduledContent) => {
    try {
      showToast('info', 'Content duplicated and saved as draft')
      setShowContentPreview(false)
    } catch (error) {
      showToast('error', 'Failed to duplicate content')
    }
  }

  function getStatusColor(status: ScheduledContent['status']) {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'published': return 'bg-green-100 text-green-800 border-green-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  function getStatusIcon(status: ScheduledContent['status']) {
    switch (status) {
      case 'scheduled': return <Clock className="w-3 h-3" />
      case 'published': return <CheckCircle className="w-3 h-3" />
      case 'failed': return <AlertCircle className="w-3 h-3" />
      case 'draft': return <Edit3 className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  function getContentTypeIcon(type: string) {
    switch (type) {
      case 'framework': return <BarChart3 className="w-4 h-4" />
      case 'story': return <Target className="w-4 h-4" />
      case 'trend': return <Sparkles className="w-4 h-4" />
      default: return <BarChart3 className="w-4 h-4" />
    }
  }

  function getContentDot(date: Date) {
    const content = getContentForDate(date)
    if (content.length === 0) return null
    
    const hasScheduled = content.some(c => c.status === 'scheduled')
    const hasPublished = content.some(c => c.status === 'published')
    const hasFailed = content.some(c => c.status === 'failed')
    
    let color = 'bg-gray-400'
    if (hasFailed) color = 'bg-red-500'
    else if (hasScheduled) color = 'bg-blue-500'
    else if (hasPublished) color = 'bg-green-500'
    
    return (
      <div className={`w-2 h-2 ${color} rounded-full mx-auto mt-1`} />
    )
  }

  // Draggable Content Card Component
  function DraggableContentCard({ content, isTimeline = false }: { content: ScheduledContent; isTimeline?: boolean }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: content.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }

    if (isTimeline) {
      return (
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          onClick={(e) => handleContentClick(content, e)}
          className="flex items-start space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md cursor-grab active:cursor-grabbing transition-all duration-200"
        >
          <div className="text-sm font-medium text-gray-500 w-16 flex-shrink-0">
            {content.scheduled_time}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              {getContentTypeIcon(content.content_type)}
              <span className="text-sm font-medium text-gray-900 capitalize">
                {content.content_type}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
                {getStatusIcon(content.status)}
                <span className="ml-1 capitalize">{content.status}</span>
              </span>
            </div>
            <p className="text-sm text-gray-700 line-clamp-2">
              {content.content_text}
            </p>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span className="capitalize">{content.tone_used}</span>
              <span>{content.content_text.length} chars</span>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={(e) => handleContentClick(content, e)}
        className="bg-white border border-gray-200 rounded-lg p-3 cursor-grab hover:shadow-md transition-all duration-200 active:cursor-grabbing"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-1">
            {getContentTypeIcon(content.content_type)}
            {getStatusIcon(content.status)}
          </div>
          <span className="text-xs text-gray-500">{content.scheduled_time}</span>
        </div>
        <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
          {content.content_text.split('\n')[0].substring(0, 60)}...
        </p>
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span className="capitalize">{content.content_type}</span>
          <span className="capitalize">{content.tone_used}</span>
        </div>
      </div>
    )
  }

  // Droppable Date Component
  function DroppableDate({ date, children }: { date: Date; children: React.ReactNode }) {
    const { isOver, setNodeRef } = useDroppable({
      id: `date-${getDateString(date)}`,
    })

    return (
      <div
        ref={setNodeRef}
        className={`relative ${isOver ? 'bg-teal-100' : ''} transition-colors`}
      >
        {children}
      </div>
    )
  }

  // Left Panel - Compact Calendar
  function LeftPanel() {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Calendar</h1>
          <p className="text-sm text-gray-600">Schedule and manage your content</p>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {scheduledContent.filter(c => c.status === 'scheduled').length}
              </div>
              <div className="text-xs text-gray-600">Scheduled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {scheduledContent.filter(c => c.status === 'published').length}
              </div>
              <div className="text-xs text-gray-600">Published</div>
            </div>
          </div>
        </div>

        {/* Mini Calendar */}
        <div className="flex-1 p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-semibold text-gray-900">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button
                onClick={() => navigateMonth('next')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                const isToday = date.toDateString() === new Date().toDateString()
                const isSelected = date.toDateString() === selectedDate.toDateString()
                const hasContent = getContentCountForDate(date) > 0
                
                return (
                  <DroppableDate key={index} date={date}>
                    <button
                      onClick={() => handleDateClick(date)}
                      className={`
                        w-8 h-8 text-xs rounded transition-colors relative
                        ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                        ${isToday ? 'bg-teal-100 text-teal-900 font-bold' : ''}
                        ${isSelected ? 'bg-slate-200 text-slate-900' : ''}
                        ${!isSelected && !isToday ? 'hover:bg-gray-100' : ''}
                      `}
                    >
                      {date.getDate()}
                      {hasContent && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                          {getContentDot(date)}
                        </div>
                      )}
                    </button>
                  </DroppableDate>
                )
              })}
            </div>
          </div>

          {/* View Controls */}
          <div className="space-y-3">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Today
            </button>
            
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              {(['month', 'week', 'day'] as CalendarView[]).map(viewType => (
                <button
                  key={viewType}
                  onClick={() => setView(viewType)}
                  className={`flex-1 px-3 py-2 text-xs font-medium capitalize ${
                    view === viewType
                      ? 'bg-slate-700 text-white'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  } transition-colors`}
                >
                  {viewType}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowScheduleModalLocal(true)
              }}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Schedule Content</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Right Panel - Content Details
  function RightPanel() {
    const renderContent = () => {
      if (view === 'day') {
        const dayContent = getContentForDate(selectedDate)
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
              <span className="text-sm text-gray-600">
                {dayContent.length} {dayContent.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            
            {dayContent.length > 0 ? (
              <div className="space-y-3">
                {dayContent.map(content => (
                  <DraggableContentCard key={content.id} content={content} isTimeline />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content scheduled</h3>
                <p className="text-gray-600 mb-4">This date doesn't have any content scheduled yet.</p>
                <button 
                  onClick={() => setShowScheduleModalLocal(true)}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
                >
                  Schedule Content
                </button>
              </div>
            )}
          </div>
        )
      }

      if (view === 'week') {
        const weekDays = getWeekDays(selectedDate)
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Week of {weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </h2>
            </div>
            
            <div className="space-y-6">
              {weekDays.map(day => {
                const dayContent = getContentForDate(day)
                const isToday = day.toDateString() === new Date().toDateString()
                
                return (
                  <div key={day.toISOString()} className={`border-l-4 pl-4 ${isToday ? 'border-teal-500' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`font-medium ${isToday ? 'text-teal-900' : 'text-gray-900'}`}>
                        {FULL_DAYS[day.getDay()]} {day.getDate()}
                      </h3>
                      <span className="text-sm text-gray-600">
                        {dayContent.length} {dayContent.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    
                    {dayContent.length > 0 ? (
                      <div className="space-y-2">
                        {dayContent.map(content => (
                          <DraggableContentCard key={content.id} content={content} isTimeline />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No content scheduled</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      }

      // Month view - show selected date content
      return renderContent()
    }

    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">{view} View</h2>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as ContentFilter)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">All Content</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                  <option value="failed">Failed</option>
                  <option value="draft">Drafts</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    )
  }

  // Schedule Modal Component
  function ScheduleModal() {
    if (!showScheduleModalLocal) return null
    
    const [selectedTime, setSelectedTime] = useState('09:00')
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Schedule Content for {selectedDate.toLocaleDateString()}
              </h3>
              <button 
                onClick={() => setShowScheduleModalLocal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Available Content</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableContent.map(content => (
                  <div 
                    key={content.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {content.content_text.substring(0, 80)}...
                      </p>
                      <p className="text-xs text-gray-600 capitalize">
                        {content.content_type} • {content.tone_used}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleScheduleContent(content, getDateString(selectedDate), selectedTime)}
                      className="ml-3 px-3 py-1 bg-slate-700 text-white text-xs rounded hover:bg-slate-800 transition-colors"
                    >
                      Schedule
                    </button>
                  </div>
                ))}
                {availableContent.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No available content to schedule. Create some content first!
                  </p>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Time
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {TIME_SLOTS.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowScheduleModalLocal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Content Preview Modal Component
  function ContentPreviewModal() {
    if (!showContentPreview || !selectedContentItem) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Content Preview</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedContentItem.status)}`}>
                    {getStatusIcon(selectedContentItem.status)}
                    <span className="ml-1 capitalize">{selectedContentItem.status}</span>
                  </span>
                  <span className="text-sm text-gray-500">
                    {selectedContentItem.scheduled_date} at {selectedContentItem.scheduled_time}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowContentPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-96">
            <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">
              {selectedContentItem.content_text}
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between">
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleDuplicateContent(selectedContentItem)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Duplicate</span>
                </button>
              </div>
              
              <div className="flex space-x-3">
                {selectedContentItem.status === 'scheduled' && (
                  <button 
                    onClick={() => {
                      setShowContentPreview(false)
                      handlePublishNow(selectedContentItem)
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Publish Now</span>
                  </button>
                )}
                
                {selectedContentItem.status === 'failed' && (
                  <button 
                    onClick={() => {
                      setShowContentPreview(false)
                      handlePublishNow(selectedContentItem)
                    }}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 flex items-center space-x-2 transition-colors"
                  >
                    <RepeatIcon className="w-4 h-4" />
                    <span>Retry</span>
                  </button>
                )}

                {selectedContentItem.status === 'published' && selectedContentItem.linkedin_post_url && (
                  <a
                    href={selectedContentItem.linkedin_post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View on LinkedIn</span>
                  </a>
                )}
                
                <button 
                  onClick={() => handleDeleteContent(selectedContentItem.id)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loadingContent) {
    return (
      <div className="flex h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your calendar...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen bg-gray-50">
        <LeftPanel />
        <RightPanel />
        
        <DragOverlay>
          {activeId ? (
            <div className="bg-white border-2 border-slate-300 rounded-lg p-3 shadow-xl opacity-90 transform rotate-2">
              <div className="text-sm text-gray-600 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Moving content...</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
      
      <ScheduleModal />
      <ContentPreviewModal />
    </DndContext>
  )
}
