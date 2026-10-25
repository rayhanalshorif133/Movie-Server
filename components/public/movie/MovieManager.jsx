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
    const [movies, setMovies] = useState(Array.isArray(initialMovies) ? initialMovies : []);
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
        axios.get('/api/hitlogs?pagename=movies').catch(() => {});
    }, []);

    // Unified fetch with debounce for both search title and category
    useEffect(() => {
        let active = true;

        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            try {
                const queryTitle = encodeURIComponent(searchTitle.trim());
                const res = await fetch(`/api/movies?title=${queryTitle}&type=${searchType}`);
                const data = await res.json();

                if (active) {
                    setMovies(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                if (active) {
                    console.error("Failed to fetch movies:", err);
                    setMovies([]);
                }
            } finally {
                if (active) setLoading(false);
            }
        }, 350);

        return () => {
            active = false;
            clearTimeout(delayDebounceFn);
        };
    }, [searchTitle, searchType]);

    // Grouping Logic
    const safeMovies = Array.isArray(movies) ? movies : [];
    const groupedMovies = safeMovies.reduce((acc, movie) => {
        const type = movie.type || 'Other';
        if (!acc[type]) acc[type] = [];
        acc[type].push(movie);
        return acc;
    }, {});

    return (
        <>
            <MovieFilter 
                searchType={searchType} 
                setSearchType={setSearchType} 
                searchTitle={searchTitle}
                setSearchTitle={setSearchTitle} 
                totalResults={safeMovies.length}
                allCount={Array.isArray(initialMovies) ? initialMovies.length : 0}
            />
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
