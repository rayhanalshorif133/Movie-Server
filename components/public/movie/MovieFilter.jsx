import React, { useState, useEffect, Suspense } from 'react'
import { IoSearch } from "react-icons/io5";
import MovieFilterLoading from './MovieFilterLoading';

export default function MovieFilter({ searchType, setSearchType, setSearchTitle }) {
    const [movies, setMovies] = useState();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/movies/type`);
                const data = await res.json();
                setMovies(data);
            } catch (err) {
                console.error("Failed to fetch", err);
            } finally {
                setLoading(false);
            }
        }, 500);


        return () => clearTimeout(delayDebounceFn);
    }, [1]);
    return (
        <div className="pt-2 pb-8 px-4 flex flex-col items-center shadow-inner">
            <div
                className="movie_filter flex flex-wrap justify-center gap-4 md:gap-6 mb-5 text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest">

                {loading ? (
                    <MovieFilterLoading />
                ) : (
                    <div className="flex gap-4"> {/* Added a container for layout */}
                        <button
                            className={`text-xs cursor-pointer pb-0.5 uppercase transition hover:text-pink-500 
            ${searchType === 'all' ? 'text-pink-500 border-b border-pink-500' : 'text-gray-500 border-none'}`}
                            onClick={() => setSearchType('all')}
                        >
                            All
                        </button>

                        {movies?.map((type, index) => (
                            <button
                                key={index}
                                onClick={() => setSearchType(type)}
                                className={`text-xs cursor-pointer pb-0.5 uppercase transition hover:text-pink-500 
                                ${searchType === type ? 'text-pink-500 border-b border-pink-500' : 'text-gray-500 border-none'}`}
                            >
                                {type.replace(/-/g, ' ')}
                            </button>
                        ))}

                        {/* <button
                            className={`text-xs cursor-pointer pb-0.5 uppercase transition hover:text-pink-500 
            ${searchType === 'series' ? 'text-pink-500 border-b border-pink-500' : 'text-gray-500 border-none'}`}
                            onClick={() => setSearchType('series')}
                        >
                            Series
                        </button> */}
                    </div>
                )}


            </div>
            <div className="relative w-full max-w-lg group">
                <div
                    className="absolute -inset-0.5 bg-linear-to-r from-pink-600 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-75 transition duration-500">
                </div>
                <div className="relative flex items-center">
                    <input type="text" onChange={(e) => setSearchTitle(e.target.value)} placeholder="Search for movies ..."
                        className="movie-search-input w-full bg-[#1e293b] text-gray-200 placeholder-gray-500 rounded-full py-2.5 px-5 border border-gray-700 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 shadow-xl text-sm transition-all" />
                    <button
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-pink-600 hover:bg-pink-700 text-white h-10 w-10 rounded-full transition">
                        <IoSearch className='flex justify-items-center mx-auto' />
                    </button>
                </div>
            </div>
        </div>
    )
}
