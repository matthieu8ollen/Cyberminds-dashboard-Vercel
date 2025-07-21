export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 gradient-bg rounded-xl flex items-center justify-center mb-4 mx-auto">
          <span className="text-white font-bold text-2xl">CM</span>
        </div>
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading CyberMinds...</p>
      </div>
    </div>
  )
}
