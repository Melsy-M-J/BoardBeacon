import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { SoundOnIcon, SoundOffIcon, HamburgerIcon, CloseIcon } from './icons';

type View = 'lobby' | 'profile' | 'leaderboard';

interface HeaderProps {
    currentView: View;
    setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ setView }) => {
    const { user, logout, setAuthModalOpen, toggleSound } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleNav = (view: View) => {
        setView(view);
        setIsMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
    }

    return (
        <header className="fixed top-0 left-0 right-0 bg-brand-primary/80 backdrop-blur-sm shadow-lg z-50 animate-fade-in">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <button onClick={() => handleNav('lobby')} className="text-brand-accent font-bold text-xl tracking-wider">
                           BoardBeacon
                        </button>
                    </div>
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                {user.soundEnabled !== undefined && (
                                     <button onClick={toggleSound} className="text-brand-light hover:text-brand-accent transition-colors p-2">
                                        {user.soundEnabled ? <SoundOnIcon className="w-6 h-6" /> : <SoundOffIcon className="w-6 h-6" />}
                                    </button>
                                )}
                                <button onClick={() => handleNav('profile')} className="text-brand-light hover:text-brand-accent transition-colors">
                                    Profile
                                </button>
                                <button onClick={() => handleNav('leaderboard')} className="text-brand-light hover:text-brand-accent transition-colors">
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
                            <button
                                onClick={() => setAuthModalOpen(true)}
                                className="bg-brand-accent text-brand-primary font-bold py-2 px-4 rounded-md hover:bg-opacity-80 transition-colors duration-300"
                            >
                                Login
                            </button>
                        )}
                    </div>
                     {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                         {user ? (
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-brand-light hover:text-brand-accent p-2">
                                {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : <HamburgerIcon className="w-6 h-6" />}
                            </button>
                         ) : (
                             <button
                                onClick={() => setAuthModalOpen(true)}
                                className="bg-brand-accent text-brand-primary font-bold py-2 px-4 rounded-md hover:bg-opacity-80 transition-colors duration-300"
                            >
                                Login
                            </button>
                         )}
                    </div>
                </div>
            </nav>
            {/* Mobile Menu */}
            {isMenuOpen && user && (
                <div className="md:hidden bg-brand-primary/95 pb-4 animate-fade-in">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-center">
                        <button onClick={() => handleNav('profile')} className="block w-full text-brand-light hover:text-brand-accent px-3 py-2 rounded-md text-base font-medium">
                            Profile
                        </button>
                        <button onClick={() => handleNav('leaderboard')} className="block w-full text-brand-light hover:text-brand-accent px-3 py-2 rounded-md text-base font-medium">
                            Leaderboard
                        </button>
                         {user.soundEnabled !== undefined && (
                            <button onClick={toggleSound} className="w-full flex justify-center items-center gap-2 text-brand-light hover:text-brand-accent px-3 py-2 rounded-md text-base font-medium">
                                Sound: {user.soundEnabled ? <SoundOnIcon className="w-5 h-5" /> : <SoundOffIcon className="w-5 h-5" />}
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="block w-full bg-brand-secondary text-brand-light hover:bg-brand-accent hover:text-brand-primary font-medium py-2 px-4 rounded-md transition-colors duration-300 mt-2"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;