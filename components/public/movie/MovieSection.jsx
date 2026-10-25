'use client'

import { useState, Suspense } from 'react'
import MovieCard from "../movie/MovieCard"
import LoadingCard from "../LoadingCard"

export default function MovieSection({ type, items, onMovieSelect }) {
  const [showAll, setShowAll] = useState(false)

  const displayedItems = showAll ? items : items.slice(0, 6)

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-l-4 border-blue-600 pl-3">
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
          {type} <span className="text-sm text-slate-400 font-normal">({items.length})</span>
        </h2>

        {items.length > 6 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-blue-400 cursor-pointer hover:text-blue-300 text-sm font-semibold transition underline decoration-dotted underline-offset-4"
          >
            {showAll ? 'Show Less' : `View All (${items.length - 6} more)`}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 transition-all duration-500">
        {displayedItems.map((movie) => (
          <Suspense key={movie.id} fallback={<LoadingCard />}>
            <div onClick={() => onMovieSelect(movie)} className="cursor-pointer w-48">
              <MovieCard movie={movie} />
            </div>
          </Suspense>
        ))}
      </div>
    </section>
  )
}