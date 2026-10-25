"use client";
import React from "react";

export default function ScouringGames() {
    const skeletons = [1, 2, 3, 4];

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 animate-pulse">
                <div className="h-8 w-48 bg-gray-800 rounded-lg"></div>
                <div className="h-0.5 flex-1 bg-gray-800"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {skeletons.map((i) => (
                    <div
                        key={i}
                        className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg"
                    >
                        <div className="aspect-video bg-gray-800 animate-pulse relative">
                            <div className="absolute top-2 right-2 h-5 w-12 bg-gray-700 rounded"></div>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="h-5 bg-gray-800 rounded w-3/4 animate-pulse"></div>

                            <div className="flex justify-between items-center pt-2">
                                <div className="h-4 bg-gray-800 rounded w-1/4 animate-pulse"></div>
                                <div className="h-7 bg-gray-800 rounded w-1/4 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}