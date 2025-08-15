
import React from 'react';
import { Game, GameId } from '../types';
import GameCard from './GameCard';

interface GameLobbyProps {
    games: Game[];
    onSelectGame: (gameId: GameId) => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({ games, onSelectGame }) => {
    return (
        <div className="text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-bold text-brand-accent mb-2">AI Board Game Arena</h1>
            <p className="text-lg text-brand-light mb-8 sm:mb-12">Select a game to challenge the AI</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {games.map((game, index) => (
                    <div key={game.id} className="animate-slide-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                        <GameCard game={game} onSelect={() => onSelectGame(game.id)} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameLobby;
