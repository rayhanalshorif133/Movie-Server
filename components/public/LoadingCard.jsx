import React from 'react'

export default function LoadingCard() {
    return (
        <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-900/90 border border-slate-800/80 animate-pulse flex flex-col">
            <div className="bg-slate-800/80 aspect-[2/3] w-full relative">
                {/* Top Badges Skeleton */}
                <div className="absolute top-2 left-2 w-12 h-4 bg-slate-700/60 rounded-md" />
                <div className="absolute top-2 right-2 w-14 h-4 bg-slate-700/60 rounded-md" />

                {/* Bottom Badges Skeleton */}
                <div className="absolute bottom-2 left-2 w-12 h-4 bg-slate-700/60 rounded-md" />
                <div className="absolute bottom-2 right-2 w-14 h-4 bg-slate-700/60 rounded-md" />
            </div>
            <div className="p-3 space-y-2.5 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                    <div className="h-3.5 bg-slate-800 rounded-md w-4/5"></div>
                    <div className="h-3 bg-slate-800/60 rounded-md w-1/2"></div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800/60">
                    <div className="h-3 bg-slate-800 rounded w-12"></div>
                    <div className="h-3 bg-slate-800 rounded w-14"></div>
                </div>
            </div>
        </div>
    )
}
