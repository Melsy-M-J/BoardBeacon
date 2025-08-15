import React, { useContext, useState, FormEvent, KeyboardEvent } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { GameId } from '../types';
import { GoldTrophyIcon, SilverTrophyIcon, BronzeTrophyIcon } from './icons';

interface ProfilePageProps {
    onBack: () => void;
    onDeleteRequest: () => void;
}

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


const ProfilePage: React.FC<ProfilePageProps> = ({ onBack, onDeleteRequest }) => {
    const { user, updatePlayerName, toggleSound } = useContext(AuthContext);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(user?.playerName || '');

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
        updatePlayerName(newName);
        setIsEditingName(false);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setNewName(user.playerName);
            setIsEditingName(false);
        }
    };


    return (
        <div className="w-full max-w-4xl mx-auto bg-brand-primary p-6 sm:p-8 rounded-lg shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b border-brand-secondary pb-4">
                <div>
                    <h2 className="text-3xl font-bold text-brand-light">Player Profile</h2>
                    <p className="text-gray-400">{user.email}</p>
                </div>
                <button onClick={onBack} className="text-sm text-brand-accent hover:underline">Back to Lobby</button>
            </div>

            <div className="mb-8 p-4 bg-brand-secondary rounded-lg">
                <h3 className="text-xl font-semibold text-brand-accent mb-3">Player Details</h3>
                <div className="flex items-center gap-4">
                    <label className="font-bold text-brand-light">Player Name:</label>
                    {isEditingName ? (
                        <form onSubmit={handleNameSubmit} className="flex-grow flex gap-2">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="bg-brand-dark text-brand-light px-3 py-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-brand-accent"
                                autoFocus
                            />
                            <button type="submit" className="bg-brand-accent text-brand-primary font-bold px-3 py-1 rounded-md text-sm">Save</button>
                        </form>
                    ) : (
                        <div className="flex items-center gap-3">
                            <p className="text-brand-light text-lg">{user.playerName}</p>
                            <button onClick={() => { setIsEditingName(true); setNewName(user.playerName); }} className="text-gray-400 hover:text-brand-accent">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-8 p-4 bg-brand-secondary rounded-lg">
                <h3 className="text-xl font-semibold text-brand-accent mb-3">Trophies</h3>
                <div className="flex items-center gap-4">
                    <TrophyDisplay type="gold" dates={user.trophies.gold} />
                    <TrophyDisplay type="silver" dates={user.trophies.silver} />
                    <TrophyDisplay type="bronze" dates={user.trophies.bronze} />
                    {user.trophies.gold.length === 0 && user.trophies.silver.length === 0 && user.trophies.bronze.length === 0 && (
                        <p className="text-gray-400">No trophies yet. Compete in the weekly leaderboard to earn some!</p>
                    )}
                </div>
            </div>

            <div className="mb-8 p-4 bg-brand-secondary rounded-lg">
                 <h3 className="text-xl font-semibold text-brand-accent mb-3">Settings</h3>
                 <div className="flex items-center justify-between">
                    <p className="font-bold text-brand-light">Sound</p>
                    <button onClick={toggleSound} className={`px-4 py-2 rounded-md font-bold text-sm ${user.soundEnabled ? 'bg-brand-accent text-brand-primary' : 'bg-brand-dark text-brand-light'}`}>
                        {user.soundEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                 </div>
            </div>
            
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
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