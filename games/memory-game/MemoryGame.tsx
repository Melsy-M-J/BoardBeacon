import React, { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { GameComponentProps } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';
import ContinueGameModal from '../../components/ContinueGameModal';

const EMOJIS = ['🧠', '🕹️', '🎲', '🧩', '🃏', '👑', '🚀', '⭐'];

interface Card {
    id: number;
    value: string;
    isFlipped: boolean;
    isMatched: boolean;
}

const createShuffledDeck = (): Card[] => {
    const deck = [...EMOJIS, ...EMOJIS];
    const shuffledDeck = deck
        .map((value, index) => ({ id: index, value, isFlipped: false, isMatched: false }))
        .sort(() => Math.random() - 0.5);
    return shuffledDeck;
};


const MemoryGame: React.FC<GameComponentProps> = ({ onBackToLobby, gameName }) => {
    const { user, updateUserStats, saveGame, clearSavedGame } = useContext(AuthContext);
    const startTimeRef = useRef<number>(Date.now());
    
    const [cards, setCards] = useState<Card[]>(createShuffledDeck());
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [isChecking, setIsChecking] = useState(false);
    const [showContinueModal, setShowContinueModal] = useState(false);
    const [isGameReady, setIsGameReady] = useState(false);

    const isGameWon = useMemo(() => cards.every(card => card.isMatched), [cards]);
    const savedStateJSON = useMemo(() => user?.savedGames?.['memory-game'], [user]);

    useEffect(() => {
        if (user && savedStateJSON) {
            setShowContinueModal(true);
        } else {
            setIsGameReady(true);
        }
    }, [user, savedStateJSON]);
    
    useEffect(() => {
        if (isGameWon && user) {
            const timePlayed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            updateUserStats('memory-game', 'win', timePlayed);
        }
    }, [isGameWon, user, updateUserStats]);


    useEffect(() => {
        if (flippedIndices.length === 2) {
            setIsChecking(true);
            const [firstIndex, secondIndex] = flippedIndices;
            setMoves(prev => prev + 1);

            if (cards[firstIndex].value === cards[secondIndex].value) {
                setCards(prevCards => prevCards.map(card => 
                    card.value === cards[firstIndex].value ? { ...card, isMatched: true } : card
                ));
                setFlippedIndices([]);
                setIsChecking(false);
            } else {
                setTimeout(() => {
                    setCards(prevCards => prevCards.map((card, index) => 
                        (index === firstIndex || index === secondIndex) ? { ...card, isFlipped: false } : card
                    ));
                    setFlippedIndices([]);
                    setIsChecking(false);
                }, 1000);
            }
        }
    }, [flippedIndices, cards]);

    const handleCardClick = (index: number) => {
        if (isChecking || cards[index].isFlipped || flippedIndices.length === 2 || isGameWon) {
            return;
        }

        setFlippedIndices(prev => [...prev, index]);
        setCards(prevCards => prevCards.map((card, i) => 
            i === index ? { ...card, isFlipped: true } : card
        ));
    };

    const handleReset = () => {
        setCards(createShuffledDeck());
        setFlippedIndices([]);
        setMoves(0);
        setIsChecking(false);
        startTimeRef.current = Date.now();
    };

    const handleContinueGame = () => {
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            setCards(savedState.cards);
            setMoves(savedState.moves);
            const timePlayedSoFar = savedState.timePlayed || 0;
            startTimeRef.current = Date.now() - timePlayedSoFar * 1000;
        }
        setShowContinueModal(false);
        setIsGameReady(true);
    };

    const handleStartNewGame = () => {
        clearSavedGame('memory-game');
        handleReset();
        setShowContinueModal(false);
        setIsGameReady(true);
    };

    const handleSaveAndExit = () => {
        if (user && !isGameWon) {
            const timePlayed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const gameState = JSON.stringify({
                cards,
                moves,
                timePlayed,
            });
            saveGame('memory-game', gameState);
        }
        onBackToLobby();
    };

    if (!isGameReady && user) {
        return (
            <div className="w-full max-w-2xl mx-auto flex items-center justify-center h-96">
                <ContinueGameModal 
                    isOpen={showContinueModal}
                    onContinue={handleContinueGame}
                    onStartNew={handleStartNewGame}
                    title="Unfinished Game Found"
                    message="Would you like to continue your saved Memory Game?"
                />
                 {!showContinueModal && <p className="text-brand-light">Loading game...</p>}
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-brand-primary p-6 rounded-lg shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold text-brand-light">{gameName}</h2>
                 <div>
                    {user && <button onClick={handleSaveAndExit} className="text-sm bg-brand-secondary text-brand-light hover:bg-brand-accent hover:text-brand-primary font-medium py-1 px-3 rounded-md transition-colors duration-300 mr-2">Save & Exit</button>}
                    <button onClick={onBackToLobby} className="text-sm text-brand-accent hover:underline">Back to Lobby</button>
                </div>
            </div>

            <div className="flex justify-between items-center bg-brand-secondary p-3 rounded-md mb-6">
                <span className="font-semibold text-brand-light">Moves: {moves}</span>
                <button onClick={handleReset} className="bg-brand-accent text-brand-primary font-bold py-1 px-4 text-sm rounded-md hover:bg-opacity-80 transition-colors duration-300">
                    Reset
                </button>
            </div>

            {isGameWon ? (
                <div className="text-center p-8 bg-brand-secondary rounded-lg">
                    <h3 className="text-3xl font-bold text-brand-accent mb-2">You Won!</h3>
                    <p className="text-brand-light">You completed the game in {moves} moves.</p>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-4">
                    {cards.map((card, index) => (
                        <div key={card.id} className="perspective-1000" onClick={() => handleCardClick(index)}>
                            <div
                                className={`relative w-full aspect-square transition-transform duration-500 ${card.isFlipped ? 'transform-rotate-y-180' : ''}`}
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <div className={`absolute w-full h-full backface-hidden flex items-center justify-center bg-brand-secondary rounded-md ${!isGameWon && 'cursor-pointer hover:bg-brand-secondary/80'}`}></div>
                                <div className={`absolute w-full h-full backface-hidden transform-rotate-y-180 flex items-center justify-center rounded-md text-4xl ${card.isMatched ? 'bg-brand-accent/30' : 'bg-brand-light'}`}>
                                    <span>{card.value}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
             <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-rotate-y-180 { transform: rotateY(180deg); }
                .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
            `}</style>
        </div>
    );
};

export default MemoryGame;