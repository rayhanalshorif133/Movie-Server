"use client";
import { useState, useEffect } from "react";
import GameSection from "./GameSection";
import ScouringGames from "./SourchingGames";
import GameFilter from "./GameFilter";
import NoGameFound from "./NoGameFound";
import axios from "axios";

export default function GameManager({ initialGames, gameTypes }) {
    const [games, setGames] = useState(Array.isArray(initialGames) ? initialGames : []);
    const [searchTitle, setSearchTitle] = useState("");
    const [searchType, setSearchType] = useState("all");
    const [loading, setLoading] = useState(false);

    // Page hit log
    useEffect(() => {
        axios.get('/api/hitlogs?pagename=games').catch(err => console.error("Hitlog error:", err));
    }, []);

    // Fetch Games with Debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/games?title=${searchTitle}&type=${searchType}`);
                const data = await res.json();

            
                if (Array.isArray(data)) {
                    setGames(data);
                } else if (data && Array.isArray(data.games)) {
                    setGames(data.games);
                } else {
                    setGames([]); 
                }
            } catch (err) {
                console.error("Failed to fetch games:", err);
                setGames([]); 
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTitle, searchType]);

    const safeGames = Array.isArray(games) ? games : [];
    
    const groupedGames = safeGames.reduce((acc, game) => {
        const type = game.game_type || 'Other Assets';
        if (!acc[type]) acc[type] = [];
        acc[type].push(game);
        return acc;
    }, {});

    const hasGroups = Object.keys(groupedGames).length > 0;

    return (
        <>
            <GameFilter
                gameTypes={gameTypes}
                searchType={searchType}
                setSearchType={setSearchType}
                setSearchTitle={setSearchTitle}
            />

            <div className="space-y-12">
                {loading ? (
                    <ScouringGames />
                ) : hasGroups ? (
                    Object.entries(groupedGames).map(([type, items]) => (
                        <GameSection
                            key={type}
                            type={type}
                            items={items}
                        />
                    ))
                ) : (
                    <NoGameFound />
                )}
            </div>
        </>
    );
}