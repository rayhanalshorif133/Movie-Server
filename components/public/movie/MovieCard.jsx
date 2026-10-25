import { getGoogleDriveImageUrl } from '@/utils/google/manage';
import Image from 'next/image';
import React from 'react'
import { FaPlay } from "react-icons/fa";

export default function MovieCard({ movie }) {

  

  return (
    <div className="group cursor-pointer playBtn moviePlayModal relative bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/5 shadow-md hover:shadow-blue-500/20 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 w-full">
      <div className="relative h-52 w-full">
      
        <Image
          src={getGoogleDriveImageUrl(movie.poster)}
          alt={movie.title || "Movie Poster"}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
          className="object-cover group-hover:scale-110 transition duration-700"
          loading="eager"
          fetchPriority="high"
        />

        <div
          className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent opacity-80">
        </div>

        <div
          className="absolute top-2 right-2 bg-red-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
          {movie.dubbed_lang ? movie.dubbed_lang : 'N/A'}
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <button
            className="bg-pink-600 hover:bg-pink-700 text-white rounded-full w-12 h-12 
               flex items-center justify-center shadow-lg 
               translate-y-12 scale-50 -rotate-180 opacity-0
               transition-all duration-500 ease-out
               group-hover:translate-y-0 group-hover:scale-100 group-hover:rotate-0 group-hover:opacity-100"
          >
            <FaPlay className="text-lg pl-0.5" />
          </button>
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-sm font-bold text-gray-200 truncate group-hover:text-blue-400 transition">
          {movie.title ? movie.title : 'N/A'}
        </h3>

        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[11px] text-gray-400 font-medium">2025</span>
          <span
            className="text-[10px] border border-gray-600/50 text-gray-400 px-1.5 py-0.5 rounded bg-slate-800/50">
            Action
          </span>
        </div>
      </div>
    </div>
  )
}

