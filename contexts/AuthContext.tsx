import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, GameId, TrophyCollection } from '../types';

export const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => {},
    logout: () => {},
    updateUserStats: () => {},
    isAuthModalOpen: false,
    setAuthModalOpen: () => {},
    updatePlayerName: () => {},
    deleteAccount: () => {},
    toggleSound: () => {},
});

const defaultUserStats = {
    'tic-tac-toe': { wins: 0, losses: 0, draws: 0, timePlayed: 0 },
    'memory-game': { wins: 0, losses: 0, draws: 0, timePlayed: 0 },
    'sudoku': { wins: 0, losses: 0, draws: 0, timePlayed: 0 },
    'chess': { wins: 0, losses: 0, draws: 0, timePlayed: 0 },
    'checkers': { wins: 0, losses: 0, draws: 0, timePlayed: 0 },
    'ludo': { wins: 0, losses: 0, draws: 0, timePlayed: 0 },
    'snake-and-ladder': { wins: 0, losses: 0, draws: 0, timePlayed: 0 },
};

const MOCK_TROPHIES: TrophyCollection = {
    gold: ["Week 24, 2024"],
    silver: ["Week 22, 2024", "Week 21, 2024"],
    bronze: ["Week 20, 2024"]
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('boardGameUser');
            if (storedUser) {
                const parsedUser: User = JSON.parse(storedUser);
                // Ensure all fields exist for users created before this update
                if (!parsedUser.playerName) parsedUser.playerName = parsedUser.email.split('@')[0];
                if (parsedUser.soundEnabled === undefined) parsedUser.soundEnabled = true;
                if (!parsedUser.trophies) parsedUser.trophies = { gold: [], silver: [], bronze: [] };
                setUser(parsedUser);
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('boardGameUser');
        }
    }, []);

    const login = (email: string) => {
        // Check if user already exists
        const storedUser = localStorage.getItem('boardGameUser');
        if (storedUser) {
           const parsedUser: User = JSON.parse(storedUser);
           if(parsedUser.email === email) {
                setUser(parsedUser);
                setAuthModalOpen(false);
                return;
           }
        }

        const newUser: User = {
            email,
            playerName: email.split('@')[0],
            soundEnabled: true,
            trophies: MOCK_TROPHIES, // Give new users some mock trophies for demo
            stats: defaultUserStats,
        };
        localStorage.setItem('boardGameUser', JSON.stringify(newUser));
        setUser(newUser);
        setAuthModalOpen(false);
    };

    const logout = () => {
        // We don't remove from localStorage, just "log out"
        setUser(null);
    };

    const deleteAccount = () => {
        if (!user) return;
        localStorage.removeItem('boardGameUser');
        setUser(null);
    }

    const updateUserStats = (gameId: GameId, result: 'win' | 'loss' | 'draw', timePlayed: number) => {
        if (!user) return;

        const updatedUser = { ...user, stats: { ...user.stats } };
        const gameStats = { ...updatedUser.stats[gameId] };

        if (result === 'win') gameStats.wins += 1;
        else if (result === 'loss') gameStats.losses += 1;
        else if (result === 'draw') gameStats.draws += 1;
        gameStats.timePlayed += timePlayed;
        
        updatedUser.stats[gameId] = gameStats;
        setUser(updatedUser);
        localStorage.setItem('boardGameUser', JSON.stringify(updatedUser));
    };

    const updatePlayerName = (newName: string) => {
        if (!user || !newName.trim()) return;
        const updatedUser = { ...user, playerName: newName.trim() };
        setUser(updatedUser);
        localStorage.setItem('boardGameUser', JSON.stringify(updatedUser));
    };

    const toggleSound = () => {
        if (!user) return;
        const updatedUser = { ...user, soundEnabled: !user.soundEnabled };
        setUser(updatedUser);
        localStorage.setItem('boardGameUser', JSON.stringify(updatedUser));
    };

    const value = {
        user,
        login,
        logout,
        updateUserStats,
        isAuthModalOpen,
        setAuthModalOpen,
        updatePlayerName,
        deleteAccount,
        toggleSound,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};