import { useState } from "react";
import GameCard from "./GameCard";
import GameModal from "./GameModal";


export default function GameSection({ type, items }) {
        const [selectedGame, setSelectedGame] = useState(null);
    
    return (
        <section className="space-y-6">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold capitalize text-white tracking-wide">
                    {type} Games
                </h2>
                <div className="h-0.5 flex-1 bg-linear-to-r from-blue-500 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map((game) => (
                    <GameCard key={game.id} game={game} onClick={(game) => setSelectedGame(game)} />
                ))}
            </div>

            {selectedGame && (
                <GameModal
                    game={selectedGame}
                    onClose={() => setSelectedGame(null)}
                />
            )}
        </section>
    );
}