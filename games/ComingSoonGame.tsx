
import React from 'react';
import { GameComponentProps } from '../types';

const ComingSoonGame: React.FC<GameComponentProps> = ({ onBackToLobby, gameName }) => {
    return (
        <div className="w-full max-w-md mx-auto bg-brand-secondary p-8 rounded-lg shadow-2xl animate-fade-in text-center">
            <h2 className="text-3xl font-bold text-brand-accent mb-4">{gameName}</h2>
            <p className="text-brand-light text-lg mb-8">This game is under construction. Please check back later!</p>
            <button
                onClick={onBackToLobby}
                className="bg-brand-accent text-brand-primary font-bold py-2 px-6 rounded-md hover:bg-opacity-80 transition-colors duration-300"
            >
                Back to Lobby
            </button>
        </div>
    );
};

export default ComingSoonGame;
