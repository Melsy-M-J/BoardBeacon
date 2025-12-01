import React, { useContext, useState, FormEvent, KeyboardEvent } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { GameId, GameStats, GameHistoryEntry } from '../types';
import { GoldTrophyIcon, SilverTrophyIcon, BronzeTrophyIcon, EditIcon, ChessIcon, TicTacToeIcon, MemoryGameIcon, SudokuIcon, CheckersIcon, LudoIcon, SnakeAndLadderIcon } from './icons';

interface ProfilePageProps {
    onBack: () => void;
    onDeleteRequest: () => void;
}

const GAME_ICONS: Record<GameId, React.FC<React.SVGProps<SVGSVGElement>>> = {
    'chess': ChessIcon,
    'tic-tac-toe': TicTacToeIcon,
    'memory-game': MemoryGameIcon,
    'sudoku': SudokuIcon,
    'checkers': CheckersIcon,
    'ludo': LudoIcon,
    'snake-and-ladder': SnakeAndLadderIcon,
};

const getGameName = (gameId: GameId) => gameId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
};

const TrophyDisplay = ({ type, dates }: { type: 'gold' | 'silver' | 'bronze', dates: string[] }) => {
    if (dates.length === 0) return null;
    const Icon = { gold: GoldTrophyIcon, silver: SilverTrophyIcon, bronze: BronzeTrophyIcon }[type];
    return (
        <div className="relative group">
            <div className="flex items-center gap-2 bg-brand-secondary/50 p-2 rounded-md">
                <Icon className="w-8 h-8" />
                <span className="font-bold text-brand-light text-xl">x {dates.length}</span>
            </div>
            <div className="absolute bottom-full mb-2 w-max max-w-xs bg-brand-primary text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none animate-pop-in z-10 shadow-lg">
                <h4 className="font-bold capitalize border-b border-brand-secondary pb-1 mb-1">{type} Trophies</h4>
                <ul className="list-disc list-inside">
                    {dates.map(date => <li key={date}>Won: {date}</li>)}
                </ul>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-2 h-2 bg-brand-primary rotate-45"></div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ gameId: GameId, stats: GameStats }> = ({ gameId, stats }) => {
    const totalGames = stats.wins + stats.losses + stats.draws;
    const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;
    const Icon = GAME_ICONS[gameId];
    
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (winRate / 100) * circumference;

    return (
        <div className="bg-brand-secondary rounded-lg p-4 flex flex-col items-center text-center">
            <Icon className="w-10 h-10 text-brand-accent mb-2" />
            <h4 className="text-lg font-bold text-brand-light mb-3">{getGameName(gameId)}</h4>
            <div className="relative w-32 h-32 mb-3">
                <svg className="w-full h-full" viewBox="0 0 120 120">
                    <circle className="text-brand-primary" strokeWidth="8" stroke="currentColor" fill="transparent" r={radius} cx="60" cy="60" />
                    <circle 
                        className="text-brand-accent" 
                        strokeWidth="8" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={offset} 
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r={radius} 
                        cx="60" 
                        cy="60" 
                        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-brand-accent">{winRate}%</span>
                    <span className="text-xs text-gray-400">Win Rate</span>
                </div>
            </div>
            <div className="text-sm text-brand-light space-y-1">
                <p><strong>Wins:</strong> {stats.wins}</p>
                <p><strong>Losses:</strong> {stats.losses}</p>
                <p><strong>Draws:</strong> {stats.draws}</p>
                <p><strong>Time Played:</strong> {formatTime(stats.timePlayed)}</p>
            </div>
        </div>
    );
};

const HistoryRow: React.FC<{ entry: GameHistoryEntry }> = ({ entry }) => {
    const Icon = GAME_ICONS[entry.gameId];
    const resultColor = entry.result === 'win' ? 'text-green-400' : entry.result === 'loss' ? 'text-red-400' : 'text-gray-400';

    return (
        <tr className="border-b border-brand-secondary/50 hover:bg-brand-secondary/30">
            <td className="p-3 text-sm text-brand-light flex items-center gap-2">
                <Icon className="w-5 h-5 text-brand-accent" />
                {getGameName(entry.gameId)}
            </td>
            <td className={`p-3 text-sm font-semibold capitalize ${resultColor}`}>{entry.result}</td>
            <td className="p-3 text-sm text-gray-300">{formatTime(entry.timePlayed)}</td>
            <td className="p-3 text-sm text-gray-400">{new Date(entry.date).toLocaleString()}</td>
        </tr>
    );
};


const ProfilePage: React.FC<ProfilePageProps> = ({ onBack, onDeleteRequest }) => {
    const { user, updatePlayerName, toggleSound } = useContext(AuthContext);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(user?.playerName || '');
    const [showSavedNotification, setShowSavedNotification] = useState(false);

    if (!user) {
        return (
            <div className="text-center animate-fade-in">
                <h2 className="text-2xl text-brand-light mb-4">Please log in to view your profile.</h2>
                <button onClick={onBack} className="bg-brand-accent text-brand-primary font-bold py-2 px-6 rounded-md hover:bg-opacity-80 transition-colors duration-300">
                    Back to Lobby
                </button>
            </div>
        );
    }
    
    const handleNameSubmit = (e: FormEvent) => {
        e.preventDefault();
        if(newName.trim() && newName.trim() !== user.playerName) {
            updatePlayerName(newName);
            setShowSavedNotification(true);
            setTimeout(() => setShowSavedNotification(false), 2000);
        }
        setIsEditingName(false);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setNewName(user.playerName);
            setIsEditingName(false);
        }
    };
    
    const playedGames = Object.entries(user.stats).filter(([, stats]: [string, GameStats]) => stats.wins + stats.losses + stats.draws > 0);
    const sortedHistory = [...user.gameHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="w-full max-w-6xl mx-auto bg-brand-primary p-6 sm:p-8 rounded-lg shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b border-brand-secondary pb-4">
                <div>
                    <h2 className="text-3xl font-bold text-brand-light">Player Profile</h2>
                    <p className="text-gray-400">{user.email}</p>
                </div>
                <button onClick={onBack} className="text-sm text-brand-accent hover:underline">Back to Lobby</button>
            </div>

            {/* Top Section */}
            <div className="mb-8 p-4 bg-brand-secondary rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <h3 className="text-xl font-semibold text-brand-accent mb-3">Player Details</h3>
                        <div className="flex items-center gap-4">
                            <label className="font-bold text-brand-light">Name:</label>
                            {isEditingName ? (
                                <form onSubmit={handleNameSubmit} className="flex-grow flex gap-2">
                                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={handleKeyDown} className="bg-brand-dark text-brand-light px-3 py-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-brand-accent" autoFocus />
                                    <button type="submit" className="bg-brand-accent text-brand-primary font-bold px-3 py-1 rounded-md text-sm">Save</button>
                                </form>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <p className="text-brand-light text-lg">{user.playerName}</p>
                                    <button onClick={() => { setIsEditingName(true); setNewName(user.playerName); }} className="text-gray-400 hover:text-brand-accent"><EditIcon className="h-5 w-5" /></button>
                                </div>
                            )}
                            {showSavedNotification && <span className="text-xs text-brand-accent animate-fade-in">Saved!</span>}
                        </div>
                    </div>
                     <div>
                        <h3 className="text-xl font-semibold text-brand-accent mb-3">Trophies</h3>
                        <div className="flex items-center gap-4">
                            <TrophyDisplay type="gold" dates={user.trophies.gold} />
                            <TrophyDisplay type="silver" dates={user.trophies.silver} />
                            <TrophyDisplay type="bronze" dates={user.trophies.bronze} />
                            {user.trophies.gold.length === 0 && user.trophies.silver.length === 0 && user.trophies.bronze.length === 0 && (
                                <p className="text-gray-400">No trophies yet.</p>
                            )}
                        </div>
                    </div>
                    <div>
                         <h3 className="text-xl font-semibold text-brand-accent mb-3">Settings</h3>
                         <div className="flex items-center justify-between">
                            <p className="font-bold text-brand-light">Sound</p>
                            <button onClick={toggleSound} className={`px-4 py-2 rounded-md font-bold text-sm ${user.soundEnabled ? 'bg-brand-accent text-brand-primary' : 'bg-brand-dark text-brand-light'}`}>
                                {user.soundEnabled ? 'Enabled' : 'Disabled'}
                            </button>
                         </div>
                    </div>
                </div>
            </div>

            {/* Stats and History */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="p-4 bg-brand-secondary rounded-lg">
                    <h3 className="text-xl font-semibold text-brand-accent mb-4">Game Statistics</h3>
                    {playedGames.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-2">
                             {playedGames.map(([gameId, stats]) => (
                                <StatCard key={gameId} gameId={gameId as GameId} stats={stats as GameStats} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 h-full flex items-center justify-center">
                            <p className="text-gray-400">Play some games to see your stats here!</p>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-brand-secondary rounded-lg">
                     <h3 className="text-xl font-semibold text-brand-accent mb-4">Game History</h3>
                     {sortedHistory.length > 0 ? (
                        <div className="max-h-[450px] overflow-y-auto pr-2">
                            <table className="min-w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="p-3 text-sm font-semibold text-brand-accent">Game</th>
                                        <th className="p-3 text-sm font-semibold text-brand-accent">Result</th>
                                        <th className="p-3 text-sm font-semibold text-brand-accent">Duration</th>
                                        <th className="p-3 text-sm font-semibold text-brand-accent">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedHistory.map((entry, index) => <HistoryRow key={index} entry={entry} />)}
                                </tbody>
                            </table>
                        </div>
                     ) : (
                        <div className="text-center py-10 h-full flex items-center justify-center">
                            <p className="text-gray-400">Your completed games will appear here.</p>
                        </div>
                     )}
                </div>
            </div>
            
            <div className="mt-8 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <h3 className="text-xl font-semibold text-red-400 mb-3">Danger Zone</h3>
                <div className="flex items-center justify-between">
                    <p className="text-brand-light">Permanently delete your account and all associated data.</p>
                    <button onClick={onDeleteRequest} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;