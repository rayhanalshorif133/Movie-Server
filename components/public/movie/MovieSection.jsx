'use client'

import { useState, Suspense } from 'react'
import MovieCard from "../movie/MovieCard"
import LoadingCard from "../LoadingCard"
import { HiOutlineChevronRight } from "react-icons/hi2";

export default function MovieSection({ type, items, onMovieSelect }) {
  const [showAll, setShowAll] = useState(false)

  // Show 12 items initially, or all if showAll is true
  const displayedItems = showAll ? items : items.slice(0, 12)

  // Format type title nicely (e.g. kolkata-bangla -> Kolkata Bangla Cinema)
  const formatSectionTitle = (val) => {
    if (!val) return "Featured Movies";
    const lower = val.toLowerCase();
    if (lower === "kolkata-bangla") return "Kolkata Bangla Cinema";
    if (lower === "bangladeshi") return "Bangladeshi Movies";
    if (lower === "english") return "Hollywood & English Movies";
    if (lower === "hindi") return "Bollywood & Hindi Movies";
    return val
      .replace(/[-_]/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <section className="space-y-5 relative">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-pink-500 to-purple-600" />
          <h2 className="text-xl md:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <span>{formatSectionTitle(type)}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
              {items.length}
            </span>
          </h2>
        </div>

        {items.length > 12 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-pink-600/20 text-slate-300 hover:text-pink-400 border border-slate-700/60 hover:border-pink-500/30 text-xs font-semibold transition-all cursor-pointer"
          >
            <span>{showAll ? 'Show Less' : `View All (${items.length})`}</span>
            <HiOutlineChevronRight className={`text-xs transition-transform duration-300 ${showAll ? '-rotate-90' : 'group-hover:translate-x-0.5'}`} />
          </button>
        )}
      </div>

      {/* Responsive Movie Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6 transition-all duration-500">
        {displayedItems.map((movie) => (
          <Suspense key={movie.id} fallback={<LoadingCard />}>
            <div onClick={() => onMovieSelect(movie)} className="cursor-pointer w-full h-full flex flex-col">
              <MovieCard movie={movie} />
            </div>
          </Suspense>
        ))}
      </div>
    </section>
  )
}
