import React, { useState, useMemo, useContext, useEffect } from 'react';
import { Game, GameId } from './types';
import GameLobby from './components/GameLobby';
import TicTacToeGame from './games/tic-tac-toe/TicTacToeGame';
import MemoryGame from './games/memory-game/MemoryGame';
import SudokuGame from './games/sudoku/SudokuGame';
import ComingSoonGame from './games/ComingSoonGame';
import Header from './components/Header';
import ProfilePage from './components/ProfilePage';
import Leaderboard from './components/Leaderboard';
import AuthModal from './components/auth/AuthModal';
import ConfirmationModal from './components/ConfirmationModal';
import { AuthContext } from './contexts/AuthContext';
import { AudioContext } from './contexts/AudioContext';
import { TicTacToeIcon, MemoryGameIcon, ChessIcon, CheckersIcon, LudoIcon, SnakeAndLadderIcon, SudokuIcon } from './components/icons';

type View = 'lobby' | 'profile' | 'leaderboard';

const App: React.FC = () => {
    const [selectedGameId, setSelectedGameId] = useState<GameId | null>(null);
    const [currentView, setCurrentView] = useState<View>('lobby');
    const { user, isAuthModalOpen, deleteAccount } = useContext(AuthContext);
    const { playLobbyMusic, playGameMusic, stopMusic, userHasInteracted, setUserHasInteracted } = useContext(AudioContext);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);


    useEffect(() => {
        if (!userHasInteracted || !user?.soundEnabled) {
            stopMusic();
            return;
        }

        if (selectedGameId) {
            playGameMusic();
        } else {
            playLobbyMusic();
        }

        return () => stopMusic();
    }, [selectedGameId, userHasInteracted, user?.soundEnabled, playLobbyMusic, playGameMusic, stopMusic]);

    const GAMES: Game[] = useMemo(() => [
        { id: 'tic-tac-toe', name: 'Tic-Tac-Toe', description: 'Classic 3x3 grid game. Outsmart the AI to get three in a row.', component: TicTacToeGame, icon: TicTacToeIcon },
        { id: 'memory-game', name: 'Memory Game', description: 'Test your memory by finding all the matching pairs of cards.', component: MemoryGame, icon: MemoryGameIcon },
        { id: 'sudoku', name: 'Sudoku', description: 'A logic-based number-placement puzzle. Powered by Gemini.', component: SudokuGame, icon: SudokuIcon },
        { id: 'chess', name: 'Chess', description: 'The ultimate strategy game. Checkmate the AI king.', component: ComingSoonGame, icon: ChessIcon, isComingSoon: true },
        { id: 'checkers', name: 'Checkers', description: "Capture all of your opponent's pieces to win.", component: ComingSoonGame, icon: CheckersIcon, isComingSoon: true },
        { id: 'ludo', name: 'Ludo', description: 'A classic race-to-the-finish dice game for all ages.', component: ComingSoonGame, icon: LudoIcon, isComingSoon: true },
        { id: 'snake-and-ladder', name: 'Snakes & Ladders', description: 'Climb ladders and avoid snakes in this game of luck.', component: ComingSoonGame, icon: SnakeAndLadderIcon, isComingSoon: true }
    ], []);

    const handleSelectGame = (gameId: GameId) => {
        const game = GAMES.find(g => g.id === gameId);
        if (game && !game.isComingSoon) {
            setSelectedGameId(gameId);
        }
    };

    const handleBackToLobby = () => {
        setSelectedGameId(null);
        setCurrentView('lobby');
    };

    const handleDeleteConfirm = () => {
        deleteAccount();
        setDeleteModalOpen(false);
        setCurrentView('lobby');
    };


    const selectedGame = useMemo(() => GAMES.find(game => game.id === selectedGameId), [selectedGameId, GAMES]);

    const renderContent = () => {
        if (selectedGame) {
            return React.createElement(selectedGame.component, { onBackToLobby: handleBackToLobby, gameName: selectedGame.name });
        }
        switch (currentView) {
            case 'profile':
                return <ProfilePage onBack={() => setCurrentView('lobby')} onDeleteRequest={() => setDeleteModalOpen(true)} />;
            case 'leaderboard':
                return <Leaderboard onBack={() => setCurrentView('lobby')} />;
            case 'lobby':
            default:
                return <GameLobby games={GAMES} onSelectGame={handleSelectGame} />;
        }
    };

    return (
        <div className="min-h-screen bg-brand-dark p-4 sm:p-6 md:p-8 flex flex-col items-center animate-fade-in" onClick={() => !userHasInteracted && setUserHasInteracted(true)}>
            {isAuthModalOpen && <AuthModal />}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Account"
                message="Are you sure you want to permanently delete your account? All your progress and stats will be lost."
            />
            <Header currentView={currentView} setView={setCurrentView} />
            <main className="w-full max-w-5xl mt-16">
                {renderContent()}
            </main>
            <footer className="text-center text-gray-500 mt-8 text-sm">
                Powered by React, Tailwind CSS, and the Gemini API.
            </footer>
        </div>
    );
};

export default App;