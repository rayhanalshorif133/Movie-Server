import React from 'react'

export default function NoMovieFound() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-slate-800/50 p-6 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">No movies found</h3>
            <p className="text-slate-400 mt-2 max-w-xs">
                We couldn't find any titles matching your search. Try checking for typos or use different keywords.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="mt-6 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
                Clear all filters
            </button>
        </div>
    )
}
