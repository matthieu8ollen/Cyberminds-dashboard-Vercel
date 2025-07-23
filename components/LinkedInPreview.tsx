'use client'

import { useState } from 'react'
import { User, Heart, MessageCircle, Repeat2, Send, MoreHorizontal, ThumbsUp, Globe } from 'lucide-react'

interface LinkedInPreviewProps {
  content: string // This will now be an HTML string
  profileName?: string
  profileTitle?: string
  profileImage?: string
}

export default function LinkedInPreview({ 
  content, 
  profileName = "John Smith", 
  profileTitle = "Chief Financial Officer at TechCorp",
  profileImage 
}: LinkedInPreviewProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(12)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm max-w-md mx-auto">
      {/* LinkedIn Post Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start space-x-3">
          {/* Profile Picture */}
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            {profileImage ? (
              <img 
                src={profileImage} 
                alt={profileName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          
          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {profileName}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5 truncate">
                  {profileTitle}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500">2h</span>
                  <span className="mx-1 text-gray-400">•</span>
                  <Globe className="w-3 h-3 text-gray-500" />
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600 p-1">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post Content - Updated to render HTML */}
      <div className="p-4">
        <div 
          className="text-sm text-gray-900 leading-relaxed prose prose-sm"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Engagement Stats */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="flex -space-x-1">
              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                <ThumbsUp className="w-2.5 h-2.5 text-white" />
              </div>
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <Heart className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <span>{likeCount}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span>3 comments</span>
            <span>1 repost</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleLike}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              liked 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            <span>Like</span>
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span>Comment</span>
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Repeat2 className="w-4 h-4" />
            <span>Repost</span>
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  )
}
