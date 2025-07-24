import { useState } from 'react'
import { ThumbsUp, MessageCircle, Repeat2, Send } from 'lucide-react'

interface LinkedInPreviewProps {
  content: string
  profileName: string
  profileTitle: string
}

export default function LinkedInPreview({ content, profileName, profileTitle }: LinkedInPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // LinkedIn typically truncates at around 140 characters in the feed
  const truncateLimit = 140
  const shouldTruncate = content.length > truncateLimit
  const displayContent = shouldTruncate && !isExpanded 
    ? content.substring(0, truncateLimit).trim() + '...'
    : content

  // Generate realistic engagement numbers
  const likes = Math.floor(Math.random() * 50) + 15
  const comments = Math.floor(Math.random() * 8) + 2
  const reposts = Math.floor(Math.random() * 12) + 3

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden max-w-[550px]">
      {/* Post Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start space-x-3">
          {/* Profile Photo */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-lg">
              {profileName.charAt(0).toUpperCase()}
            </span>
          </div>
          
          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {profileName}
              </h3>
              <span className="text-blue-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
                </svg>
              </span>
              <span className="text-gray-500 text-xs">• 1st</span>
            </div>
            <p className="text-gray-600 text-xs mt-0.5 leading-tight">
              {profileTitle}
            </p>
            <div className="flex items-center space-x-1 text-gray-500 text-xs mt-1">
              <span>2h</span>
              <span>•</span>
              <span>Edited</span>
              <span>•</span>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
          
          {/* More Menu */}
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <div className="text-gray-900 text-sm leading-relaxed whitespace-pre-line">
          {displayContent}
          {shouldTruncate && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-gray-600 hover:text-gray-800 font-medium ml-1"
            >
              more
            </button>
          )}
          {isExpanded && shouldTruncate && (
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-600 hover:text-gray-800 font-medium ml-2 block mt-2"
            >
              Show less
            </button>
          )}
        </div>
      </div>

      {/* Engagement Bar */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
          <div className="flex items-center space-x-1">
            <div className="flex -space-x-1">
              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                <ThumbsUp className="w-2.5 h-2.5 text-white" />
              </div>
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">❤️</span>
              </div>
              <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">👏</span>
              </div>
            </div>
            <span className="ml-2">
              {profileName.split(' ')[0]} and {likes} others
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span>{comments} comment{comments !== 1 ? 's' : ''}</span>
            <span>{reposts} repost{reposts !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-around border-t border-gray-100 pt-2">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex-1 justify-center">
            <ThumbsUp className="w-5 h-5" />
            <span className="text-sm font-medium">Like</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex-1 justify-center">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Comment</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex-1 justify-center">
            <Repeat2 className="w-5 h-5" />
            <span className="text-sm font-medium">Repost</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex-1 justify-center">
            <Send className="w-5 h-5" />
            <span className="text-sm font-medium">Send</span>
          </button>
        </div>
      </div>
    </div>
  )
}
