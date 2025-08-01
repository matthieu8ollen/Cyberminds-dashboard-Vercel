'use client'

import { useState } from 'react'
import { Calendar, Clock, X, Send } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { useToast } from './ToastNotifications'

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00'
]

export default function SchedulingModal() {
  const { selectedContent, showScheduleModal, setShowScheduleModal, scheduleContentItem, publishContent, refreshContent } = useContent()
  const { showToast } = useToast()
  
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [selectedTime, setSelectedTime] = useState('09:00')
  const [isScheduling, setIsScheduling] = useState(false)

  if (!showScheduleModal || !selectedContent) return null

  const handleSchedule = async () => {
    setIsScheduling(true)
    try {
      const success = await scheduleContentItem(selectedContent.id, selectedDate, selectedTime)
      if (success) {
  showToast('success', `Content scheduled for ${selectedDate} at ${selectedTime}`)
  await refreshContent() // Refresh to sync with calendar
  setShowScheduleModal(false)
} else {
        showToast('error', 'Failed to schedule content')
      }
    } catch (error) {
      showToast('error', 'An error occurred while scheduling')
    } finally {
      setIsScheduling(false)
    }
  }

  const handlePublishNow = async () => {
    setIsScheduling(true)
    try {
      const success = await publishContent(selectedContent.id)
      if (success) {
        showToast('success', 'Content published successfully!')
        setShowScheduleModal(false)
      } else {
        showToast('error', 'Failed to publish content')
      }
    } catch (error) {
      showToast('error', 'An error occurred while publishing')
    } finally {
      setIsScheduling(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Schedule Your Content</h3>
            <button 
              onClick={() => setShowScheduleModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Content Preview */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Content Preview</h4>
            <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {selectedContent.content_text.substring(0, 200)}...
              </p>
            </div>
          </div>

          {/* Scheduling Options */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                Time
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

          {/* Quick Schedule Options */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Quick Schedule</p>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
                  setSelectedDate(tomorrow.toISOString().split('T')[0])
                  setSelectedTime('09:00')
                }}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Tomorrow 9AM
              </button>
              <button
                onClick={() => {
                  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  setSelectedDate(nextWeek.toISOString().split('T')[0])
                  setSelectedTime('14:00')
                }}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Next Week 2PM
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <button
              onClick={handlePublishNow}
              disabled={isScheduling}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Publish Now</span>
            </button>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={isScheduling}
                className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
              >
                {isScheduling ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
