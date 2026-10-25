import React from 'react'

export default function LoadingCard() {
    return (
        <div className="animate-pulse">
            <div className="bg-gray-200 rounded-lg aspect-5/6 w-full mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
        </div>
    )
}
