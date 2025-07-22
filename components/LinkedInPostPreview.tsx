import React from 'react';
import { ThumbsUp, MessageCircle, Share2, Send } from 'lucide-react';

interface LinkedInPostPreviewProps {
  // The actual content of the post, likely HTML or Markdown rendered as HTML
  content: string;
  // The title or main hook of the post
  title?: string;
  // User's name to display as the author
  authorName: string;
  // User's professional title/description
  authorTitle: string;
  // URL for the author's profile picture
  profilePicUrl?: string;
  // Optional: Date of the post for realism
  postDate?: string;
}

export default function LinkedInPostPreview({
  content,
  title,
  authorName,
  authorTitle,
  profilePicUrl = 'https://placehold.co/40x40/6366f1/ffffff?text=CM', // Default placeholder
  postDate = 'Just now',
}: LinkedInPostPreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200 w-full max-w-xl mx-auto font-inter">
      {/* Post Header */}
      <div className="flex items-center mb-4">
        <img
          src={profilePicUrl}
          alt={`${authorName}'s profile`}
          className="w-10 h-10 rounded-full mr-3 border border-gray-200"
          onError={(e) => {
            // Fallback to a generic placeholder if the image fails to load
            e.currentTarget.src = 'https://placehold.co/40x40/6366f1/ffffff?text=CM';
          }}
        />
        <div>
          <p className="font-semibold text-gray-800 text-sm">{authorName}</p>
          <p className="text-gray-500 text-xs">{authorTitle}</p>
          <p className="text-gray-500 text-xs">{postDate}</p>
        </div>
      </div>

      {/* Post Content */}
      <div className="text-gray-800 text-sm leading-relaxed mb-4">
        {title && <h3 className="font-bold text-base mb-2">{title}</h3>}
        {/*
          DANGER: Using dangerouslySetInnerHTML is necessary here to render
          HTML content from the rich text editor. Ensure that the content
          is sanitized on the backend if it comes from user input to
          prevent XSS attacks. For AI-generated content, this is generally
          safer as the AI controls the output, but always be mindful.
        */}
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>

      {/* Engagement Stats (Mock) */}
      <div className="flex items-center text-gray-500 text-xs mb-4 border-b border-gray-100 pb-2">
        <ThumbsUp className="w-3 h-3 mr-1" />
        <span>0</span>
        <MessageCircle className="w-3 h-3 ml-4 mr-1" />
        <span>0</span>
        <Share2 className="w-3 h-3 ml-4 mr-1" />
        <span>0</span>
      </div>

      {/* Engagement Buttons (Mock) */}
      <div className="flex justify-around text-gray-600 font-medium text-sm">
        <button className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100 transition-colors duration-200">
          <ThumbsUp className="w-4 h-4 mr-2" />
          Like
        </button>
        <button className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100 transition-colors duration-200">
          <MessageCircle className="w-4 h-4 mr-2" />
          Comment
        </button>
        <button className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100 transition-colors duration-200">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </button>
        <button className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100 transition-colors duration-200">
          <Send className="w-4 h-4 mr-2" />
          Send
        </button>
      </div>
    </div>
  );
}
