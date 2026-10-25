"use client";
import React from 'react';

const VARIATIONS = [
  { name: "Rose", style: "text-rose-600 border-rose-500/50 bg-rose-500/10 shadow-[0_0_8px_rgba(244,63,94,0.2)]" },
  { name: "Amber", style: "text-amber-600 border-amber-500/50 bg-amber-500/10 shadow-[0_0_8px_rgba(245,158,11,0.2)]" },
  { name: "Purple", style: "text-purple-600 border-purple-500/50 bg-purple-500/10 shadow-[0_0_8px_rgba(168,85,247,0.2)]" },
  { name: "Cyan", style: "text-cyan-600 border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_8px_rgba(6,182,212,0.2)]" },
  { name: "Emerald", style: "text-emerald-600 border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_8px_rgba(16,185,129,0.2)]" },
  { name: "Blue", style: "text-blue-600 border-blue-500/50 bg-blue-500/10 shadow-[0_0_8px_rgba(59,130,246,0.2)]" },
  { name: "Indigo", style: "text-indigo-600 border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_8px_rgba(99,102,241,0.2)]" },
  { name: "Pink", style: "text-pink-600 border-pink-500/50 bg-pink-500/10 shadow-[0_0_8px_rgba(236,72,153,0.2)]" },
];

export default function TypeBadge({ type }) {
  const getStyleForType = (text) => {
    if (!text) return VARIATIONS[0].style;
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % VARIATIONS.length;
    return VARIATIONS[index].style;
  };

  const currentStyle = getStyleForType(type);

  return (
    <div className={`
      group relative inline-flex items-center justify-center 
      px-2 py-0.5 text-[9px] font-bold uppercase tracking-tight
      border-l-[1.5px] rounded-r-sm transition-all duration-300
      hover:pl-3 cursor-default overflow-hidden
      ${currentStyle}
    `}>
      <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></span>

      {/* Decorative Left Line */}
      <span className="absolute left-0 top-0 h-full w-px bg-current opacity-40"></span>

      {/* Content */}
      <span className="relative z-10 flex items-center gap-1">
        {type}
      </span>

      <style jsx>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}