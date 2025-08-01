'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useContent } from '../contexts/ContentContext'
import { useToast } from './ToastNotifications'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Filter,
  Eye,
  Edit3,
  Trash2,
  Send,
  BarChart3,
  Target,
  Sparkles,
  ExternalLink,
  Archive,
  X,
  RefreshCw
} from 'lucide-react'

interface ScheduledContentWithCalendar {
  id: string
  user_id: string
  content_text: string
  content_type: string
  tone_used: string
  status: 'scheduled' | 'published' | 'archived' | 'draft' | undefined
  scheduled_date?: string
  scheduled_time?: string
  created_at: string
  published_at?: string
  linkedin_post_url?: string
  image_url?: string
}

type CalendarView = 'week' | 'day'
type ContentFilter = 'all' | 'scheduled' | 'published' | 'archived'

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
    scheduledContent, 
    publishedContent,
    archivedContent,
    loadingContent,
    refreshContent,
    updateContent,
    scheduleContentItem,
    publishContent,
    deleteContent
  } = useContent()
  const { showToast } = useToast()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('week')
  const [filter, setFilter] = useState<ContentFilter>('all')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedContentItem, setSelectedContentItem] = useState<ScheduledContentWithCalendar | null>(null)
  const [showContentPreview, setShowContentPreview] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('09:00')

  // Combine all content with calendar information - only show content with actual dates
  const calendarContent: ScheduledContentWithCalendar[] = [
    // Scheduled content - only if has scheduled_date
    ...scheduledContent.filter(content => content.scheduled_date).map(content => ({
      ...content,
      status: content.status || 'scheduled' as const,
      scheduled_date: content.scheduled_date!,
      scheduled_time: content.scheduled_time || '09:00'
    })),
  // Published content - use published_at date
  ...publishedContent.map(content => ({
    ...content,
    status: content.status || 'published' as const,
    scheduled_date: content.published_at ? content.published_at.split('T')[0] : new Date().toISOString().split('T')[0],
    scheduled_time: content.published_at ? content.published_at.split('T')[1]?.substring(0, 5) || '10:00' : '10:00'
  })),
  // Archived content that has dates
  ...archivedContent.filter(content => content.scheduled_date).map(content => ({
    ...content,
    status: content.status || 'archived' as const,
    scheduled_date: content.scheduled_date!,
    scheduled_time: content.scheduled_time || '09:00'
  }))
]
  
  useEffect(() => {
    if (user) {
      refreshContent()
    }
  }, [user, refreshContent])

  // Utility functions
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

  function getContentForDate(date: Date): ScheduledContentWithCalendar[] {
    const dateString = getDateString(date)
    return calendarContent.filter(content => 
      content.scheduled_date === dateString &&
      (filter === 'all' || content.status === filter)
    ).sort((a, b) => (a.scheduled_time || '09:00').localeCompare(b.scheduled_time || '09:00'))
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

  function handleContentClick(content: ScheduledContentWithCalendar, event: React.MouseEvent) {
    event.stopPropagation()
    setSelectedContentItem(content)
    setShowContentPreview(true)
  }

  const handlePublishNow = async (content: ScheduledContentWithCalendar) => {
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

  const handleReschedule = async () => {
    if (!selectedContentItem || !rescheduleDate || !rescheduleTime) return
    
    try {
      // Ensure date stays in local timezone without conversion
const localDate = new Date(rescheduleDate + 'T00:00:00')
const dateString = localDate.toISOString().split('T')[0]

const success = await updateContent(selectedContentItem.id, {
  scheduled_date: dateString,
  scheduled_time: rescheduleTime
})
      
      if (success) {
  showToast('success', 'Content rescheduled successfully!')
  setShowRescheduleModal(false)
  setShowContentPreview(false)
  await refreshContent()
  // Force re-render by clearing and resetting selected date
  const currentSelected = selectedDate
  setSelectedDate(new Date())
  setTimeout(() => setSelectedDate(currentSelected), 0)
} else {
        showToast('error', 'Failed to reschedule content')
      }
    } catch (error) {
      showToast('error', 'An error occurred while rescheduling')
    }
  }

  const openRescheduleModal = (content: ScheduledContentWithCalendar) => {
    setSelectedContentItem(content)
    // Ensure date is in YYYY-MM-DD format
    const dateValue = content.scheduled_date || new Date().toISOString().split('T')[0]
    setRescheduleDate(dateValue)
    setRescheduleTime(content.scheduled_time || '09:00')
    setShowRescheduleModal(true)
    setShowContentPreview(false)
  }

  function getStatusColor(status: string | undefined) {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'published': return 'bg-green-100 text-green-800 border-green-200'
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  function getStatusIcon(status: string | undefined) {
    switch (status) {
      case 'scheduled': return <Clock className="w-3 h-3" />
      case 'published': return <CheckCircle className="w-3 h-3" />
      case 'archived': return <Archive className="w-3 h-3" />
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
    const hasArchived = content.some(c => c.status === 'archived')

    let color = 'bg-gray-400'
    if (hasScheduled) color = 'bg-blue-500'
    else if (hasPublished) color = 'bg-green-500'
    else if (hasArchived) color = 'bg-gray-500'
    
    return (
      <div className={`w-2 h-2 ${color} rounded-full mx-auto mt-1`} />
    )
  }

  // Content Card Component
  function ContentCard({ content }: { content: ScheduledContentWithCalendar }) {
    return (
      <div
        onClick={(e) => handleContentClick(content, e)}
        className="flex items-start space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition-all duration-200"
      >
        <div className="text-sm font-medium text-gray-500 w-16 flex-shrink-0">
          {content.scheduled_time || '09:00'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            {getContentTypeIcon(content.content_type)}
            <span className="text-sm font-medium text-gray-900 capitalize">
              {content.content_type}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(content.status || 'draft')}`}>
              {getStatusIcon(content.status || 'draft')}
              <span className="ml-1 capitalize">{content.status || 'draft'}</span>
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

  // Left Panel - Compact Calendar
  function LeftPanel() {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Calendar</h1>
          <p className="text-sm text-gray-600">View and manage scheduled content</p>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {scheduledContent.length}
              </div>
              <div className="text-xs text-gray-600">Scheduled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {publishedContent.length}
              </div>
              <div className="text-xs text-gray-600">Published</div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="flex-1 p-6 pb-2 flex flex-col">
          <div className="flex-1 mb-6 flex flex-col">
            {/* View Controls */}
            <div className="grid grid-cols-2 gap-1 rounded-lg border border-gray-300 overflow-hidden mb-4">
              {(['week', 'day'] as CalendarView[]).map(viewType => (
                <button
                  key={viewType}
                  onClick={() => setView(viewType)}
                  className={`px-6 py-2 text-sm font-medium capitalize text-center ${
                    view === viewType
                      ? 'bg-slate-700 text-white'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  } transition-colors`}
                >
                  {viewType}
                </button>
              ))}
            </div>

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

            <div className="flex-shrink-0 max-h-64 overflow-visible">
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
                    <button
                      key={index}
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
                  )
                })}
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="mb-6">
            <button
              onClick={() => refreshContent()}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">Refresh Calendar</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Right Panel - Content Details
  function RightPanel() {
    const renderContent = (): JSX.Element => {
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
                  <ContentCard key={content.id} content={content} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content scheduled</h3>
                <p className="text-gray-600 mb-4">This date doesn't have any content scheduled yet.</p>
                <p className="text-sm text-gray-500">Schedule content from the Production Pipeline.</p>
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
                          <ContentCard key={content.id} content={content} />
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

      return <div>Unknown view</div>
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
                  <option value="archived">Archived</option>
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
                {selectedContentItem.status === 'scheduled' && (
                  <button 
                    onClick={() => openRescheduleModal(selectedContentItem)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Reschedule</span>
                  </button>
                )}
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
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-400 flex items-center space-x-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Reschedule Modal Component
  function RescheduleModal() {
    if (!showRescheduleModal || !selectedContentItem) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRescheduleModal(false)}>
        <div className="bg-white rounded-xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Reschedule Content</h3>
              <button 
                onClick={() => setShowRescheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Date
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white cursor-pointer"
                  style={{ colorScheme: 'light' }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Time
                </label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                >
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={!rescheduleDate || !rescheduleTime}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loadingContent && calendarContent.length === 0) {
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
    <div className="flex h-screen bg-gray-50">
      <LeftPanel />
      <RightPanel />
      <ContentPreviewModal />
      <RescheduleModal />
    </div>
  )
}
