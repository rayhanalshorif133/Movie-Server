import { getGoogleDriveImageUrl } from '@/utils/google/manage';
import Image from 'next/image';
import React from 'react';
import { FaPlay } from "react-icons/fa";
import { MdHd } from "react-icons/md";

export default function MovieCard({ movie }) {
  if (!movie) return null;

  // Extract year from title like (2019) or fallback to created_at
  const yearMatch = (movie.title || '').match(/\b(19\d{2}|20\d{2})\b/);
  const year = yearMatch ? yearMatch[1] : (movie.created_at ? new Date(movie.created_at).getFullYear() : 'HD');

  // Format size (MB to GB if >= 1000)
  let sizeStr = '';
  if (movie.size) {
    const num = parseFloat(movie.size);
    if (!isNaN(num)) {
      sizeStr = num >= 1000 ? (num / 1024).toFixed(1) + ' GB' : Math.round(num) + ' MB';
    }
  }

  // Dubbed language or category label
  const langBadge = movie.dubbed_lang || (movie.type ? movie.type.replace(/-/g, ' ') : 'HD');

  return (
    <div className="group relative w-full rounded-2xl overflow-hidden bg-slate-900/90 border border-slate-800/80 hover:border-pink-500/50 shadow-lg hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 hover:-translate-y-2 flex flex-col cursor-pointer">
      {/* Poster Image Container (Standard 2:3 Cinema Poster Aspect Ratio) */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
        <Image
          src={getGoogleDriveImageUrl(movie.poster)}
          alt={movie.title || "Movie Poster"}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10 pointer-events-none">
          {/* Quality Badge */}
          <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md border border-white/10 text-amber-400 text-[10px] font-black uppercase tracking-wider shadow-sm">
            <MdHd className="text-sm" /> 1080p
          </span>

          {/* Dubbed / Language Badge */}
          <span className="px-2.5 py-0.5 rounded-full bg-pink-600/90 backdrop-blur-md text-white text-[10px] font-bold shadow-md shadow-pink-600/30 truncate max-w-[110px]">
            {langBadge}
          </span>
        </div>

        {/* Ambient bottom gradient inside poster */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10 pointer-events-none" />

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 z-20">
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-pink-500/50 transform scale-75 group-hover:scale-100 transition-all duration-300">
            <FaPlay className="text-base pl-0.5 text-white" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-pink-300 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            Watch Now
          </span>
        </div>
      </div>

      {/* Movie Details Footer */}
      <div className="p-3.5 flex flex-col justify-between flex-1 bg-slate-900/95 border-t border-slate-800/60">
        <h3 className="text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-pink-400 transition-colors" title={movie.title}>
          {movie.title || "Untitled Movie"}
        </h3>

        <div className="flex items-center justify-between gap-1.5 mt-2 pt-2 border-t border-slate-800/50 text-[11px]">
          {/* Release Year */}
          <span className="font-semibold text-slate-400 flex items-center gap-1">
            {year}
          </span>

          {/* Size or Type Badge */}
          <div className="flex items-center gap-1.5">
            {sizeStr && (
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700/50">
                {sizeStr}
              </span>
            )}
            <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-pink-400 text-[10px] font-semibold border border-pink-500/20 capitalize truncate max-w-[80px]">
              {movie.part_name && movie.part_name !== 'single' ? movie.part_name.replace(/_/g, ' ') : (movie.type || 'Movie')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
