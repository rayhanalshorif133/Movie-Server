import React from 'react'

export default function GameUploadErrorMessage({errorMsg}) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border shadow-sm transition-all duration-300 ${errorMsg.includes('✅')
      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' // Success Style
      : 'bg-amber-50 border-amber-200 text-amber-800'     // Warning/Error Style
      }`}>
      <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${errorMsg.includes('✅') ? 'bg-emerald-100' : 'bg-amber-100'
        }`}>
        {errorMsg.includes('✅') ? (
          <span className="text-xl">✨</span>
        ) : (
          <span className="text-xl">🚫</span>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1">
        <p className="text-sm font-semibold uppercase tracking-wide opacity-70">
          Status Check
        </p>
        <p className="text-[15px] font-medium leading-relaxed">
          {errorMsg}
        </p>
      </div>

      <div className={`w-1.5 h-10 rounded-full ${errorMsg.includes('✅') ? 'bg-emerald-400' : 'bg-amber-400'
        }`} />
    </div>
  )
}
