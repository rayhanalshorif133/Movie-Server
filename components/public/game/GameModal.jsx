"use client";
import React, { useState } from "react";
import { RxCross2, RxDownload } from "react-icons/rx";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { getGoogleDriveImageUrl, googleDriveToDownload } from "@/utils/google/manage";

export default function GameModal({ game, onClose }) {
    const images = JSON.parse(game.asset_images || "[]");
    const gifs = JSON.parse(game.asset_gif_images || "[]");
    const isGifHiddenBar =  game.hidden_bar_gif || false;
    const allMedia = [...images, ...gifs];
    const [isSelectedGif, setIsSelectedGif] = useState(false);

    const [selectedIndex, setSelectedIndex] = useState(null);


    const closeLightbox = () => setSelectedIndex(null);

    const updateIndex = (newIndex) => {
        setSelectedIndex(newIndex);
        const isGif = gifs.includes(allMedia[newIndex]);
        setIsSelectedGif(isGif);

    };

    const initialSetIndex = (index) => updateIndex(index);

    const nextImage = () => {
        const nextIdx = (selectedIndex + 1) % allMedia.length;
        updateIndex(nextIdx);
    };

    const prevImage = () => {
        const prevIdx = selectedIndex === 0 ? allMedia.length - 1 : selectedIndex - 1;
        updateIndex(prevIdx);
    };




    return (
        <>
            {/* Main Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                <div className="relative bg-gray-900 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-800 shadow-2xl">

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-red-500"
                    >
                        <RxCross2 />
                    </button>

                    <div className="p-6 md:p-10">
                        <div className="flex justify-between w-full">
                            <h2 className="text-3xl font-bold text-white mb-6 uppercase">
                                {game.title}
                            </h2>

                            <button
                                onClick={() => { googleDriveToDownload(game.url) }}
                                className="relative  cursor-pointer group h-10 w-fit overflow-hidden rounded-xl p-0.5 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.3)] mr-10"
                            >
                                <div className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3b82f6_0%,#a855f7_50%,#3b82f6_100%)] group-hover:opacity-100 opacity-40 transition-opacity"></div>
                                <div className="relative flex h-full w-full items-center justify-center gap-3 rounded-[10px] bg-slate-900 px-7 py-2 text-white transition-all duration-300 group-hover:bg-slate-900/80 backdrop-blur-xl">
                                    <span className="text-sm font-bold tracking-widest uppercase flex"><RxDownload className="text-md mx-2" /> Download Now</span>
                                </div>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {allMedia.map((mediaId, index) => {

                                const isGif = gifs.includes(mediaId);

                                return (
                                    <div
                                        key={index}
                                        onClick={() => initialSetIndex(index)}
                                        className="relative cursor-pointer group aspect-video rounded-xl overflow-hidden bg-gray-800"
                                    >
                                        <img
                                            src={getGoogleDriveImageUrl(mediaId)}
                                            alt=""
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-105 transition"
                                        />

                                        {isGif && (
                                            <>
                                                <div className="absolute bottom-2 right-2 bg-yellow-500 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black text-white uppercase tracking-wider border border-white/20 z-10">
                                                    GIF 
                                                </div>
                                                { isGifHiddenBar && <div className="absolute bottom-0 h-10 w-full gif-hide-placeholder"></div> }
                                                
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {selectedIndex !== null && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/95">

                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 bg-red-400 text-black rounded-full hover:bg-red-500 right-6 hover:text-white text-3xl cursor-pointer"
                    >
                        <RxCross2 className="p-1" />
                    </button>

                    {/* Prev */}
                    <button
                        onClick={prevImage}
                        className="absolute left-6 hover:text-white text-3xl bg-teal-400 text-black rounded-full hover:bg-teal-700 cursor-pointer z-50"
                    >
                        <FaChevronLeft className="p-2" />
                    </button>

                    <div className="relative">
                        <img
                            src={getGoogleDriveImageUrl(allMedia[selectedIndex])}
                            className="max-h-[85vh] max-w-[90vw] object-contain"
                            alt=""
                        />

                        <div className={`absolute bottom-0 h-[20%]  w-full gif-hide-placeholder ${isSelectedGif ? 'opacity-100' : 'opacity-0'}`}></div>

                    </div>


                    {/* Next */}
                    <button
                        onClick={nextImage}
                        className="absolute right-6 hover:text-white text-3xl bg-teal-400 text-black rounded-full hover:bg-teal-700 cursor-pointer"
                    >
                        <FaChevronRight className="p-2" />
                    </button>
                </div>
            )}
        </>
    );
}
