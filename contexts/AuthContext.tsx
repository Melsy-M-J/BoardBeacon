import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, GameId, TrophyCollection, GameHistoryEntry } from '../types';

export const AuthContext = createContext<AuthContextType>({
    user: null,
    allUsers: [],
    login: () => false,
    logout: () => {},
    updateUserStats: () => {},
    isAuthModalOpen: false,
    setAuthModalOpen: () => {},
    updatePlayerName: () => {},
    deleteAccount: () => {},
    toggleSound: () => {},
    saveGame: () => {},
    clearSavedGame: () => {},
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

const DB_KEY = 'boardGameUsers';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);

    useEffect(() => {
        try {
            const db = localStorage.getItem(DB_KEY);
            const users = db ? JSON.parse(db) : [];
            setAllUsers(users);

            // Check for a logged-in session using localStorage for persistence
            const sessionUserEmail = localStorage.getItem('loggedInUser');
            if(sessionUserEmail) {
                const sessionUser = users.find((u: User) => u.email === sessionUserEmail);
                if (sessionUser) {
                    // Ensure all fields exist for users created before this update
                    if (!sessionUser.playerName) sessionUser.playerName = sessionUser.email.split('@')[0];
                    if (sessionUser.soundEnabled === undefined) sessionUser.soundEnabled = true;
                    if (!sessionUser.trophies) sessionUser.trophies = { gold: [], silver: [], bronze: [] };
                    if (!sessionUser.savedGames) sessionUser.savedGames = {};
                    if (!sessionUser.gameHistory) sessionUser.gameHistory = [];
                    setUser(sessionUser);
                }
            }
        } catch (error) {
            console.error("Failed to parse users from localStorage", error);
            localStorage.removeItem(DB_KEY);
        }
    }, []);

    const updateDb = (updatedUsers: User[]) => {
        localStorage.setItem(DB_KEY, JSON.stringify(updatedUsers));
        setAllUsers(updatedUsers);
    }

    const login = (email: string, password: string): boolean => {
        if (!email || !password) {
            return false;
        }

        const existingUser: User | undefined = allUsers.find(u => u.email === email);

        if (existingUser) {
            // Login for existing user
            if (existingUser.password === password) {
                setUser(existingUser);
                localStorage.setItem('loggedInUser', email);
                setAuthModalOpen(false);
                return true;
            } else {
                // Incorrect password
                return false;
            }
        } else {
            // Sign up for new user
            const newUser: User = {
                email,
                password,
                playerName: email.split('@')[0],
                soundEnabled: true,
                trophies: MOCK_TROPHIES, // Give new users some mock trophies for demo
                stats: defaultUserStats,
                savedGames: {},
                gameHistory: [],
            };
            const updatedUsers = [...allUsers, newUser];
            updateDb(updatedUsers);
        
            setUser(newUser);
            localStorage.setItem('loggedInUser', email);
            setAuthModalOpen(false);
            return true;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('loggedInUser');
    };

    const deleteAccount = () => {
        if (!user) return;
        const updatedUsers = allUsers.filter(u => u.email !== user.email);
        updateDb(updatedUsers);
        logout();
    }
    
    const updateUserInDb = (updatedUser: User) => {
        const updatedUsers = allUsers.map(u => u.email === updatedUser.email ? updatedUser : u);
        updateDb(updatedUsers);
        setUser(updatedUser);
    }

    const updateUserStats = (gameId: GameId, result: 'win' | 'loss' | 'draw', timePlayed: number) => {
        if (!user) return;

        const updatedUser = { ...user, stats: { ...user.stats }, gameHistory: [...user.gameHistory] };
        const gameStats = { ...updatedUser.stats[gameId] };

        if (result === 'win') gameStats.wins += 1;
        else if (result === 'loss') gameStats.losses += 1;
        else if (result === 'draw') gameStats.draws += 1;
        gameStats.timePlayed += timePlayed;
        
        updatedUser.stats[gameId] = gameStats;
        
        const historyEntry: GameHistoryEntry = { gameId, result, timePlayed, date: new Date().toISOString() };
        updatedUser.gameHistory.push(historyEntry);

        if (updatedUser.savedGames?.[gameId]) {
            delete updatedUser.savedGames[gameId];
        }
        
        updateUserInDb(updatedUser);
    };

    const updatePlayerName = (newName: string) => {
        if (!user || !newName.trim()) return;
        const updatedUser = { ...user, playerName: newName.trim() };
        updateUserInDb(updatedUser);
    };

    const toggleSound = () => {
        if (!user) return;
        const updatedUser = { ...user, soundEnabled: !user.soundEnabled };
        updateUserInDb(updatedUser);
    };
    
    const saveGame = (gameId: GameId, gameState: string) => {
        if (!user) return;
        const updatedUser = { 
            ...user, 
            savedGames: { ...user.savedGames, [gameId]: gameState }
        };
        updateUserInDb(updatedUser);
    };

    const clearSavedGame = (gameId: GameId) => {
        if (!user || !user.savedGames?.[gameId]) return;
        const updatedUser = { ...user };
        delete updatedUser.savedGames[gameId];
        updateUserInDb(updatedUser);
    };

    const value = {
        user,
        allUsers,
        login,
        logout,
        updateUserStats,
        isAuthModalOpen,
        setAuthModalOpen,
        updatePlayerName,
        deleteAccount,
        toggleSound,
        saveGame,
        clearSavedGame,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};