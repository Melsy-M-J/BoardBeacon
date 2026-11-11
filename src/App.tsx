import React, { useState, useMemo, useContext, useEffect } from 'react';
import { Game, GameId, DailyChallenge } from './types';
import GameLobby from './components/GameLobby';
import TicTacToeGame from './games/tic-tac-toe/TicTacToeGame';
import ConnectFourGame from './games/connect-four/ConnectFourGame';
import MemoryGame from './games/memory-game/MemoryGame';
import SudokuGame from './games/sudoku/SudokuGame';
import ChessGame from './games/chess/ChessGame';
import CheckersGame from './games/checkers/CheckersGame';
import LudoGame from './games/ludo/LudoGame';
import SnakesAndLaddersGame from './games/snakes-and-ladders/SnakesAndLaddersGame';
import MahjongGame from './games/mahjong/MahjongGame';
import Header from './components/Header';
import ProfilePage from './components/ProfilePage';
import Leaderboard from './components/Leaderboard';
import ChallengesHub from './components/challenges/ChallengesHub';
import DailyChallengeView from './components/challenges/DailyChallengeView';
import AuthModal from './components/auth/AuthModal';
import ConfirmationModal from './components/ConfirmationModal';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { GameAudioContext, AudioProvider } from './contexts/AudioContext';
import { ThemeProvider } from './contexts/ThemeContext';
import {
  TicTacToeIcon,
  ConnectFourIcon,
  MemoryGameIcon,
  ChessIcon,
  CheckersIcon,
  LudoIcon,
  SnakeAndLadderIcon,
  SudokuIcon,
  MahjongIcon,
} from './components/icons';

type View = 'lobby' | 'challenges' | 'profile' | 'leaderboard';

