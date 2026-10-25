import React from 'react'

export default function StatCard({ label, smallText, text, accentClass, textClass = "text-gray-800" }) {
    return (
        <div className={`bg-white p-6 rounded-lg border border-gray-100 shadow-sm border-l-4 ${accentClass}`}>
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-semibold">{label}</span>
                <span className="text-green-600 text-sm font-semibold">
                    {smallText}
                </span>
            </div>
            <div className={`text-2xl font-bold mt-2 ${textClass}`}>
                {text}
            </div>
        </div>
    )
}
