'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Upload, FileText, BarChart3, Target, Zap, Eye, CheckCircle, Link } from 'lucide-react'

interface RepurposeProps {
  onBack: () => void
}

interface ContentAnalysis {
  wordCount: number
  keyInsights: string[]
  contentType: 'blog' | 'newsletter' | 'podcast' | 'video' | 'presentation'
  audienceRelevance: number
  linkedinPotential: number
}

interface LinkedInAngle {
  id: string
  title: string
  description: string
  approach: string
  example: string
  engagement: 'high' | 'medium' | 'low'
  bestFor: string
}

export default function PathRepurpose({ onBack }: RepurposeProps) {
  const [currentStep, setCurrentStep] = useState<'input' | 'analysis' | 'angles' | 'preview'>('input')
  const [contentInput, setContentInput] = useState('')
  const [contentUrl, setContentUrl] = useState('')
  const [inputMethod, setInputMethod] = useState<'paste' | 'url' | 'upload'>('paste')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null)
  const [selectedAngle, setSelectedAngle] = useState<LinkedInAngle | null>(null)
  const [adaptedContent, setAdaptedContent] = useState('')

  const handleAnalyze = () => {
    if (!contentInput.trim() && !contentUrl.trim()) return
    
    setIsAnalyzing(true)
    setCurrentStep('analysis')
    
    // Simulate content analysis
    setTimeout(() => {
      const mockAnalysis = generateMockAnalysis(contentInput || contentUrl)
      setAnalysis(mockAnalysis)
      setIsAnalyzing(false)
      setCurrentStep('angles')
    }, 2500)
  }

  const generateMockAnalysis = (content: string): ContentAnalysis => {
    const wordCount = content.split(' ').length
    
    return {
      wordCount,
      keyInsights: [
        'Data-driven approach with specific metrics',
        'Personal experience and lessons learned',
        'Actionable framework for implementation',
        'Industry trends and future predictions'
      ],
      contentType: wordCount > 1000 ? 'blog' : wordCount > 500 ? 'newsletter' : 'presentation',
      audienceRelevance: 87,
      linkedinPotential: 92
    }
  }

  const getLinkedInAngles = (): LinkedInAngle[] => {
    return [
      {
        id: 'data-story',
        title: 'Data-Driven Insight',
        description: 'Extract the key statistics and turn them into a compelling narrative',
        approach: 'Lead with the most surprising data point, then tell the story behind the numbers',
        example: '"73% of companies are making this mistake (here\'s what the data reveals)"',
        engagement: 'high',
        bestFor: 'B2B audiences who love metrics and benchmarks'
      },
      {
        id: 'behind-scenes',
        title: 'Behind-the-Scenes Story',
        description: 'Share the personal journey and lessons from your original content',
        approach: 'Focus on the human elements, challenges faced, and insights gained',
        example: '"What I learned writing my latest article (the insights surprised me)"',
        engagement: 'high',
        bestFor: 'Personal branding and authentic connection building'
      },
      {
        id: 'framework-share',
        title: 'Framework Extraction',
        description: 'Turn your insights into a step-by-step framework others can follow',
        approach: 'Create a numbered list or process from your key points',
        example: '"The 5-step framework I discovered while researching this topic"',
        engagement: 'medium',
        bestFor: 'Educational content and thought leadership'
      },
      {
        id: 'contrarian-take',
        title: 'Contrarian Angle',
        description: 'Challenge conventional wisdom mentioned in your content',
        approach: 'Find the counterintuitive point and build a debate around it',
        example: '"Everyone\'s doing X, but my research shows Y is better (here\'s why)"',
        engagement: 'high',
        bestFor: 'Sparking discussion and positioning as independent thinker'
      }
    ]
  }

  const handleAngleSelect = (angle: LinkedInAngle) => {
    setSelectedAngle(angle)
    
    // Generate adapted content
    setTimeout(() => {
      const adapted = generateAdaptedContent(angle, contentInput)
      setAdaptedContent(adapted)
      setCurrentStep('preview')
    }, 1000)
  }

  const generateAdaptedContent = (angle: LinkedInAngle, originalContent: string): string => {
    const templates = {
      'data-story': `The data from my latest research surprised me:

73% of companies are missing this critical insight.

Here's what I discovered:

- Point 1: Most organizations focus on vanity metrics
- Point 2: The metrics that actually matter are overlooked  
- Point 3: Simple changes lead to 40% better outcomes

The biggest takeaway? Stop measuring everything and start measuring what matters.

What metrics do you track that actually drive decisions?

#DataDriven #BusinessIntelligence #Leadership`,

      'behind-scenes': `Writing my latest piece taught me something unexpected.

I spent weeks researching this topic, interviewed 20+ experts, and analyzed hundreds of data points.

But the real insight came from a single conversation.

Here's what happened:

A seasoned CEO told me: "Everyone focuses on the strategy, but execution is where companies actually fail."

That one line changed my entire perspective.

Sometimes the most valuable insights come from the most unexpected places.

What's the best advice you've received recently?

#Leadership #Insights #Learning`,

      'framework-share': `After analyzing 100+ examples, I found a pattern.

Here's the 5-step framework that consistently works:

1️⃣ Identify the core problem (not just symptoms)
2️⃣ Gather data from multiple perspectives  
3️⃣ Test solutions on a small scale first
4️⃣ Measure results with leading indicators
5️⃣ Scale what works, kill what doesn't

The key insight: Most people skip step 3 and wonder why their solutions fail.

Which step do you struggle with most?

#Framework #Strategy #BusinessProcess`,

      'contrarian-take': `Everyone says "move fast and break things."

But my research shows the opposite might be true.

I analyzed 200+ startups and found:
- Fast movers had 34% higher failure rates
- Deliberate planners scaled more sustainably
- "Break things" mentality cost companies 6 months on average

The contrarian truth: Sometimes slow and steady actually wins.

Especially when you're dealing with complex problems that require deep thinking.

What's your take? Is speed overrated in business?

#Contrarian #Startup #Strategy #Leadership`
    }

    return templates[angle.id as keyof typeof templates] || templates['data-story']
  }

  const renderContentInput = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Repurpose Your Content</h1>
          <p className="text-gray-600">Transform existing content into engaging LinkedIn posts</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marcus</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* Input Method Selection */}
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-900 mb-4">How would you like to add your content?</p>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => setInputMethod('paste')}
              className={`p-4 rounded-lg border-2 transition ${
                inputMethod === 'paste'
                  ? 'border-teal-500 bg-teal-50 text-teal-900'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileText className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">Paste Text</div>
              <div className="text-sm text-gray-600">Copy and paste your content</div>
            </button>
            
            <button
              onClick={() => setInputMethod('url')}
              className={`p-4 rounded-lg border-2 transition ${
                inputMethod === 'url'
                  ? 'border-teal-500 bg-teal-50 text-teal-900'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Link className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">Add URL</div>
              <div className="text-sm text-gray-600">Link to blog post or article</div>
            </button>
            
            <button
              onClick={() => setInputMethod('upload')}
              className={`p-4 rounded-lg border-2 transition ${
                inputMethod === 'upload'
                  ? 'border-teal-500 bg-teal-50 text-teal-900'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Upload className="w-6 h-6 mx-auto mb-2" />
              <div className="font-medium">Upload File</div>
              <div className="text-sm text-gray-600">PDF, Word, or text file</div>
            </button>
          </div>
        </div>

        {/* Content Input */}
        {inputMethod === 'paste' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              📝 Paste your content here:
            </label>
            <textarea
              value={contentInput}
              onChange={(e) => setContentInput(e.target.value)}
              placeholder="Paste your blog post, newsletter, or any content you want to repurpose for LinkedIn..."
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-vertical"
            />
            <div className="text-sm text-gray-500 mt-2">
              {contentInput.length} characters • {contentInput.split(' ').filter(w => w).length} words
            </div>
          </div>
        )}

        {inputMethod === 'url' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              🔗 Enter the URL:
            </label>
            <input
              type="url"
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              placeholder="https://yourblog.com/article-title"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        )}

        {inputMethod === 'upload' && (
          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Upload your file</p>
              <p className="text-sm text-gray-500">PDF, Word, or text files up to 10MB</p>
              <button className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
                Choose File
              </button>
            </div>
          </div>
        )}

        {/* What Marcus Will Do */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 What Marcus will do:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <BarChart3 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Analyze Content</p>
                <p className="text-sm text-blue-700">Extract key insights and themes</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Find Best Angles</p>
                <p className="text-sm text-blue-700">Identify LinkedIn-optimized approaches</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Optimize for Engagement</p>
                <p className="text-sm text-blue-700">Use psychology-based formatting</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Eye className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Preview & Edit</p>
                <p className="text-sm text-blue-700">Review before publishing</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleAnalyze}
            disabled={!contentInput.trim() && !contentUrl.trim()}
            className={`px-8 py-3 rounded-lg font-medium transition ${
              contentInput.trim() || contentUrl.trim()
                ? 'bg-teal-600 text-white hover:bg-teal-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Analyze & Transform Content
          </button>
        </div>
      </div>
    </div>
  )

  const renderAnalysis = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analyzing Your Content</h1>
        <p className="text-gray-600">Marcus is extracting key insights and finding the best LinkedIn angles...</p>
      </div>

      {isAnalyzing ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Content</h3>
          <div className="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto">
            <div className="space-y-2 text-sm text-gray-600">
              <div>✓ Reading and parsing content</div>
              <div>✓ Identifying key themes and insights</div>
              <div>✓ Analyzing audience relevance</div>
              <div className="flex items-center">
                <div className="animate-pulse">◯</div>
                <span className="ml-2">Finding optimal LinkedIn angles...</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )

  const renderAngleSelection = () => {
    const angles = getLinkedInAngles()

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your LinkedIn Angle</h1>
            <p className="text-gray-600">Based on your content analysis, here are the best approaches:</p>
          </div>
          <button
            onClick={() => setCurrentStep('input')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Try Different Content</span>
          </button>
        </div>

        {/* Analysis Summary */}
        {analysis && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Content Analysis</h3>
            <div className="grid md:grid-cols-4 gap-4 text-center mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{analysis.wordCount}</div>
                <div className="text-sm text-blue-800">Words</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{analysis.audienceRelevance}%</div>
                <div className="text-sm text-green-800">Audience Fit</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">{analysis.linkedinPotential}%</div>
                <div className="text-sm text-purple-800">LinkedIn Potential</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600 capitalize">{analysis.contentType}</div>
                <div className="text-sm text-orange-800">Content Type</div>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Key Insights Detected:</p>
              <div className="grid md:grid-cols-2 gap-2">
                {analysis.keyInsights.map((insight, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Angle Options */}
        <div className="grid gap-6">
          {angles.map((angle) => (
            <div
              key={angle.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-teal-500 hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => handleAngleSelect(angle)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{angle.title}</h3>
                  <p className="text-gray-600 mb-3">{angle.description}</p>
                  <p className="text-sm text-gray-700 mb-3">{angle.approach}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    angle.engagement === 'high' ? 'bg-green-100 text-green-800' :
                    angle.engagement === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {angle.engagement.toUpperCase()} ENGAGEMENT
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-900 mb-1">Example opening:</p>
                <p className="text-gray-700 italic">"{angle.example}"</p>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                <strong>Best for:</strong> {angle.bestFor}
              </p>

              <div className="flex justify-end">
                <div className="flex items-center text-teal-600 font-medium group-hover:text-teal-700">
                  <span>Use this angle</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderPreview = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your LinkedIn Post</h1>
          <p className="text-gray-600">Content adapted with {selectedAngle?.title}</p>
        </div>
        <button
          onClick={() => setCurrentStep('angles')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Try Different Angle</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {adaptedContent}
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setCurrentStep('angles')}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          Try Different Angle
        </button>
        <button
          onClick={() => {
            console.log('Content ready for publishing:', adaptedContent)
            // This could integrate with your existing save functionality
          }}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center space-x-2"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Save & Publish</span>
        </button>
      </div>
    </div>
  )

  switch (currentStep) {
    case 'input':
      return renderContentInput()
    case 'analysis':
      return renderAnalysis()
    case 'angles':
      return renderAngleSelection()
    case 'preview':
      return renderPreview()
    default:
      return renderContentInput()
  }
}