const AppContent: React.FC = () => {
  const [selectedGameId, setSelectedGameId] = useState<GameId | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<DailyChallenge | null>(null);
  const [currentView, setCurrentView] = useState<View>('lobby');

  const { user, isAuthModalOpen, deleteAccount } = useContext(AuthContext);
  const { playLobbyMusic, playGameMusic, stopMusic, userHasInteracted, setUserHasInteracted } =
    useContext(GameAudioContext);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!userHasInteracted || !user?.soundEnabled) {
      stopMusic();
      return;
    }

    if (selectedGameId || selectedChallenge) {
      playGameMusic();
    } else {
      playLobbyMusic();
    }

    return () => stopMusic();
  }, [
    selectedGameId,
    selectedChallenge,
    userHasInteracted,
    user?.soundEnabled,
    playLobbyMusic,
    playGameMusic,
    stopMusic,
  ]);

  const GAMES: Game[] = useMemo(
    () => [
      {
        id: 'chess',
        name: 'Chess',
        description:
          'The ultimate strategy game. Full legal chess rules, FEN snapshots, and move-by-move replay.',
        category: 'Strategy',
        component: ChessGame,
        icon: ChessIcon,
      },
      {
        id: 'checkers',
        name: 'Checkers',
        description:
          "Capture all opponent pieces with diagonal moves, jumping captures, kings, and replay review.",
        category: 'Strategy',
        component: CheckersGame,
        icon: CheckersIcon,
      },
      {
        id: 'connect-four',
        name: 'Connect Four',
        description:
          'Be first to connect 4 discs vertically, horizontally, or diagonally against smart AI.',
        category: 'Strategy',
        component: ConnectFourGame,
        icon: ConnectFourIcon,
      },
      {
        id: 'tic-tac-toe',
        name: 'Tic-Tac-Toe',
        description:
          'Classic 3x3 grid game. Outsmart the AI to get three in a row with coordinate notation replay.',
        category: 'Classic',
        component: TicTacToeGame,
        icon: TicTacToeIcon,
      },
      {
        id: 'memory-game',
        name: 'Memory Game',
        description:
          'Test cognitive memory by discovering all matching pairs with turn flip history.',
        category: 'Puzzle',
        component: MemoryGame,
        icon: MemoryGameIcon,
      },
      {
        id: 'snake-and-ladder',
        name: 'Snakes & Ladders',
        description:
          'Climb ladders and dodge snakes on the 100-cell board with roll trajectory replay.',
        category: 'Classic',
        component: SnakesAndLaddersGame,
        icon: SnakeAndLadderIcon,
      },
      {
        id: 'sudoku',
        name: 'Sudoku',
        description:
          'Logic-based number puzzle with full placement step recording and undo analysis.',
        category: 'Puzzle',
        component: SudokuGame,
        icon: SudokuIcon,
      },
      {
        id: 'ludo',
        name: 'Ludo',
        description:
          'Classic race-to-the-finish dice game. Advance 4 tokens home with move logs.',
        category: 'Classic',
        component: LudoGame,
        icon: LudoIcon,
      },
      {
        id: 'mahjong',
        name: 'Mahjong Solitaire',
        description:
          'Match pairs of free tiles to clear the board with step-by-step clear history.',
        category: 'Puzzle',
        component: MahjongGame,
        icon: MahjongIcon,
      },
    ],
    []
  );

  const handleSelectGame = (gameId: GameId) => {
    setSelectedChallenge(null);
    setSelectedGameId(gameId);
  };

  const handleSelectChallenge = (challenge: DailyChallenge) => {
    setSelectedGameId(null);
    setSelectedChallenge(challenge);
  };

  const handleBackToLobby = () => {
    setSelectedGameId(null);
    setSelectedChallenge(null);
    setCurrentView('lobby');
  };

  const handleBackToChallenges = () => {
    setSelectedChallenge(null);
    setCurrentView('challenges');
  };

  const handleDeleteConfirm = () => {
    deleteAccount();
    setDeleteModalOpen(false);
    setCurrentView('lobby');
  };

  const selectedGame = useMemo(
    () => GAMES.find((game) => game.id === selectedGameId),
    [selectedGameId, GAMES]
  );

  const renderContent = () => {
    // If a Daily Challenge puzzle is active
    if (selectedChallenge) {
      return (
        <DailyChallengeView
          challenge={selectedChallenge}
          onBack={handleBackToChallenges}
        />
      );
    }

    // If a standard game is active
    if (selectedGame) {
      return React.createElement(selectedGame.component, {
        onBackToLobby: handleBackToLobby,
        gameName: selectedGame.name,
      });
    }

    // Main views
    switch (currentView) {
      case 'challenges':
        return (
          <ChallengesHub
            onSelectChallenge={handleSelectChallenge}
            onBackToLobby={handleBackToLobby}
          />
        );
      case 'profile':
        return (
          <ProfilePage
            onBack={() => setCurrentView('lobby')}
            onDeleteRequest={() => setDeleteModalOpen(true)}
          />
        );
      case 'leaderboard':
        return <Leaderboard onBack={() => setCurrentView('lobby')} />;
      case 'lobby':
      default:
        return (
          <GameLobby
            games={GAMES}
            onSelectGame={handleSelectGame}
            onOpenChallenges={() => setCurrentView('challenges')}
          />
        );
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--theme-bg-canvas, #0a192f)',
        color: 'var(--theme-text-primary, #f8fafc)',
      }}
      className="min-h-screen p-4 sm:p-6 md:p-8 flex flex-col items-center transition-colors duration-300"
      onClick={() => !userHasInteracted && setUserHasInteracted(true)}
    >
      {isAuthModalOpen && <AuthModal />}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Reset Game Data"
        message="Are you sure you want to permanently reset your profile and match history? All your recorded matches and challenge badges will be cleared."
      />
      <Header currentView={currentView} setView={(v) => { setSelectedGameId(null); setSelectedChallenge(null); setCurrentView(v); }} />
      <main className="w-full max-w-5xl mt-20">{renderContent()}</main>
      <footer className="text-center text-slate-500 mt-12 text-xs flex flex-col gap-1 pb-4">
        <div>BoardBeacon · Classic Board Games & Daily Challenges with Move Replay</div>
        <div className="text-slate-600">Earn Daily Points, Badges, and Conquer Tactical Puzzles</div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AudioProvider>
          <AppContent />
        </AudioProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;