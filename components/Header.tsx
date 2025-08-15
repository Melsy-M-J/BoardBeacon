import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { SoundOnIcon, SoundOffIcon } from './icons';

type View = 'lobby' | 'profile' | 'leaderboard';

interface HeaderProps {
    currentView: View;
    setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ setView }) => {
    const { user, logout, setAuthModalOpen, toggleSound } = useContext(AuthContext);

    return (
        <header className="fixed top-0 left-0 right-0 bg-brand-primary/80 backdrop-blur-sm shadow-lg z-50 animate-fade-in">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <button onClick={() => setView('lobby')} className="text-brand-accent font-bold text-xl tracking-wider">
                           AI Game Arena
                        </button>
                    </div>
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                {user.soundEnabled !== undefined && (
                                     <button onClick={toggleSound} className="text-brand-light hover:text-brand-accent transition-colors p-2">
                                        {user.soundEnabled ? <SoundOnIcon className="w-6 h-6" /> : <SoundOffIcon className="w-6 h-6" />}
                                    </button>
                                )}
                                <button onClick={() => setView('profile')} className="text-brand-light hover:text-brand-accent transition-colors">
                                    Profile
                                </button>
                                <button onClick={() => setView('leaderboard')} className="text-brand-light hover:text-brand-accent transition-colors">
                                    Leaderboard
                                </button>
                                <button
                                    onClick={logout}
                                    className="bg-brand-secondary text-brand-light hover:bg-brand-accent hover:text-brand-primary font-medium py-2 px-4 rounded-md transition-colors duration-300"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setAuthModalOpen(true)}
                                    className="bg-brand-accent text-brand-primary font-bold py-2 px-4 rounded-md hover:bg-opacity-80 transition-colors duration-300"
                                >
                                    Login
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;