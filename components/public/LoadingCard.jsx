import React from 'react'

export default function LoadingCard() {
    return (
        <div className="w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/80 animate-pulse flex flex-col">
            <div className="bg-slate-800/80 aspect-[2/3] w-full relative">
                <div className="absolute top-2.5 left-2.5 w-14 h-4 bg-slate-700/60 rounded-md" />
                <div className="absolute top-2.5 right-2.5 w-16 h-4 bg-slate-700/60 rounded-full" />
            </div>
            <div className="p-3.5 space-y-2.5">
                <div className="h-3.5 bg-slate-800 rounded-md w-3/4"></div>
                <div className="flex justify-between pt-2 border-t border-slate-800/50">
                    <div className="h-3 bg-slate-800 rounded w-10"></div>
                    <div className="h-3 bg-slate-800 rounded w-14"></div>
                </div>
            </div>
        </div>
    )
}
