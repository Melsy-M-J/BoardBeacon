import React, { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import { GameComponentProps } from '../../types';
import { getAiResponse } from '../../services/geminiService';
import { AuthContext } from '../../contexts/AuthContext';
import ContinueGameModal from '../../components/ContinueGameModal';
import { Type } from '@google/genai';
import { ChessPiece } from './Piece';

type GameStatus = 'playing' | 'checkmate' | 'draw' | 'stalemate' | 'threefold_repetition' | 'insufficient_material';

const ChessGame: React.FC<GameComponentProps> = ({ onBackToLobby, gameName }) => {
    const { user, updateUserStats, saveGame, clearSavedGame } = useContext(AuthContext);
    const startTimeRef = useRef<number>(Date.now());
    
    const gameRef = useRef(new Chess());
    const [board, setBoard] = useState(gameRef.current.board());
    const [status, setStatus] = useState<GameStatus>('playing');
    const [fromSquare, setFromSquare] = useState<Square | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
    const [aiIsThinking, setAiIsThinking] = useState(false);
    const [showContinueModal, setShowContinueModal] = useState(false);
    const [isGameReady, setIsGameReady] = useState(false);

    const savedFen = useMemo(() => user?.savedGames?.chess, [user]);

    useEffect(() => {
        if (user && savedFen) {
            setShowContinueModal(true);
        } else {
            setIsGameReady(true);
        }
    }, [user, savedFen]);


    const updateGameState = useCallback(() => {
        if (gameRef.current.isGameOver()) {
            const time = Math.floor((Date.now() - startTimeRef.current) / 1000);
            if (gameRef.current.isCheckmate()) {
                setStatus('checkmate');
                const winner = gameRef.current.turn() === 'b' ? 'w' : 'b';
                if (user) updateUserStats('chess', winner === 'w' ? 'win' : 'loss', time);
            } else if (gameRef.current.isStalemate()) {
                setStatus('stalemate');
                if (user) updateUserStats('chess', 'draw', time);
            } else if (gameRef.current.isThreefoldRepetition()) {
                setStatus('threefold_repetition');
                if (user) updateUserStats('chess', 'draw', time);
            } else if (gameRef.current.isInsufficientMaterial()) {
                setStatus('insufficient_material');
                if (user) updateUserStats('chess', 'draw', time);
            } else if (gameRef.current.isDraw()) {
                setStatus('draw');
                if (user) updateUserStats('chess', 'draw', time);
            }
             if (user) clearSavedGame('chess');
        } else {
            setStatus('playing');
        }
        setBoard(gameRef.current.board());
    }, [user, updateUserStats, clearSavedGame]);

    const handleAiMove = useCallback(async () => {
        if (gameRef.current.isGameOver() || gameRef.current.turn() !== 'b') return;

        setAiIsThinking(true);
        const legalMoves = gameRef.current.moves();
        const prompt = `You are a world-class chess grandmaster. It is your turn to play as Black ('b').
The current game state in FEN is: "${gameRef.current.fen()}".
Here is a list of all legal moves you can make: [${legalMoves.join(', ')}].
Analyze the position and choose the best move from this list.
Respond with a JSON object containing your chosen move in the "move" field.`;
        const schema = { type: Type.OBJECT, properties: { move: { type: Type.STRING } }, required: ["move"] };

        try {
            const aiResponse = await getAiResponse(prompt, schema);
            const move = aiResponse.move;

            if (legalMoves.includes(move)) {
                gameRef.current.move(move);
                updateGameState();
            } else {
                console.warn(`AI returned an invalid or non-listed move: "${move}". Falling back to a random move.`);
                const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
                gameRef.current.move(randomMove);
                updateGameState();
            }
        } catch (error) {
            console.error("Error fetching AI move:", error);
            const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
            gameRef.current.move(randomMove);
            updateGameState();
        } finally {
            setAiIsThinking(false);
        }
    }, [updateGameState]);
    
    const handleContinueGame = () => {
        if (savedFen) {
            gameRef.current.load(savedFen);
            setBoard(gameRef.current.board());
        }
        setShowContinueModal(false);
        setIsGameReady(true);
    };

    const handleStartNewGame = () => {
        clearSavedGame('chess');
        gameRef.current.reset();
        setBoard(gameRef.current.board());
        setShowContinueModal(false);
        setIsGameReady(true);
    };

    useEffect(() => {
        if (isGameReady && gameRef.current.turn() === 'b' && !gameRef.current.isGameOver()) {
            const timer = setTimeout(handleAiMove, 300);
            return () => clearTimeout(timer);
        }
    }, [isGameReady, handleAiMove, board]);

    const handleSquareClick = (square: Square) => {
        if (status !== 'playing' || gameRef.current.turn() !== 'w') return;

        if (fromSquare) {
            try {
                const move = gameRef.current.move({ from: fromSquare, to: square, promotion: 'q' });
                if (move) {
                    updateGameState();
                }
            } catch (e) {
                // Invalid move
            } finally {
                setFromSquare(null);
                setPossibleMoves([]);
            }
        } else {
            const piece = gameRef.current.get(square);
            if (piece && piece.color === 'w') {
                setFromSquare(square);
                const moves = gameRef.current.moves({ square, verbose: true }).map(m => m.to);
                setPossibleMoves(moves);
            }
        }
    };

    const handleReset = () => {
        clearSavedGame('chess');
        gameRef.current.reset();
        setBoard(gameRef.current.board());
        setStatus('playing');
        setFromSquare(null);
        setPossibleMoves([]);
        setAiIsThinking(false);
        startTimeRef.current = Date.now();
    };

    const handleSaveAndExit = () => {
        if (user && !gameRef.current.isGameOver()) {
            saveGame('chess', gameRef.current.fen());
        }
        onBackToLobby();
    };
    
    const getStatusMessage = () => {
        if (status === 'checkmate') return gameRef.current.turn() === 'b' ? 'Checkmate! You win!' : 'Checkmate! AI wins!';
        if (status === 'stalemate') return "Stalemate! It's a draw.";
        if (status === 'draw') return "It's a draw.";
        if (status === 'threefold_repetition') return "Draw by threefold repetition.";
        if (status === 'insufficient_material') return "Draw by insufficient material.";
        if (aiIsThinking) return "AI is thinking...";
        return gameRef.current.turn() === 'w' ? 'Your turn (White)' : "AI's turn (Black)";
    };
    
    if (!isGameReady && user) {
        return (
            <div className="w-full max-w-xl mx-auto flex items-center justify-center h-96">
                <ContinueGameModal 
                    isOpen={showContinueModal}
                    onContinue={handleContinueGame}
                    onStartNew={handleStartNewGame}
                    title="Unfinished Game Found"
                    message="Would you like to continue your saved game of Chess?"
                />
                 {!showContinueModal && <p className="text-brand-light">Loading game...</p>}
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl mx-auto bg-brand-primary p-4 sm:p-6 rounded-lg shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h2 className="text-3xl font-bold text-brand-light">{gameName}</h2>
                <div>
                     {user && <button onClick={handleSaveAndExit} className="text-sm bg-brand-secondary text-brand-light hover:bg-brand-accent hover:text-brand-primary font-medium py-1 px-3 rounded-md transition-colors duration-300 mr-2">Save & Exit</button>}
                    <button onClick={onBackToLobby} className="text-sm text-brand-accent hover:underline">Back to Lobby</button>
                </div>
            </div>
            
            <div className="aspect-square grid grid-cols-8 grid-rows-8 border-2 border-brand-secondary/50 rounded-md overflow-hidden shadow-inner">
                {board.map((row, rowIndex) => row.map((piece, colIndex) => {
                    const square = `${'abcdefgh'[colIndex]}${8 - rowIndex}` as Square;
                    const isLight = (rowIndex + colIndex) % 2 !== 0;
                    return (
                        <div key={square}
                            onClick={() => handleSquareClick(square)}
                            className={`
                                relative flex items-center justify-center 
                                ${isLight ? 'bg-brand-light/90' : 'bg-brand-secondary'}
                                ${status === 'playing' && gameRef.current.turn() === 'w' ? 'cursor-pointer' : 'cursor-not-allowed'}
                            `}
                        >
                            {piece && <ChessPiece piece={piece} />}
                            {possibleMoves.includes(square) && (
                                 <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-1/3 h-1/3 bg-brand-accent/50 rounded-full"></div>
                                </div>
                            )}
                             {fromSquare === square && (
                                <div className="absolute inset-0 bg-brand-accent/40"></div>
                            )}
                        </div>
                    );
                }))}
            </div>
            
             <div className="text-center h-16 flex flex-col justify-center items-center mt-4">
                <p className={`text-xl font-medium mb-2 ${status !== 'playing' ? 'text-brand-accent' : 'text-brand-light'}`}>{getStatusMessage()}</p>
                {status !== 'playing' && <button onClick={handleReset} className="bg-brand-accent text-brand-primary font-bold py-2 px-6 rounded-md hover:bg-opacity-80 transition-colors duration-300">Play Again</button>}
            </div>
        </div>
    );
};
export default ChessGame;