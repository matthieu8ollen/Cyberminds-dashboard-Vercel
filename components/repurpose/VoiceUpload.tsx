'use client'

import { useState, useRef } from 'react'
import { Mic, Upload, X, File } from 'lucide-react'

interface VoiceUploadProps {
  onProcess: (file: File) => void
  isProcessing: boolean
  error?: string
}

export default function VoiceUpload({ onProcess, isProcessing, error }: VoiceUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const ACCEPTED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/mp3']
  const MAX_SIZE = 25 * 1024 * 1024 // 25MB

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.toLowerCase().match(/\.(mp3|wav|m4a|ogg)$/)) {
      return 'Please upload MP3, WAV, M4A, or OGG files only'
    }

    if (file.size > MAX_SIZE) {
      return 'File size must be less than 25MB'
    }

    return null
  }

  const handleFileSelect = (file: File) => {
    const error = validateFile(file)
    if (error) {
      // Error will be handled by parent component
      return
    }

    setSelectedFile(file)
  }

  const handleDragEvents = {
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(true)
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    }
  }

  const handleSubmit = () => {
    if (selectedFile) {
      onProcess(selectedFile)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const canSubmit = selectedFile !== null && !isProcessing

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-2">
          <Mic className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Voice Notes</h3>
        </div>
        <p className="text-gray-600 text-sm">
          Upload your voice recordings, podcasts, or audio content to extract key insights 
          and transform them into LinkedIn post ideas.
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-4">
          {!selectedFile ? (
            /* Drag & Drop Area */
            <div
              {...handleDragEvents}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  Drop your audio file here
                </p>
                <p className="text-gray-600">
                  or click to browse files
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,.wav,.m4a,.ogg,audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                  className="hidden"
                  disabled={isProcessing}
                />
                <label
                  htmlFor="audio-upload"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </label>
              </div>
              <div className="text-xs text-gray-500 mt-4">
                Supported: MP3, WAV, M4A, OGG (Max 25MB)
              </div>
            </div>
          ) : (
            /* Selected File Display */
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <File className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)} • Ready to process
                    </p>
                  </div>
                </div>
                {!isProcessing && (
                  <button
                    onClick={removeFile}
                    className="p-1 text-gray-400 hover:text-red-500 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Submit Button */}
          {selectedFile && (
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="bg-teal-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Audio...</span>
                  </>
                ) : (
                  <span>Generate Ideas</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">🎙️ Tips for better results:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Clear audio quality works best</li>
          <li>• Include your main points and conclusions</li>
          <li>• Longer recordings (3+ minutes) provide more material</li>
          <li>• Avoid background music or noise when possible</li>
        </ul>
      </div>
    </div>
  )
}
