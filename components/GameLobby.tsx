
import React, { useState, useMemo } from 'react';
import { Game, GameId } from '../types';
import GameCard from './GameCard';
import { SearchIcon } from './icons';

interface GameLobbyProps {
    games: Game[];
    onSelectGame: (gameId: GameId) => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({ games, onSelectGame }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredGames = useMemo(() => {
        const lowerQuery = searchQuery.toLowerCase().trim();
        if (!lowerQuery) return games;
        
        return games.filter(game => 
            game.name.toLowerCase().includes(lowerQuery) || 
            game.description.toLowerCase().includes(lowerQuery)
        );
    }, [games, searchQuery]);

    return (
        <div className="text-center animate-fade-in w-full max-w-6xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-brand-accent mb-2">BoardBeacon</h1>
            <p className="text-lg text-brand-light mb-8">Select a game to challenge the AI</p>
            
            <div className="relative max-w-md mx-auto mb-12 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400 group-focus-within:text-brand-accent transition-colors duration-300" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-3 border border-brand-secondary rounded-full leading-5 bg-brand-secondary text-brand-light placeholder-gray-400 focus:outline-none focus:bg-brand-secondary/80 focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all duration-300 sm:text-sm shadow-md"
                    placeholder="Search games..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredGames.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {filteredGames.map((game, index) => (
                        <div key={game.id} className="animate-slide-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                            <GameCard game={game} onSelect={() => onSelectGame(game.id)} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 animate-fade-in bg-brand-secondary/30 rounded-lg border border-brand-secondary/50">
                    <p className="text-gray-400 text-lg mb-4">No games found matching "{searchQuery}"</p>
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="bg-brand-accent text-brand-primary font-bold py-2 px-6 rounded-md hover:bg-opacity-80 transition-colors duration-300"
                    >
                        Clear Search
                    </button>
                </div>
            )}
        </div>
    );
};

export default GameLobby;
