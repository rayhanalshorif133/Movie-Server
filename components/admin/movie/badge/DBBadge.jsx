import React, { useEffect, useState } from 'react';

export default function DBBadge({ sourceGmailName, movieSize }) {

    const [color, setColor] = useState(null);

    const colors = [
        "from-teal-600 to-green-600",
        "from-purple-600 to-blue-600",
        "from-orange-500 to-red-600",
        "from-pink-500 to-rose-600",
        "from-indigo-600 to-violet-700"
    ];


    useEffect(() => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        setColor(randomColor);
    }, []);

    return (
        <div className="flex justify-left items-left">
            <div className="relative inline-flex items-center bg-white border border-gray-200 shadow-sm pl-4 pr-10 py-3 rounded-2xl group hover:shadow-md transition-all duration-300">



                <div className={`absolute -top-3 -right-2 bg-linear-to-r ${color} text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border-2 border-white`}>
                    {movieSize} MB
                </div>

                <div className="w-5 h-5 bg-red-50 rounded-full flex items-center justify-center mr-3 border border-red-100 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>

                <div className="flex flex-col">
                    <span className="text-gray-800 font-bold text-sm lowercase">
                        {sourceGmailName}
                    </span>

                </div>
            </div>
        </div>
    );
}