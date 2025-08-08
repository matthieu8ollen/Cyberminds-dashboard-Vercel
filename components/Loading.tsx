export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-slate-700 via-slate-600 to-teal-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg">
  <img src="/writer-suite-logo.png" alt="Writer Suite" className="w-8 h-8" />
</div>
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Writer Suite...</p>
      </div>
    </div>
  )
}
