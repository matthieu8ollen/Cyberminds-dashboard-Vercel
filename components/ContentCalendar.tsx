'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
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
  RepeatIcon
} from 'lucide-react'
import { getSavedContent, GeneratedContent } from '../lib/supabase'

interface ScheduledContent extends GeneratedContent {
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
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('month')
  const [filter, setFilter] = useState<ContentFilter>('all')
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedContent, setSelectedContent] = useState<ScheduledContent | null>(null)
  const [showContentPreview, setShowContentPreview] = useState(false)
  const [draggedContent, setDraggedContent] = useState<ScheduledContent | null>(null)
  const [availableContent, setAvailableContent] = useState<GeneratedContent[]>([])

  useEffect(() => {
    loadScheduledContent()
    loadAvailableContent()
  }, [user])

  const loadScheduledContent = async () => {
    const mockScheduledContent: ScheduledContent[] = [
      {
        id: 'scheduled-1',
        user_id: user?.id || '',
        content_text: `🎯 5 Key Financial Metrics Every SaaS CFO Must Track\n\n1️⃣ Monthly Recurring Revenue (MRR) growth rate\n2️⃣ Customer Acquisition Cost (CAC) vs Lifetime Value (LTV)\n3️⃣ Gross Revenue Retention (GRR) and Net Revenue Retention (NRR)\n4️⃣ Burn rate and runway calculation\n5️⃣ Unit economics and contribution margins\n\nThese aren't just numbers—they're the heartbeat of your business.\n\nWhich metric do you find most challenging to optimize? 👇\n\n#SaaS #CFO #Metrics #FinanceStrategy`,
        content_type: 'framework',
        tone_used: 'insightful',
        prompt_input: 'SaaS financial metrics',
        is_saved: true,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        scheduled_date: getTomorrowDate(),
        scheduled_time: '09:00',
        status: 'scheduled'
      },
      {
        id: 'scheduled-2',
        user_id: user?.id || '',
        content_text: `Stop doing this: Budget variance analysis\n\nThe old way: Spreadsheet gymnastics with 47 tabs\nThe smart way: Real-time dashboards with automated alerts\n\nYour time is worth more than cell formatting.\n\nWhat's your biggest budgeting time-waster? Let's solve it. 👇\n\n#CFO #Budgeting #Automation #Efficiency`,
        content_type: 'mistake',
        tone_used: 'bold',
        prompt_input: 'Budget variance analysis mistakes',
        is_saved: true,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        scheduled_date: getDateString(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
        scheduled_time: '14:00',
        status: 'scheduled',
        recurring: {
          frequency: 'weekly',
          interval: 1
        }
      },
      {
        id: 'published-1',
        user_id: user?.id || '',
        content_text: `📊 Quarter-end close: 3 days → 3 hours\n\nHow we transformed our financial close process:\n\n✅ Automated journal entries\n✅ Real-time reconciliations\n✅ Integrated reporting dashboards\n\nResult: 90% time reduction, 100% accuracy improvement\n\nThe future of finance is automated. Are you ready?\n\n#FinanceTransformation #Automation #Efficiency`,
        content_type: 'story',
        tone_used: 'insightful',
        prompt_input: 'Financial close automation success',
        is_saved: true,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        scheduled_date: getYesterdayDate(),
        scheduled_time: '10:00',
        status: 'published'
      }
    ]
    
    setScheduledContent(mockScheduledContent)
  }

  const loadAvailableContent = async () => {
    if (!user) return
    
    try {
      const { data } = await getSavedContent(user.id)
      if (data) {
        const unscheduledContent = data.filter(content => 
          !scheduledContent.some(scheduled => scheduled.id === content.id)
        )
        setAvailableContent(unscheduledContent)
      }
    } catch (error) {
      console.error('Error loading available content:', error)
    }
  }

  const getTomorrowDate = (): string => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return getDateString(tomorrow)
  }

  const getYesterdayDate = (): string => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return getDateString(yesterday)
  }

  const getDateString = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  const getDaysInMonth = (date: Date): Date[] => {
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

  const getContentForDate = (date: Date): ScheduledContent[] => {
    const dateString = getDateString(date)
    return scheduledContent.filter(content => 
      content.scheduled_date === dateString &&
      (filter === 'all' || content.status === filter)
    )
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowScheduleModal(true)
  }

  const handleContentClick = (content: ScheduledContent) => {
    setSelectedContent(content)
    setShowContentPreview(true)
  }

  const handleDragStart = (e: React.DragEvent, content: ScheduledContent) => {
    setDraggedContent(content)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    if (draggedContent) {
      setScheduledContent(prev => prev.map(content =>
        content.id === draggedContent.id
          ? { ...content, scheduled_date: getDateString(date) }
          : content
      ))
      setDraggedContent(null)
    }
  }

  const getStatusColor = (status: ScheduledContent['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'published': return 'bg-green-100 text-green-800 border-green-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: ScheduledContent['status']) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-3 h-3" />
      case 'published': return <CheckCircle className="w-3 h-3" />
      case 'failed': return <AlertCircle className="w-3 h-3" />
      case 'draft': return <Edit3 className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'framework': return <BarChart3 className="w-3 h-3" />
      case 'story': return <Target className="w-3 h-3" />
      case 'trend': return <Sparkles className="w-3 h-3" />
      default: return <BarChart3 className="w-3 h-3" />
    }
  }

  const ContentCard = ({ content, isCompact = false }: { content: ScheduledContent; isCompact?: boolean }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, content)}
      onClick={() => handleContentClick(content)}
      className={`
        bg-white border rounded-lg p-2 cursor-pointer hover:shadow-md transition-all duration-200
        ${getStatusColor(content.status)} border
        ${isCompact ? 'text-xs' : 'text-sm'}
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

  const ScheduleModal = () => {
    if (!showScheduleModal || !selectedDate) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Schedule Content for {selectedDate.toLocaleDateString()}
              </h3>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
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
                    <button className="ml-3 px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">
                      Schedule
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recurring</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="">One-time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Schedule Content
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
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
                      ? 'bg-indigo-600 text-white'
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
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Content</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="failed">Failed</option>
                <option value="draft">Drafts</option>
              </select>
            </div>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Plus className="w-4 h-4" />
              <span>Schedule Content</span>
            </button>
          </div>
        </div>

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
              className="px-3 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
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
            
            return (
              <div
                key={index}
                className={`
                  min-h-[100px] border-r border-b border-gray-200 p-2 relative
                  ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                  ${isToday ? 'bg-indigo-50' : ''}
                  hover:bg-gray-50 cursor-pointer transition-colors
                `}
                onClick={() => handleDateClick(date)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, date)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`
                    text-sm font-medium
                    ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    ${isToday ? 'text-indigo-600 font-bold' : ''}
                  `}>
                    {date.getDate()}
                  </span>
                  
                  {dayContent.length > 0 && (
                    <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                      {dayContent.length}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayContent.slice(0, 2).map(content => (
                    <ContentCard key={content.id} content={content} isCompact />
                  ))}
                  
                  {dayContent.length > 2 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{dayContent.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <ScheduleModal />

      {showContentPreview && selectedContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Content Preview</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedContent.status)}`}>
                      {getStatusIcon(selectedContent.status)}
                      <span className="ml-1 capitalize">{selectedContent.status}</span>
                    </span>
                    <span className="text-sm text-gray-500">
                      {selectedContent.scheduled_date} at {selectedContent.scheduled_time}
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
                {selectedContent.content_text}
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
                  {selectedContent.status === 'scheduled' && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
                      <Send className="w-4 h-4" />
                      <span>Publish Now</span>
                    </button>
                  )}
                  {selectedContent.status === 'failed' && (
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
                      <RepeatIcon className="w-4 h-4" />
                      <span>Retry</span>
                    </button>
                  )}
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
