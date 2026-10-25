"use client";
import React from "react";

export default function GameFilter({ gameTypes, searchType, setSearchType, setSearchTitle }) {
    const categories = [
        { label: "All Assets", value: "all" },
        ...(gameTypes?.map((type) => ({
            label: type.name.charAt(0).toUpperCase() + type.name.slice(1), // First letter uppercase korar jonno
            value: type.name.toLowerCase(),
        })) || []),
    ];

    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10 p-4 bg-gray-900/50 rounded-2xl border border-gray-800">
            <div className="relative w-full md:w-1/3">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <input
                    type="text"
                    placeholder="Search game assets..."
                    onChange={(e) => setSearchTitle(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-500"
                />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((cat) => (
                    <button
                        key={cat.value}
                        onClick={() => setSearchType(cat.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            searchType === cat.value
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );
}