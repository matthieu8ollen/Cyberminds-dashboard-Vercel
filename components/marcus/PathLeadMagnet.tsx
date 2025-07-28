'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Magnet, Gift, Target, Users, CheckCircle, TrendingUp, Eye, Calendar, Download } from 'lucide-react'

interface LeadMagnetProps {
  onBack: () => void
}

interface LeadMagnetType {
  id: string
  name: string
  description: string
  conversionRate: string
  bestFor: string
  example: string
  effort: 'low' | 'medium' | 'high'
  icon: any
}

interface ConversionStrategy {
  id: string
  title: string
  approach: string
  psychology: string
  example: string
  conversionBoost: string
}

export default function PathLeadMagnet({ onBack }: LeadMagnetProps) {
  const [currentStep, setCurrentStep] = useState<'strategy' | 'magnet-type' | 'content-bridge' | 'preview'>('strategy')
  const [selectedStrategy, setSelectedStrategy] = useState<ConversionStrategy | null>(null)
  const [selectedMagnet, setSelectedMagnet] = useState<LeadMagnetType | null>(null)
  const [generatedContent, setGeneratedContent] = useState('')
  const [conversionGoal, setConversionGoal] = useState<'email' | 'discovery' | 'demo' | 'download'>('email')

  const getConversionStrategies = (): ConversionStrategy[] => {
    return [
      {
        id: 'value-first',
        title: 'Value-First Strategy',
        approach: 'Give massive value upfront, then make a soft offer',
        psychology: 'Reciprocity principle - people feel obligated to give back when they receive value',
        example: 'Share 3 best tips from your checklist, then offer the complete 23-point version',
        conversionBoost: '60% higher'
      },
      {
        id: 'problem-agitation',
        title: 'Problem-Agitation Strategy',
        approach: 'Highlight a painful problem, agitate it, then provide the solution',
        psychology: 'Loss aversion - people are motivated more by avoiding loss than gaining',
        example: 'The fundraising mistake that costs 6 months and $50K, here\'s how to avoid it',
        conversionBoost: '45% higher'
      },
      {
        id: 'social-proof',
        title: 'Social Proof Strategy',
        approach: 'Show results others achieved, then offer the same system',
        psychology: 'Social validation - people follow what others are successfully doing',
        example: 'How 12 founders used this checklist to raise $2M+ (get the same system)',
        conversionBoost: '35% higher'
      },
      {
        id: 'curiosity-gap',
        title: 'Curiosity Gap Strategy',
        approach: 'Create intrigue about your method, then reveal it in the lead magnet',
        psychology: 'Information gap theory - curiosity creates strong motivation to learn',
        example: 'The counter-intuitive hiring approach that saves 80% of bad hires',
        conversionBoost: '50% higher'
      }
    ]
  }

  const getLeadMagnetTypes = (): LeadMagnetType[] => {
    return [
      {
        id: 'checklist',
        name: 'Checklist',
        description: 'Step-by-step verification lists that ensure nothing is missed',
        conversionRate: '15-25%',
        bestFor: 'Process-oriented professionals who want to avoid mistakes',
        example: 'SaaS Fundraising Readiness Checklist (23 points)',
        effort: 'low',
        icon: CheckCircle
      },
      {
        id: 'template',
        name: 'Template',
        description: 'Fill-in-the-blank frameworks that save time and provide structure',
        conversionRate: '12-20%',
        bestFor: 'Busy executives who want proven systems they can implement quickly',
        example: 'Financial Dashboard Template for Series A Companies',
        effort: 'medium',
        icon: Target
      },
      {
        id: 'calculator',
        name: 'Calculator',
        description: 'Interactive tools that provide personalized insights and recommendations',
        conversionRate: '20-35%',
        bestFor: 'Data-driven professionals who want customized analysis',
        example: 'SaaS Metrics Health Calculator (LTV, CAC, Churn Analysis)',
        effort: 'high',
        icon: TrendingUp
      },
      {
        id: 'guide',
        name: 'Guide',
        description: 'Comprehensive how-to resources that solve specific problems',
        conversionRate: '10-18%',
        bestFor: 'People facing complex challenges who need detailed solutions',
        example: 'The Complete Guide to Finance Team Scaling (0-$10M)',
        effort: 'high',
        icon: Download
      },
      {
        id: 'toolkit',
        name: 'Toolkit',
        description: 'Collection of resources that provide everything needed for a task',
        conversionRate: '18-28%',
        bestFor: 'Professionals who want a complete solution in one package',
        example: 'CFO Toolkit: Templates, Checklists & Frameworks Bundle',
        effort: 'medium',
        icon: Gift
      }
    ]
  }

  const handleStrategySelect = (strategy: ConversionStrategy) => {
    setSelectedStrategy(strategy)
    setCurrentStep('magnet-type')
  }

  const handleMagnetSelect = (magnet: LeadMagnetType) => {
    setSelectedMagnet(magnet)
    setCurrentStep('content-bridge')
  }

  const handleGenerateContent = () => {
    if (!selectedStrategy || !selectedMagnet) return
    
    const content = generateLeadMagnetContent(selectedStrategy, selectedMagnet, conversionGoal)
    setGeneratedContent(content)
    setCurrentStep('preview')
  }

  const generateLeadMagnetContent = (strategy: ConversionStrategy, magnet: LeadMagnetType, goal: string): string => {
  const templates: Record<string, Record<string, string>> = {
    'value-first': {
      'checklist': `I've reviewed 47 pitch decks. Here's why 43 got rejected in the first 5 minutes.

After helping 12 founders fix these issues and secure funding, I've identified the 3 most common deck killers:

1️⃣ Financial projections that don't add up
→ Investors spot inconsistencies immediately
→ Shows lack of attention to detail
→ Kills credibility before you even start

2️⃣ No clear path to profitability  
→ "We'll figure it out with scale" isn't a strategy
→ Need specific milestones and unit economics
→ Must show you understand your business model

3️⃣ Missing competitive differentiation
→ "We have no competition" is a red flag
→ Shows you don't understand your market
→ Need clear positioning against alternatives

These mistakes cost founders 6+ months and countless rejections.

The good news? They're all preventable with proper preparation.

I've turned this analysis into a complete 23-point fundraising readiness checklist that covers everything from financial modeling to pitch delivery.

Want the complete checklist? Drop a comment with "CHECKLIST" and I'll send it over.

#Fundraising #Startups #PitchDeck #VentureCapital`,

      'template': `The financial dashboard that helped 3 startups raise $8M+ in Series A.

When investors ask for your metrics, most founders scramble to pull data from 5 different tools.

Here's what actually happened to me:
→ Investor meeting at 2pm
→ "Can you send your unit economics by 4pm?"  
→ Spent 3 hours building a dashboard from scratch
→ Nearly missed the follow-up meeting

That's when I built the template that changed everything.

This dashboard includes:
- LTV:CAC ratio with cohort breakdown
- Monthly recurring revenue with growth rates
- Customer acquisition cost by channel
- Churn analysis with retention curves
- Cash flow projections for 18 months

Result? Next 3 companies that used it all raised successfully.

One founder told me: "This saved me 20+ hours and made our metrics look incredibly professional."

Want the exact template? Comment "TEMPLATE" below and I'll share the Google Sheets version.

#SaaS #Fundraising #Metrics #Dashboard`
    },
    'problem-agitation': {
      'checklist': `The fundraising mistake that's costing founders 6 months and their sanity.

I see it every week:

Smart founders with great products get rejected over and over again.

Not because their business is bad.
Not because the market isn't ready.
Not because they're talking to the wrong investors.

Because they're making preventable mistakes in their preparation.

Here's what's happening:
→ 73% of decks have financial errors that kill credibility
→ 68% can't answer basic questions about unit economics  
→ 84% haven't properly researched their target investors
→ 91% don't have a clear follow-up strategy

Each rejection chips away at your confidence.
Each "we'll pass" makes the next pitch harder.
Each month that passes burns more runway.

The worst part? These mistakes are completely avoidable.

I've created a 23-point checklist that prevents every common fundraising mistake.

Used by 47+ founders who've collectively raised $23M+.

Ready to stop wasting time on preventable rejections?

Comment "READY" and I'll send you the complete checklist.

#Fundraising #StartupStruggles #VentureCapital`
    }
  }

    return templates[strategy.id]?.[magnet.id] || templates['value-first']['checklist']
  }
    const strategyKey = strategy.id as keyof typeof templates
    const magnetKey = magnet.id as keyof typeof templates[strategyKey]
    
    return templates[strategyKey]?.[magnetKey] || templates['value-first']['checklist']
  }

  const renderStrategySelection = () => {
    const strategies = getConversionStrategies()

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Lead Generation Strategy</h1>
            <p className="text-gray-600">Different psychological approaches for different audiences and goals</p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marcus</span>
          </button>
        </div>

        {/* Conversion Goal Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 What's your conversion goal?</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { id: 'email', label: 'Email List Growth', icon: Users },
              { id: 'discovery', label: 'Discovery Calls', icon: Calendar },
              { id: 'demo', label: 'Product Demos', icon: Eye },
              { id: 'download', label: 'Resource Downloads', icon: Download }
            ].map((goal) => {
              const Icon = goal.icon
              return (
                <button
                  key={goal.id}
                  onClick={() => setConversionGoal(goal.id as any)}
                  className={`p-4 rounded-lg border-2 transition ${
                    conversionGoal === goal.id
                      ? 'border-teal-500 bg-teal-50 text-teal-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium text-sm">{goal.label}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Strategy Options */}
        <div className="grid gap-6">
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-teal-500 hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => handleStrategySelect(strategy)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{strategy.title}</h3>
                  <p className="text-gray-600 mb-3">{strategy.approach}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{strategy.conversionBoost}</div>
                  <div className="text-sm text-gray-500">vs generic posts</div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-blue-900 mb-1">Psychology:</p>
                <p className="text-sm text-blue-800">{strategy.psychology}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-900 mb-1">Example approach:</p>
                <p className="text-gray-700 italic">"{strategy.example}"</p>
              </div>

              <div className="flex justify-end">
                <div className="flex items-center text-teal-600 font-medium group-hover:text-teal-700">
                  <span>Use this strategy</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderMagnetTypeSelection = () => {
    const magnetTypes = getLeadMagnetTypes()

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Lead Magnet Type</h1>
            <p className="text-gray-600">Using {selectedStrategy?.title} with different magnet formats</p>
          </div>
          <button
            onClick={() => setCurrentStep('strategy')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Different Strategy</span>
          </button>
        </div>

        <div className="grid gap-6">
          {magnetTypes.map((magnet) => {
            const Icon = magnet.icon
            return (
              <div
                key={magnet.id}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-teal-500 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => handleMagnetSelect(magnet)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{magnet.name}</h3>
                      <p className="text-gray-600">{magnet.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">{magnet.conversionRate}</div>
                    <div className="text-sm text-gray-500">conversion rate</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900 mb-1">Best for:</p>
                    <p className="text-sm text-gray-700">{magnet.bestFor}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Creation effort:</p>
                      <p className="text-sm text-gray-700 capitalize">{magnet.effort}</p>
                    </div>
                    <div className="flex space-x-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`w-2 h-6 rounded ${
                            (magnet.effort === 'low' && level <= 1) ||
                            (magnet.effort === 'medium' && level <= 2) ||
                            (magnet.effort === 'high' && level <= 3)
                              ? 'bg-teal-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-yellow-900 mb-1">Example:</p>
                  <p className="text-sm text-yellow-800">{magnet.example}</p>
                </div>

                <div className="flex justify-end">
                  <div className="flex items-center text-teal-600 font-medium group-hover:text-teal-700">
                    <span>Create this type</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderContentBridge = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content-to-Offer Bridge</h1>
          <p className="text-gray-600">Create the perfect connection between your content and lead magnet</p>
        </div>
        <button
          onClick={() => setCurrentStep('magnet-type')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Different Type</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Your Lead Magnet Setup:</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-sm font-medium text-blue-900">Strategy</div>
              <div className="text-blue-700">{selectedStrategy?.title}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-sm font-medium text-purple-900">Format</div>
              <div className="text-purple-700">{selectedMagnet?.name}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-sm font-medium text-green-900">Goal</div>
              <div className="text-green-700 capitalize">{conversionGoal.replace('-', ' ')}</div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-yellow-900 mb-3">🧠 Psychology Behind Your Approach:</h4>
          <p className="text-sm text-yellow-800">{selectedStrategy?.psychology}</p>
        </div>

        <div className="text-center">
          <button
            onClick={handleGenerateContent}
            className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium"
          >
            Generate LinkedIn Post
          </button>
        </div>
      </div>
    </div>
  )

  const renderPreview = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🧲 Your Lead Magnet Post</h1>
          <p className="text-gray-600">Content designed to convert with {selectedStrategy?.title}</p>
        </div>
        <button
          onClick={() => setCurrentStep('content-bridge')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Setup</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {generatedContent}
          </div>
        </div>
      </div>

      {/* Performance Prediction */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-green-900 mb-4">📊 Expected Performance:</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {selectedStrategy?.conversionBoost}
            </div>
            <div className="text-sm text-green-800">better than generic posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {selectedMagnet?.conversionRate}
            </div>
            <div className="text-sm text-green-800">expected conversion rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">40-60</div>
            <div className="text-sm text-green-800">predicted comments</div>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setCurrentStep('strategy')}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          Try Different Strategy
        </button>
        <button
          onClick={() => {
            console.log('Lead magnet content ready:', generatedContent)
            // This could integrate with your existing save functionality
          }}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center space-x-2"
        >
          <Magnet className="w-4 h-4" />
          <span>Save & Publish</span>
        </button>
      </div>
    </div>
  )

  switch (currentStep) {
    case 'strategy':
      return renderStrategySelection()
    case 'magnet-type':
      return renderMagnetTypeSelection()
    case 'content-bridge':
      return renderContentBridge()
    case 'preview':
      return renderPreview()
    default:
      return renderStrategySelection()
  }
}
