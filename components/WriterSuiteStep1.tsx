'use client'

import { useState } from 'react'
import { Sparkles, Target, TrendingUp } from 'lucide-react'

interface WriterSuiteStep1Props {
  onContinue: (data: { topic: string; source: 'ai' | 'user' }) => void
}

export default function WriterSuiteStep1({ onContinue }: WriterSuiteStep1Props) {
  const [selectedOption, setSelectedOption] = useState<'ai' | 'user' | null>(null)
  const [userTopic, setUserTopic] = useState('')
  const [loading, setLoading] = useState(false)

  // Mock trending topics - replace with real data later
  const trendingTopics = [
    "Hiring challenges at Series A stage",
    "AI's impact on SaaS customer success", 
    "Remote team building strategies",
    "CFO metrics that actually matter",
    "Scaling from 10 to 100 employees"
  ]

  const handleGenerateTopics = async () => {
    setLoading(true)
    // Mock AI generation - replace with real AI call later
    setTimeout(() => {
      setLoading(false)
      // For now, simulate selecting a trending topic
      onContinue({ 
        topic: trendingTopics[0], 
        source: 'ai' 
      })
    }, 2000)
  }

  const handleOptimizeTopic = () => {
    if (userTopic.trim()) {
      onContinue({ 
        topic: userTopic.trim(), 
        source: 'user' 
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">What do you want to write about?</h1>
        <p className="text-gray-600">Choose how you'd like to discover your next content topic</p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        
        {/* Option A: AI Generated Topics */}
        <div className="mb-8">
          <div 
            className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
              selectedOption === 'ai' 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedOption('ai')}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Option A: Let AI suggest trending topics</h3>
                <p className="text-gray-600 text-sm">AI analyzes current trends in your industry</p>
              </div>
            </div>
            
            <button
              onClick={handleGenerateTopics}
              disabled={loading}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition flex items-center space-x-2 ${
                selectedOption === 'ai'
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-100 text-gray-600'
              } disabled:opacity-50`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating Topics...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Topic Ideas</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500 font-medium">OR</span>
          </div>
        </div>

        {/* Option B: User Input */}
        <div>
          <div 
            className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
              selectedOption === 'user' 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedOption('user')}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Option B: I have my own topic</h3>
                <p className="text-gray-600 text-sm">Enter your specific topic or idea</p>
              </div>
            </div>

            <div className="space-y-4">
              <textarea
                value={userTopic}
                onChange={(e) => {
                  setUserTopic(e.target.value)
                  setSelectedOption('user')
                }}
                placeholder="Enter your topic or idea..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={3}
              />
              
              <button
                onClick={handleOptimizeTopic}
                disabled={!userTopic.trim()}
                className={`px-6 py-3 rounded-lg font-medium transition flex items-center space-x-2 ${
                  userTopic.trim()
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Optimize This Topic</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Trending Topics */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h4 className="font-semibold text-gray-900">Recent trending topics:</h4>
          </div>
          <ul className="space-y-2">
            {trendingTopics.map((topic, index) => (
              <li key={index} className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                <button
                  onClick={() => {
                    setUserTopic(topic)
                    setSelectedOption('user')
                  }}
                  className="text-gray-700 hover:text-indigo-600 transition text-left"
                >
                  "{topic}"
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 flex justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-2 bg-indigo-600 rounded-full"></div>
          <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
          <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
          <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
          <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
        </div>
        <span className="ml-4 text-sm text-gray-600">Step 1 of 5</span>
      </div>
    </div>
  )
}
