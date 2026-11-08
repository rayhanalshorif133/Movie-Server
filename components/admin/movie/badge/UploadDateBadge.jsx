"use client";
import React from 'react';

const colors = [
  "from-teal-600 to-green-600",
  "from-purple-600 to-blue-600",
  "from-orange-500 to-red-600",
  "from-pink-500 to-rose-600",
  "from-indigo-600 to-violet-700"
];

function getColor(text) {
  if (!text) return colors[0];
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function UploadDateBadge({ date }) {
  const color = getColor(date);

  return (
    <div title='Movie Uploaded Date' className={`bg-linear-to-r ${color} text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border-2 border-white w-fit`}>
      {date}
    </div>
  );
}