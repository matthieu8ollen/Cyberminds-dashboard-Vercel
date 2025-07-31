'use client'

import dynamic from 'next/dynamic'

const ImageGeneration = dynamic(() => import('../../components/ImageGeneration'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Images...</p>
      </div>
    </div>
  )
})

export default function ImagesPage() {
  return <ImageGeneration />
}
