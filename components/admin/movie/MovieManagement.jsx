"use client";

import React, { useState } from "react";
import { LayoutGrid, UploadCloud, Film } from "lucide-react";
import MovieType from "./MovieType";
import UpdateMovie from "./UpdateMovie";
import UploadMovie from "./UploadMovie";

export default function MovieManagement({ isUpdate, movie = null, initialTab = "upload" }) {
    const [activeTab, setActiveTab] = useState(initialTab === "type" ? "type" : "upload");

    return (
        <>
            {/* Top Navigation Tabs */}
            <div className="flex p-1 bg-gray-200/50 rounded-xl w-fit mb-8 shadow-inner border border-gray-200/60">
                <button
                    onClick={() => setActiveTab("type")}
                    className={`flex cursor-pointer items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 
                        ${activeTab === "type" ? "bg-white text-amber-600 shadow-md font-bold" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
                >
                    <LayoutGrid size={18} />
                    Movie Type
                </button>

                <button
                    onClick={() => setActiveTab("upload")}
                    className={`flex cursor-pointer items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 
                        ${activeTab === "upload" ? "bg-white text-amber-600 shadow-md font-bold" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
                >
                    <UploadCloud size={18} />
                    {isUpdate ? "Update Details" : "Upload Content"}
                </button>
            </div>

            {/* Tab Body */}
            <div>
                {activeTab === "type" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <MovieType />
                    </div>
                )}

                {activeTab === "upload" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {isUpdate ? (
                            movie ? (
                                <UpdateMovie movie={movie} />
                            ) : (
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center py-12">
                                    <p className="text-red-500 font-semibold">Movie not found!</p>
                                </div>
                            )
                        ) : (
                            <UploadMovie />
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
