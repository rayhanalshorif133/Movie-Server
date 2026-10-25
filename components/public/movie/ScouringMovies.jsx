import React from 'react'

export default function ScouringMovies() {
    return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
                <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-indigo-500 animate-spin"></div>
                <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-indigo-500/20"></div>
            </div>
            <p className="text-lg font-medium text-slate-300 animate-pulse">
                Scouring the movies...
            </p>
        </div>
    )
}
