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
  ExternalLink
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

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
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
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('month')
  const [filter, setFilter] = useState<ContentFilter>('all')
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
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
  if (!user) return
  
  try {
    // Get scheduled content from content_calendar table
    const { data: scheduledData } = await supabase
      .from('content_calendar')
      .select(`
        *,
        generated_content (*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'scheduled')
    
    // Transform scheduled data
    const scheduledItems: ScheduledContent[] = (scheduledData || []).map(item => ({
      id: item.generated_content.id,
      user_id: item.user_id,
      content_text: item.generated_content.content_text,
      content_type: item.generated_content.content_type,
      tone_used: item.generated_content.tone_used,
      prompt_input: item.generated_content.prompt_input,
      is_saved: item.generated_content.is_saved,
      scheduled_date: item.scheduled_date,
      scheduled_time: item.scheduled_time || '09:00',
      status: 'scheduled',
      created_at: item.generated_content.created_at
    }))
    
    // Add published content
    const publishedItems: ScheduledContent[] = publishedContent.map(content => ({
      ...content,
      scheduled_date: content.published_at ? content.published_at.split('T')[0] : getYesterdayDate(),
      scheduled_time: content.published_at ? content.published_at.split('T')[1]?.substring(0, 5) || '10:00' : '10:00',
      status: 'published'
    }))
    
    setScheduledContent([...scheduledItems, ...publishedItems])
  } catch (error) {
    console.error('Error loading scheduled content:', error)
    // Fallback to empty array
    setScheduledContent([])
  }
}

  const loadAvailableContent = async () => {
    if (!user) return

    try {
      // Use draft content from ContentContext as available content
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
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push(prevDate)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push(new Date(year, month + 1, day))
    }
    
    return days
  }

  function getContentForDate(date: Date): ScheduledContent[] {
    const dateString = getDateString(date)
    return scheduledContent.filter(content => 
      content.scheduled_date === dateString &&
      (filter === 'all' || content.status === filter)
    )
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
    setShowScheduleModalLocal(true)
  }

  function handleContentClick(content: ScheduledContent) {
    setSelectedContentItem(content)
    setShowContentPreview(true)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    
    if (!over) return
    
    const activeContent = scheduledContent.find(c => c.id === active.id)
    if (!activeContent) return
    
    // Extract date from the droppable id (format: "date-YYYY-MM-DD")
    const newDate = over.id.toString().replace('date-', '')
    
    if (activeContent.scheduled_date !== newDate) {
      // Update local state immediately for smooth UX
      setScheduledContent(prev => prev.map(content =>
        content.id === activeContent.id
          ? { ...content, scheduled_date: newDate }
          : content
      ))
      
      // Update in ContentContext/database
      updateContent(activeContent.id, { scheduled_date: newDate })
        .then(success => {
          if (success) {
            showToast('success', `Content moved to ${newDate}`)
            refreshContent()
          } else {
            showToast('error', 'Failed to move content')
            // Revert local state
            setScheduledContent(prev => prev.map(content =>
              content.id === activeContent.id
                ? { ...content, scheduled_date: activeContent.scheduled_date }
                : content
            ))
          }
        })
    }
  }

  function handleDragStart(event: any) {
    setActiveId(event.active.id)
  }

  const handleScheduleContent = (content: any) => {
    setSelectedContent(content)
    setShowScheduleModal(true)
  }

  const handlePublishNow = async (content: any) => {
    try {
      const success = await publishContent(content.id)
      if (success) {
        showToast('success', 'Content published successfully!')
        refreshContent()
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
          setShowContentPreview(false)
        } else {
          showToast('error', 'Failed to delete content')
        }
      } catch (error) {
        showToast('error', 'An error occurred while deleting')
      }
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
      case 'framework': return <BarChart3 className="w-3 h-3" />
      case 'story': return <Target className="w-3 h-3" />
      case 'trend': return <Sparkles className="w-3 h-3" />
      default: return <BarChart3 className="w-3 h-3" />
    }
  }

  // Draggable Content Card Component
  function DraggableContentCard({ content, isCompact = false }: { content: ScheduledContent; isCompact?: boolean }) {
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

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={(e) => {
          e.stopPropagation()
          handleContentClick(content)
        }}
        className={`
          bg-white border rounded-lg p-2 cursor-grab hover:shadow-md transition-all duration-200
          ${getStatusColor(content.status)} border
          ${isCompact ? 'text-xs' : 'text-sm'}
          active:cursor-grabbing hover:scale-105
        `}
      >
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center space-x-1">
            {getContentTypeIcon(content.content_type)}
            {getStatusIcon(content.status)}
            {content.recurring && <RepeatIcon className="w-3 h-3 text-gray-500" />}
          </div>
          <span className="text-xs text-gray-500">{content.scheduled_time}</span>
        </div>
        <p className={`font-medium text-gray-900 mb-1 ${isCompact ? 'line-clamp-1' : 'line-clamp-2'}`}>
          {content.content_text.split('\n')[0].substring(0, isCompact ? 30 : 60)}...
        </p>
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span className="capitalize">{content.content_type}</span>
          <span className="capitalize">{content.tone_used}</span>
        </div>
      </div>
    )
  }

  // Droppable Calendar Day Component
  function DroppableDay({ date, children, isCurrentMonth, isToday }: {
    date: Date
    children: React.ReactNode
    isCurrentMonth: boolean
    isToday: boolean
  }) {
    const { isOver, setNodeRef } = useDroppable({
      id: `date-${getDateString(date)}`,
    })

    return (
      <div
        ref={setNodeRef}
        className={`
          min-h-[100px] border-r border-b border-gray-200 p-2 relative
          ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
          ${isToday ? 'bg-teal-50' : ''}
          ${isOver ? 'bg-teal-100 ring-2 ring-teal-400' : ''}
          hover:bg-gray-50 cursor-pointer transition-colors
        `}
        onClick={() => handleDateClick(date)}
      >
        {children}
      </div>
    )
  }

  function ScheduleModal() {
    if (!showScheduleModalLocal || !selectedDate) return null
    
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
                ✕
              </button>
            </div>
          </div>
          // ... rest of modal content stays the same
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowScheduleModalLocal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
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
                ✕
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
                <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800">
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800">
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800">
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
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Publish Now</span>
                  </button>
                )}
                
                {selectedContentItem.status === 'failed' && (
                  <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 flex items-center space-x-2">
                    <RepeatIcon className="w-4 h-4" />
                    <span>Retry</span>
                  </button>
                )}

                {selectedContentItem.status === 'published' && selectedContentItem.linkedin_post_url && (
                  <a
                    href={selectedContentItem.linkedin_post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View on LinkedIn</span>
                  </a>
                )}
                
                <button 
                  onClick={() => handleDeleteContent(selectedContentItem.id)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 text-red-600 hover:text-red-700"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your calendar...</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
              <p className="text-gray-600 mt-2">
                Schedule, manage and publish your content strategy
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex rounded-lg border border-gray-300">
                {(['month', 'week', 'day'] as CalendarView[]).map(viewType => (
                  <button
                    key={viewType}
                    onClick={() => setView(viewType)}
                    className={`px-4 py-2 text-sm font-medium capitalize ${
                      view === viewType
                        ? 'bg-slate-700 text-white'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {viewType}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as ContentFilter)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">All Content</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                  <option value="failed">Failed</option>
                  <option value="draft">Drafts</option>
                </select>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800">
                <Plus className="w-4 h-4" />
                <span>Schedule Content</span>
              </button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {scheduledContent.filter(c => c.status === 'scheduled').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {scheduledContent.filter(c => c.status === 'published').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-red-100">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {scheduledContent.filter(c => c.status === 'failed').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-purple-100">
                  <RepeatIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recurring</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {scheduledContent.filter(c => c.recurring).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-2 text-sm text-slate-600 hover:text-slate-700 font-medium"
              >
                Today
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 border-b border-gray-200">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="px-4 py-3 text-sm font-medium text-gray-500 text-center">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-[600px]">
            {getDaysInMonth(currentDate).map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth()
              const isToday = date.toDateString() === new Date().toDateString()
              const dayContent = getContentForDate(date)
              const contentIds = dayContent.map(c => c.id)
              
              return (
                <SortableContext key={index} items={contentIds}>
                  <DroppableDay
                    date={date}
                    isCurrentMonth={isCurrentMonth}
                    isToday={isToday}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`
                        text-sm font-medium
                        ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                        ${isToday ? 'text-teal-600 font-bold' : ''}
                      `}>
                        {date.getDate()}
                      </span>
                      {dayContent.length > 0 && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                          {dayContent.length}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayContent.slice(0, 2).map(content => (
                        <DraggableContentCard key={content.id} content={content} isCompact />
                      ))}
                      {dayContent.length > 2 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          +{dayContent.length - 2} more
                        </div>
                      )}
                    </div>
                  </DroppableDay>
                </SortableContext>
              )
            })}
          </div>
        </div>
        
        <ScheduleModal />
        <ContentPreviewModal />
        
        <DragOverlay>
          {activeId ? (
            <div className="bg-white border rounded-lg p-2 shadow-lg opacity-90">
              <div className="text-xs text-gray-600">Moving content...</div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}
