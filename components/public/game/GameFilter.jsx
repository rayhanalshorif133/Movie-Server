"use client";
import React from "react";
import { IoSearch, IoClose } from "react-icons/io5";
import { 
    RiGamepadLine, 
    RiFireLine, 
    RiShieldCrossLine, 
    RiCompass3Line 
} from "react-icons/ri";
import { FaCar, FaCube, FaWrench } from "react-icons/fa6";
import { HiSparkles, HiPuzzlePiece, HiOutlineFunnel, HiOutlineArrowPath } from "react-icons/hi2";

export default function GameFilter({ 
    gameTypes = [], 
    searchType = "all", 
    setSearchType, 
    searchTitle = "", 
    setSearchTitle,
    totalResults = 0,
    allCount = 0
}) {
    // Helper to format category names cleanly (e.g. pixel-art -> Pixel Art)
    const formatCategoryLabel = (name) => {
        if (!name) return "";
        return name
            .replace(/[-_]/g, " ")
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
    };

    // Helper to get category icons
    const getCategoryIcon = (val) => {
        const v = String(val).toLowerCase().replace(/[\s-_]/g, "");
        switch (v) {
            case "all":
                return <RiGamepadLine className="text-base" />;
            case "defense":
                return <RiShieldCrossLine className="text-base text-blue-400" />;
            case "pixelart":
                return <HiSparkles className="text-base text-amber-400" />;
            case "platformer":
                return <RiCompass3Line className="text-base text-cyan-400" />;
            case "shooter":
                return <RiFireLine className="text-base text-orange-400" />;
            case "puzzle":
                return <HiPuzzlePiece className="text-base text-purple-400" />;
            case "racing":
                return <FaCar className="text-sm text-red-400" />;
            case "gameobjects":
                return <FaCube className="text-sm text-emerald-400" />;
            case "gamekits":
                return <RiGamepadLine className="text-base text-indigo-400" />;
            case "unreadyassets":
                return <FaWrench className="text-sm text-yellow-400" />;
            default:
                return <RiGamepadLine className="text-base text-blue-400" />;
        }
    };

    const categories = [
        { label: "All Assets", value: "all" },
        ...(gameTypes?.map((type) => ({
            label: formatCategoryLabel(type.name),
            value: type.name.toLowerCase(),
        })) || []),
    ];

    const hasActiveFilter = searchType !== "all" || (searchTitle && searchTitle.trim() !== "");

    const handleClearAll = () => {
        setSearchType("all");
        setSearchTitle("");
    };

    return (
        <div className="relative mb-12">
            {/* Top Showcase Banner */}
            <div className="text-center mb-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-sm">
                    <HiSparkles className="text-blue-400 animate-pulse" />
                    <span>Game Library & 3D Assets Hub</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight">
                    Discover Games & Assets
                </h1>
                <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
                    Browse and download 2D/3D models, game kits, animations and full game files directly with high-speed links.
                </p>
            </div>

            {/* Main Filter & Search Container Card */}
            <div className="relative rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 md:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Decorative background ambient glows */}
                <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-6">
                    {/* Top Row: Search Input & Quick Stats */}
                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                        {/* Search Input Box */}
                        <div className="relative flex-1 group">
                            <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-blue-400 transition-colors pointer-events-none">
                                <IoSearch className="text-xl" />
                            </span>
                            <input
                                type="text"
                                value={searchTitle}
                                placeholder="Search by game title, kit, character, 3D asset..."
                                onChange={(e) => setSearchTitle(e.target.value)}
                                className="w-full pl-12 pr-12 py-3.5 bg-slate-950/70 border border-slate-700/60 rounded-2xl text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all shadow-inner"
                            />
                            {searchTitle && (
                                <button
                                    onClick={() => setSearchTitle("")}
                                    title="Clear search"
                                    className="absolute inset-y-0 right-3 flex items-center pr-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                >
                                    <span className="p-1 rounded-full bg-slate-800 hover:bg-slate-700">
                                        <IoClose size={16} />
                                    </span>
                                </button>
                            )}
                        </div>

                        {/* Results Count & Reset Button */}
                        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                            <div className="flex items-center gap-2 px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-2xl text-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-slate-400">Available:</span>
                                <span className="text-white font-bold">{totalResults}</span>
                                {allCount > 0 && totalResults !== allCount && (
                                    <span className="text-slate-500">/ {allCount}</span>
                                )}
                            </div>

                            {hasActiveFilter && (
                                <button
                                    onClick={handleClearAll}
                                    className="flex items-center gap-1.5 px-3.5 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-all cursor-pointer active:scale-95"
                                    title="Reset all filters"
                                >
                                    <HiOutlineArrowPath className="text-sm" />
                                    <span>Reset</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category Divider & Title */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2 border-t border-slate-800/80">
                        <HiOutlineFunnel className="text-blue-400 text-sm" />
                        <span>Filter by Category</span>
                    </div>

                    {/* Category Filter Pills Grid */}
                    <div className="flex flex-wrap gap-2.5">
                        {categories.map((cat) => {
                            const isSelected = searchType === cat.value;
                            return (
                                <button
                                    key={cat.value}
                                    onClick={() => setSearchType(cat.value)}
                                    className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                                        isSelected
                                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30 scale-[1.02]"
                                            : "bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 hover:scale-[1.01]"
                                    }`}
                                >
                                    <span className={`transition-transform duration-300 ${isSelected ? "text-white scale-110" : "group-hover:scale-110"}`}>
                                        {getCategoryIcon(cat.value)}
                                    </span>
                                    <span>{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Active Filter Summary Bar */}
                    {hasActiveFilter && (
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span>Active Filter:</span>
                                {searchType !== "all" && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                                        Category: <strong>{formatCategoryLabel(searchType)}</strong>
                                        <button 
                                            onClick={() => setSearchType("all")} 
                                            className="hover:text-white cursor-pointer ml-1 p-0.5 rounded hover:bg-blue-500/20"
                                            title="Remove category filter"
                                        >
                                            <IoClose size={14} />
                                        </button>
                                    </span>
                                )}
                                {searchTitle && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                                        Search: <strong>"{searchTitle}"</strong>
                                        <button 
                                            onClick={() => setSearchTitle("")} 
                                            className="hover:text-white cursor-pointer ml-1 p-0.5 rounded hover:bg-purple-500/20"
                                            title="Clear search query"
                                        >
                                            <IoClose size={14} />
                                        </button>
                                    </span>
                                )}
                            </div>
                            <span className="text-slate-500 italic">Showing {totalResults} result{totalResults === 1 ? '' : 's'}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
