import React from 'react';
import { Game } from '../types';

interface GameCardProps {
    game: Game;
    onSelect: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onSelect }) => {
    return (
        <div
            onClick={onSelect}
            className={`
                bg-brand-secondary rounded-lg p-6 h-full flex flex-col items-center text-center
                shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2
                border border-transparent hover:border-brand-accent
                group ${game.isComingSoon ? 'opacity-50 cursor-not-allowed hover:-translate-y-0 hover:border-transparent' : 'cursor-pointer'}
            `}
        >
            <div className="mb-4 text-brand-accent">
                <game.icon className="h-16 w-16 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="text-xl font-bold text-brand-light mb-2">{game.name}</h3>
            <p className="text-gray-400 text-sm flex-grow">{game.description}</p>
             {game.isComingSoon && <div className="text-xs font-semibold text-brand-primary bg-brand-accent/50 rounded-full px-3 py-1 mt-4">COMING SOON</div>}
        </div>
    );
};

export default GameCard;