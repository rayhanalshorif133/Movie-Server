"use client";
import React from 'react';

export default function UploadDateBadge({ date }) {

  const [color, setColor] = React.useState();

  React.useEffect(() => {

    const colors = [
      "from-teal-600 to-green-600",
      "from-purple-600 to-blue-600",
      "from-orange-500 to-red-600",
      "from-pink-500 to-rose-600",
      "from-indigo-600 to-violet-700"
    ];

    const randomGradient = colors[Math.floor(Math.random() * colors.length)];
    setColor(randomGradient);

  }, []);



  return (
    <div title='Movie Uploaded Date' className={`bg-linear-to-r ${color} text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border-2 border-white w-fit`}>
      {date}
    </div>
  );
}