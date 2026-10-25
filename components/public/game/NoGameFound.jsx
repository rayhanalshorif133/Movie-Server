"use client";
import React from "react";

export default function NoGameFound() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
                <svg
                    className="relative w-24 h-24 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M11 15h2m-2 4h2m2-14v11a1 1 0 01-1 1H6a1 1 0 01-1-1V5a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 10l2 2m0 0l2-2m-2 2v-4"
                    />
                </svg>
            </div>

            {/* মেসেজ সেকশন */}
            <h3 className="text-2xl font-bold text-white mb-2">
                No Games Found!
            </h3>
            <p className="text-gray-400 max-w-xs mx-auto">
                We couldn't find any assets matching your search. Try using different keywords or categories.
            </p>

            {/* রিসেট বাটন (ঐচ্ছিক) */}
            <button 
                onClick={() => window.location.reload()}
                className="mt-8 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-full transition-all border border-gray-700 text-sm font-medium"
            >
                Clear Search
            </button>
        </div>
    );
}