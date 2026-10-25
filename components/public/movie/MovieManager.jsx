"use client";
import { useState, useEffect, Suspense } from "react";
import MovieSection from "./MovieSection";
import ScouringMovies from "./ScouringMovies";
import NoMovieFound from "./NoMovieFound";
import MovieFilter from "./MovieFilter";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import MovieDetailsModal from "./MovieDetailsModal";

function MovieManagerContent({ initialMovies }) {
    const [movies, setMovies] = useState(initialMovies);
    const [searchTitle, setSearchTitle] = useState("");
    const [searchType, setSearchType] = useState("all");
    const [loading, setLoading] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        const shareToken = searchParams.get('s');
        if (shareToken) {
            const fetchSharedMovie = async () => {
                try {
                    const res = await axios.get(`/api/movies/share?s=${shareToken}`);
                    if (res.data) {
                        setSelectedMovie(res.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch shared movie:", err);
                }
            };
            fetchSharedMovie();
        }
    }, [searchParams]);

    useEffect(() => {
        axios.get('/api/hitlogs?pagename=movies');
    }, [])

    useEffect(() => {
        if (!searchTitle.trim()) {
            setMovies(initialMovies);
            setLoading(false);
            return;
        }

        let active = true;

        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/movies?title=${encodeURIComponent(searchTitle)}&type=${searchType}`);
                const data = await res.json();

                if (active) {
                    setMovies(data);
                }
            } catch (err) {
                if (active) console.error("Failed to fetch", err);
            } finally {
                if (active) setLoading(false);
            }
        }, 500);

        return () => {
            active = false; // "Cancel" this request if the user types again
            clearTimeout(delayDebounceFn);
        };
    }, [searchTitle]);

    useEffect(() => {

        let active = true; // Flag to prevent race conditions

        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/movies?title=${encodeURIComponent(searchTitle)}&type=${searchType}`);
                const data = await res.json();

                // 2. Only update state if this effect is still "active"
                if (active) {
                    setMovies(data);
                }
            } catch (err) {
                if (active) console.error("Failed to fetch", err);
            } finally {
                if (active) setLoading(false);
            }
        }, 500);

        return () => {
            active = false; // "Cancel" this request if the user types again
            clearTimeout(delayDebounceFn);
        };
    }, [searchType]);




    // Grouping Logic
    const groupedMovies = movies?.reduce((acc, movie) => {
        const type = movie.type || 'Other';
        if (!acc[type]) acc[type] = [];
        acc[type].push(movie);
        return acc;
    }, {});

    return (
        <>
            <MovieFilter searchType={searchType} setSearchType={setSearchType} setSearchTitle={setSearchTitle} />
            <div className="space-y-12">
                {loading ? <ScouringMovies /> : Object.keys(groupedMovies || {}).length > 0 ? (
                    Object.entries(groupedMovies).map(([type, items]) => (
                        <MovieSection 
                            key={type} 
                            type={type} 
                            items={items} 
                            onMovieSelect={setSelectedMovie} 
                        />
                    ))
                ) : <NoMovieFound />}
            </div>

            {selectedMovie && (
                <MovieDetailsModal
                    movie={selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                />
            )}
        </>
    );
}

export default function MovieManager(props) {
    return (
        <Suspense fallback={<ScouringMovies />}>
            <MovieManagerContent {...props} />
        </Suspense>
    );
}