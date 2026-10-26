import { getGoogleDriveImageUrl } from '@/utils/google/manage';
import Image from 'next/image';
import React from 'react';
import { FaPlay } from "react-icons/fa";
import { MdHd, MdSubtitles } from "react-icons/md";
import { HiCalendar, HiOutlineFolder } from "react-icons/hi2";

export default function MovieCard({ movie }) {
  if (!movie) return null;

  // Extract year from title like (2019) or fallback to created_at
  const yearMatch = (movie.title || '').match(/\b(19\d{2}|20\d{2})\b/);
  const year = yearMatch ? yearMatch[1] : (movie.created_at ? new Date(movie.created_at).getFullYear() : null);

  // Format size (MB to GB if >= 1024)
  let sizeStr = '';
  if (movie.size) {
    const num = parseFloat(movie.size);
    if (!isNaN(num) && num > 0) {
      sizeStr = num >= 1024 ? (num / 1024).toFixed(1) + ' GB' : Math.round(num) + ' MB';
    }
  }

  // Dubbed language or category label
  const langBadge = movie.dubbed_lang || (movie.type ? movie.type.replace(/-/g, ' ') : null);

  // Format category name for subtitle row
  const formatCategory = (type) => {
    if (!type) return 'Movie';
    const lower = type.toLowerCase();
    if (lower === 'kolkata-bangla') return 'Kolkata';
    if (lower === 'bangladeshi') return 'Bangladeshi';
    if (lower === 'english') return 'Hollywood';
    if (lower === 'hindi') return 'Bollywood';
    return type.replace(/[-_]/g, ' ');
  };

  // Format part name for clean display
  const formatPart = (part) => {
    if (!part || part.toLowerCase() === 'single') return 'Full Movie';
    return part.replace(/[-_]/g, ' ');
  };

  // Subtitle check
  const hasSubtitle = Boolean(movie.subtitle_url && movie.subtitle_url.trim() && movie.subtitle_url !== 'null');

  return (
    <div className="group relative w-full h-full rounded-2xl overflow-hidden bg-slate-900/90 border border-slate-800/80 hover:border-pink-500/50 shadow-lg hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 hover:-translate-y-1.5 flex flex-col cursor-pointer">
      {/* Poster Image Container (Standard 2:3 Cinema Poster Aspect Ratio) */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
        <Image
          src={getGoogleDriveImageUrl(movie.poster)}
          alt={movie.title || "Movie Poster"}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Top Badges (Quality + Subtitle on Left, Language on Right) */}
        <div className="absolute top-2 inset-x-2 flex items-center justify-between gap-1 z-10 pointer-events-none">
          <div className="flex items-center gap-1">
            {/* Quality Badge */}
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md border border-white/10 text-amber-400 text-[10px] font-black uppercase tracking-wider shadow-sm">
              <MdHd className="text-xs" />
              <span>1080p</span>
            </span>

            {/* Subtitle Badge */}
            {hasSubtitle && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                <MdSubtitles className="text-xs" />
                <span>SUB</span>
              </span>
            )}
          </div>

          {/* Dubbed / Language Badge */}
          {langBadge && (
            <span className="px-2 py-0.5 rounded-md bg-pink-600/90 backdrop-blur-md text-white text-[10px] font-bold shadow-md shadow-pink-600/30 truncate max-w-[95px] border border-pink-400/30">
              {langBadge}
            </span>
          )}
        </div>

        {/* Ambient bottom gradient inside poster */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent z-10 pointer-events-none" />

        {/* Floating Poster Bottom Metadata (Year + File Size) */}
        <div className="absolute bottom-2 inset-x-2 flex items-center justify-between gap-1 z-10 pointer-events-none">
          {year ? (
            <span className="px-1.5 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md border border-slate-700/60 text-slate-200 text-[10px] font-semibold flex items-center gap-1 shadow-sm">
              <HiCalendar className="text-[11px] text-pink-400" />
              <span>{year}</span>
            </span>
          ) : <span />}

          {sizeStr && (
            <span className="px-1.5 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md border border-slate-700/60 text-cyan-300 text-[10px] font-medium flex items-center gap-1 shadow-sm">
              <HiOutlineFolder className="text-[11px] text-cyan-400" />
              <span>{sizeStr}</span>
            </span>
          )}
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 z-20">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-pink-500/50 transform scale-75 group-hover:scale-100 transition-all duration-300">
            <FaPlay className="text-sm pl-0.5 text-white" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-pink-200 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            Watch Now
          </span>
        </div>
      </div>

      {/* Movie Details Footer (Streamlined title & metadata row) */}
      <div className="p-3 flex flex-col justify-between flex-1 bg-slate-900/95 border-t border-slate-800/70">
        {/* Title: 2 lines with consistent min-height so cards align smoothly in any grid */}
        <h3
          className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-pink-400 transition-colors min-h-[2.5rem] sm:min-h-[2.75rem] flex items-start break-words"
          title={movie.title}
        >
          {movie.title || "Untitled Movie"}
        </h3>

        {/* Clean Secondary Metadata Row */}
        <div className="flex items-center justify-between gap-1.5 mt-2 pt-2 border-t border-slate-800/60 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium truncate min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />
            <span className="truncate capitalize text-slate-300 text-[11px] font-medium">
              {formatCategory(movie.type)}
            </span>
          </div>

          <span className="px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-300 text-[10px] font-medium border border-slate-700/50 shrink-0 truncate max-w-[85px] capitalize">
            {formatPart(movie.part_name)}
          </span>
        </div>
      </div>
    </div>
  );
}
