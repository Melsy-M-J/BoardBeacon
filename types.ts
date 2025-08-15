import React from 'react';

export type GameId = 'tic-tac-toe' | 'memory-game' | 'chess' | 'checkers' | 'ludo' | 'snake-and-ladder' | 'sudoku';

export interface Game {
    id: GameId;
    name: string;
    description: string;
    component: React.FC<GameComponentProps>;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    isComingSoon?: boolean;
}

export interface GameComponentProps {
    onBackToLobby: () => void;
    gameName: string;
}

export interface GameStats {
    wins: number;
    losses: number;
    draws: number;
    timePlayed: number; // in seconds
}

export interface TrophyCollection {
    gold: string[];
    silver: string[];
    bronze: string[];
}

export interface User {
    email: string;
    playerName: string;
    soundEnabled: boolean;
    trophies: TrophyCollection;
    stats: Record<GameId, GameStats>;
}

export interface AuthContextType {
    user: User | null;
    login: (email: string) => void;
    logout: () => void;
    updateUserStats: (gameId: GameId, result: 'win' | 'loss' | 'draw', timePlayed: number) => void;
    isAuthModalOpen: boolean;
    setAuthModalOpen: (isOpen: boolean) => void;
    updatePlayerName: (newName: string) => void;
    deleteAccount: () => void;
    toggleSound: () => void;
}

export interface AudioContextType {
    playLobbyMusic: () => void;
    playGameMusic: () => void;
    stopMusic: () => void;
    userHasInteracted: boolean;
    setUserHasInteracted: (interacted: boolean) => void;
}