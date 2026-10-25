"use client";

import { LayoutGrid, UploadCloud } from "lucide-react";
import UpdateGame from '@/components/admin/game/UpdateGame';
import UploadGame from '@/components/admin/game/UploadGame';
import React, { useState, useEffect } from 'react'; // 1. useEffect add kora hoyeche
import GameType from "./GameType";
import axios from "axios";

export default function GameManagement({ isUpdate, game_id = null }) {
    const [activeTab, setActiveTab] = useState("upload");
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(isUpdate);

    useEffect(() => {
        if (isUpdate) {
            axios.get(`/api/games?id=${game_id}`)
                .then((response) => {
                    setGame(response.data || null);
                })
                .catch((err) => console.error("Error fetching game:", err))
                .finally(() => setLoading(false));
        }
    }, [isUpdate]);


    return (
        <>
            <div className="flex p-1 bg-gray-200/50 rounded-xl w-fit mb-8">
                <button
                    onClick={() => setActiveTab("type")}
                    className={`flex cursor-pointer items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 
                        ${activeTab === "type" ? "bg-white text-blue-600 shadow-md" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
                >
                    <LayoutGrid size={18} />
                    Game Type
                </button>

                <button
                    onClick={() => setActiveTab("upload")}
                    className={`flex cursor-pointer items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 
                        ${activeTab === "upload" ? "bg-white text-blue-600 shadow-md" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
                >
                    <UploadCloud size={18} />
                    {isUpdate ? "Update Details" : "Upload Content"}
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                    {activeTab === "type" && <GameType />}

                    {activeTab === "upload" && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-sm font-medium">Fetching game data...</p>
                                </div>
                            ) : isUpdate ? (
                                game ? <UpdateGame game={game} /> : <p className="text-red-500">Game not found!</p>
                            ) : (
                                <UploadGame />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}