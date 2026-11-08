import { getGoogleDriveImageUrl, getGoogleDrivePreviewUrl, getGoogleDriveFileUrl, googleDriveToDownload } from "@/utils/google/manage";
import Image from "next/image";
import { useState } from "react";
import { RxCross2, RxArrowLeft, RxDownload, RxShare1 } from "react-icons/rx";
import axios from "axios";
import Swal from "sweetalert2";

export default function MovieDetailsModal({ movie, onClose }) {
    const [isPreviewing, setIsPreviewing] = useState(false);

    const handleClose = () => {
        // Clean URL parameters when closing modal
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('id');
            url.searchParams.delete('s');
            const cleanQuery = url.searchParams.toString();
            window.history.replaceState(null, '', url.pathname + (cleanQuery ? `?${cleanQuery}` : ''));
        }
        onClose();
    };

    const handleShare = async () => {
        if (!movie) return;
        document.title = movie.title || "Movie";

        // Construct direct movie URL using current origin and path
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const pathname = typeof window !== 'undefined' && window.location.pathname.startsWith('/movies') ? '/movies' : '';
        
        let directUrl = `${origin}${pathname}/?id=${movie.id}`;
        if (movie.share_data) {
            directUrl = `${origin}${pathname}/?id=${movie.id}&s=${movie.share_data}`;
        }

        // Copy directly to user clipboard immediately
        let copied = false;
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(directUrl);
                copied = true;
            } catch (clipErr) {
                console.warn("Direct clipboard write failed, trying fallback:", clipErr);
            }
        }

        if (!copied && typeof document !== 'undefined') {
            try {
                const textArea = document.createElement("textarea");
                textArea.value = directUrl;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                copied = document.execCommand("copy");
                document.body.removeChild(textArea);
            } catch (err) {
                console.error("Fallback copy failed:", err);
            }
        }

        // Update URL bar in browser
        if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', directUrl);
        }

        // Visual feedback confirming direct link copy
        Swal.fire({
            title: "Movie Link Copied! 🎬",
            html: `
                <div class="text-left space-y-2 mt-2">
                    <p class="text-sm text-gray-300">Direct link for <b class="text-pink-400">"${movie.title}"</b> has been copied to your clipboard:</p>
                    <div class="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 break-all select-all">
                        ${directUrl}
                    </div>
                    <p class="text-[11px] text-gray-400">Opening this link will display this movie directly.</p>
                </div>
            `,
            icon: "success",
            background: "#0f172a",
            color: "#f8fafc",
            confirmButtonColor: "#ec4899",
            confirmButtonText: "OK",
            timer: 3500,
            timerProgressBar: true
        });

        // Background sync to ensure token is populated on database
        axios.post('/api/movies/share', { movieId: movie.id }).catch(() => {});
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="relative bg-slate-900 border border-white/10 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className={`absolute cursor-pointer top-4 ${isPreviewing ? 'right-15' : 'right-4'} z-20 bg-black/50 hover:bg-red-500 text-white p-2 rounded-full transition hover:rotate-90`}
                >
                    <RxCross2 />
                </button>

                {isPreviewing && (
                    <button
                        onClick={() => setIsPreviewing(false)}
                        className="absolute cursor-pointer top-4 left-4 z-20 hover:bg-red-700 text-white px-3 py-1.5 rounded-sm flex items-center gap-2 text-sm transition"
                    >
                        <RxArrowLeft />
                    </button>
                )}

                <div className="flex flex-col md:flex-row h-auto sm:min-h-100">
                    {!isPreviewing ? (
                        <>
                            <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                                <a href={getGoogleDriveFileUrl(movie.poster)} target="_blank" rel="noopener noreferrer" title="Open poster in Google Drive" className="block relative aspect-2/3 w-full cursor-pointer hover:opacity-90 transition">
                                    <Image
                                        src={getGoogleDriveImageUrl(movie.poster)}
                                        alt={movie.title || "Movie Poster"}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                                        className="object-cover rounded-lg"
                                        priority={true}
                                    />
                                </a>
                            </div>
                            <div className="p-8 md:w-1/2 flex flex-col justify-center">
                                <h2 className="text-3xl font-bold text-white">{movie.title}</h2>
                                <div className="flex gap-3 mt-3">
                                    <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded border border-blue-500/30">
                                        {movie.dubbed_lang || 'English'}
                                    </span>
                                    <span className="bg-slate-700 text-gray-300 text-xs px-2 py-1 rounded">
                                        {movie.size} MB
                                    </span>
                                </div>

                                <p className="text-gray-400 mt-6 text-sm leading-relaxed">
                                    You are about to watch <b>{movie.title}</b>. This movie is categorized as {movie.type}.
                                    Make sure you have a stable internet connection for the best experience.
                                </p>

                                {/* Button Group */}
                                <div className="mt-8 flex flex-col gap-3">
                                    {/* Watch Now Button */}
                                    <button
                                        onClick={() => setIsPreviewing(true)}
                                        className="relative cursor-pointer group w-full h-16 overflow-hidden rounded-xl p-0.5 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                                    >
                                        <div className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#e11d48_0%,#ec4899_50%,#e11d48_100%)] group-hover:opacity-100 opacity-60 transition-opacity"></div>
                                        <div className="relative flex h-full w-full items-center justify-center gap-3 rounded-[10px] bg-slate-900 px-7 py-2 text-white transition-all duration-300 group-hover:bg-slate-900/80 backdrop-blur-xl">
                                            <span className="text-sm font-bold tracking-widest uppercase">Watch Now</span>
                                        </div>
                                    </button>

                                    {/* Download Now Button */}
                                    <button
                                        onClick={() => googleDriveToDownload(movie.url)}
                                        className="relative cursor-pointer group w-full h-16 overflow-hidden rounded-xl p-0.5 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                                    >
                                        <div className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3b82f6_0%,#a855f7_50%,#3b82f6_100%)] group-hover:opacity-100 opacity-40 transition-opacity"></div>
                                        <div className="relative flex h-full w-full items-center justify-center gap-3 rounded-[10px] bg-slate-900 px-7 py-2 text-white transition-all duration-300 group-hover:bg-slate-900/80 backdrop-blur-xl">
                                            <span className="text-sm font-bold tracking-widest uppercase flex"><RxDownload className="text-lg mx-2" /> Download Now</span>
                                        </div>
                                    </button>

                                    {/* Share Button */}
                                    <button
                                        onClick={handleShare}
                                        className="relative cursor-pointer group w-full h-16 overflow-hidden rounded-xl p-0.5 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                                    >
                                        <div className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3b82f6_0%,#a855f7_50%,#3b82f6_100%)] group-hover:opacity-100 opacity-40 transition-opacity"></div>
                                        <div className="relative flex h-full w-full items-center justify-center gap-3 rounded-[10px] bg-slate-900 px-7 py-2 text-white transition-all duration-300 group-hover:bg-slate-900/80 backdrop-blur-xl">
                                            <span className="text-sm font-bold tracking-widest uppercase flex"><RxShare1 className="text-lg mx-2" /> Share Movie (Copy Link)</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full aspect-video md:aspect-auto md:h-125 bg-black overflow-hidden">
                            <iframe
                                src={getGoogleDrivePreviewUrl(movie.url)}
                                className="w-full h-full border-none"
                                allow="autoplay"
                                allowFullScreen
                            ></iframe>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
