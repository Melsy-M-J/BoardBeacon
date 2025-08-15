import React, { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { GameComponentProps } from '../../types';
import { getAiResponse } from '../../services/geminiService';
import { AuthContext } from '../../contexts/AuthContext';
import ContinueGameModal from '../../components/ContinueGameModal';
import Dice from '../../components/Dice';
import { Type } from '@google/genai';

type Player = 'green' | 'red' | 'yellow' | 'blue';
type PieceState = { pos: number; state: 'home' | 'active' | 'finished' }; // pos -1 home, 0-51 track, 52-57 green home, 58-63 red home, 100 finished
type GameState = Record<Player, PieceState[]>;

const PLAYER_STARTS: Record<Player, number> = { green: 0, yellow: 13, red: 26, blue: 39 };
const GATE_ENTRIES: Record<Player, number> = { green: 51, red: 25, yellow: 12, blue: 38 }; // The square before the home stretch
const HOME_STRETCH_STARTS: Record<Player, number> = { green: 52, red: 58, yellow: 64, blue: 70 };
const PIECE_COLORS: Record<Player, string> = { green: 'bg-green-500', red: 'bg-red-500', yellow: 'bg-yellow-400', blue: 'bg-blue-500' };

// prettier-ignore
const PATH_COORDS: { [key: number]: { r: number, c: number } } = {
    0: { r: 6, c: 0 }, 1: { r: 6, c: 1 }, 2: { r: 6, c: 2 }, 3: { r: 6, c: 3 }, 4: { r: 6, c: 4 }, 5: { r: 6, c: 5 },
    6: { r: 5, c: 6 }, 7: { r: 4, c: 6 }, 8: { r: 3, c: 6 }, 9: { r: 2, c: 6 }, 10: { r: 1, c: 6 }, 11: { r: 0, c: 6 },
    12: { r: 0, c: 7 }, 13: { r: 0, c: 8 },
    14: { r: 1, c: 8 }, 15: { r: 2, c: 8 }, 16: { r: 3, c: 8 }, 17: { r: 4, c: 8 }, 18: { r: 5, c: 8 },
    19: { r: 6, c: 9 }, 20: { r: 6, c: 10 }, 21: { r: 6, c: 11 }, 22: { r: 6, c: 12 }, 23: { r: 6, c: 13 }, 24: { r: 6, c: 14 },
    25: { r: 7, c: 14 }, 26: { r: 8, c: 14 },
    27: { r: 8, c: 13 }, 28: { r: 8, c: 12 }, 29: { r: 8, c: 11 }, 30: { r: 8, c: 10 }, 31: { r: 8, c: 9 },
    32: { r: 9, c: 8 }, 33: { r: 10, c: 8 }, 34: { r: 11, c: 8 }, 35: { r: 12, c: 8 }, 36: { r: 13, c: 8 }, 37: { r: 14, c: 8 },
    38: { r: 14, c: 7 }, 39: { r: 14, c: 6 },
    40: { r: 13, c: 6 }, 41: { r: 12, c: 6 }, 42: { r: 11, c: 6 }, 43: { r: 10, c: 6 }, 44: { r: 9, c: 6 },
    45: { r: 8, c: 5 }, 46: { r: 8, c: 4 }, 47: { r: 8, c: 3 }, 48: { r: 8, c: 2 }, 49: { r: 8, c: 1 }, 50: { r: 8, c: 0 },
    51: { r: 7, c: 0 },
};
// Home stretch coords
for (let i = 0; i < 6; i++) PATH_COORDS[52 + i] = { r: 7, c: 1 + i }; // Green
for (let i = 0; i < 6; i++) PATH_COORDS[58 + i] = { r: 7, c: 13 - i }; // Red
for (let i = 0; i < 6; i++) PATH_COORDS[64 + i] = { r: 1 + i, c: 7 }; // Yellow
for (let i = 0; i < 6; i++) PATH_COORDS[70 + i] = { r: 13 - i, c: 7 }; // Blue


const LudoGame: React.FC<GameComponentProps> = ({ onBackToLobby, gameName }) => {
    const { user, updateUserStats, saveGame, clearSavedGame } = useContext(AuthContext);
    const startTimeRef = useRef<number>(Date.now());
    
    const createInitialState = (): GameState => ({
        green: Array(4).fill(null).map(() => ({ pos: -1, state: 'home' })),
        red: Array(4).fill(null).map(() => ({ pos: -1, state: 'home' })),
        yellow: Array(4).fill(null).map(() => ({ pos: -1, state: 'home' })),
        blue: Array(4).fill(null).map(() => ({ pos: -1, state: 'home' })),
    });

    const [gameState, setGameState] = useState<GameState>(createInitialState());
    const [turn, setTurn] = useState<Player>('green');
    const [diceValue, setDiceValue] = useState<number | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [winner, setWinner] = useState<Player | null>(null);
    const [message, setMessage] = useState('Roll the dice to start!');
    const [movablePieces, setMovablePieces] = useState<number[]>([]);

    const [showContinueModal, setShowContinueModal] = useState(false);
    const [isGameReady, setIsGameReady] = useState(false);
    const savedStateJSON = useMemo(() => user?.savedGames?.ludo, [user]);

     useEffect(() => {
        if (user && savedStateJSON) setShowContinueModal(true);
        else setIsGameReady(true);
    }, [user, savedStateJSON]);

    const getValidMoves = useCallback((player: Player, roll: number, state: GameState): number[] => {
        const moves: number[] = [];
        const playerPieces = state[player];
        const opponentPiecesPos = (player === 'green' ? state.red : state.green).filter(p => p.state === 'active').map(p => p.pos);

        playerPieces.forEach((piece, index) => {
            if (piece.state === 'home') {
                if (roll === 6) moves.push(index);
            } else if (piece.state === 'active') {
                 // Check if destination is blocked by own pieces
                const newPos = piece.pos >= 52 ? piece.pos + roll : (piece.pos + roll) % 52;
                const isBlockedBySelf = playerPieces.some(p => p.state === 'active' && p.pos === newPos);
                if (isBlockedBySelf) return;

                // Move into home stretch
                if (player === 'green' && piece.pos <= GATE_ENTRIES.green && piece.pos + roll > GATE_ENTRIES.green) {
                    const stepsIntoHome = (piece.pos + roll) - GATE_ENTRIES.green;
                    if (stepsIntoHome <= 6) moves.push(index);
                } else if (player === 'red' && piece.pos <= GATE_ENTRIES.red && piece.pos + roll > GATE_ENTRIES.red) {
                    const stepsIntoHome = (piece.pos + roll) - GATE_ENTRIES.red;
                    if (stepsIntoHome <= 6) moves.push(index);
                }
                // Move within home stretch
                else if (piece.pos >= HOME_STRETCH_STARTS[player] && piece.pos + roll <= HOME_STRETCH_STARTS[player] + 5) {
                    moves.push(index);
                }
                // Regular move on main track
                else if (piece.pos < 52) {
                    moves.push(index);
                }
            }
        });
        return moves;
    }, []);

    const applyMove = (player: Player, pieceIndex: number, roll: number) => {
        const newGameState = JSON.parse(JSON.stringify(gameState));
        const piece = newGameState[player][pieceIndex];

        if (piece.state === 'home' && roll === 6) {
            piece.state = 'active';
            piece.pos = PLAYER_STARTS[player];
        } else if (piece.state === 'active') {
            // Home stretch transition logic
            if (player === 'green' && piece.pos <= GATE_ENTRIES.green && piece.pos + roll > GATE_ENTRIES.green) {
                piece.pos = HOME_STRETCH_STARTS.green + (piece.pos + roll) - GATE_ENTRIES.green - 1;
            } else if (player === 'red' && piece.pos <= GATE_ENTRIES.red && piece.pos + roll > GATE_ENTRIES.red) {
                piece.pos = HOME_STRETCH_STARTS.red + (piece.pos + roll) - GATE_ENTRIES.red - 1;
            }
            // Home stretch movement
            else if (piece.pos >= HOME_STRETCH_STARTS[player]) {
                piece.pos += roll;
            }
            // Regular track movement
            else {
                piece.pos = (piece.pos + roll) % 52;
            }
        }
        
        // Final square logic
        if ((player === 'green' && piece.pos === 57) || (player === 'red' && piece.pos === 63)) {
            piece.state = 'finished';
        }

        // Capture logic
        if (piece.pos < 52) {
            const opponent: Player = player === 'green' ? 'red' : 'green';
            newGameState[opponent].forEach((op: PieceState) => {
                if (op.state === 'active' && op.pos === piece.pos) {
                    op.state = 'home'; op.pos = -1;
                }
            });
        }
        
        setGameState(newGameState);

        if (newGameState[player].every((p: PieceState) => p.state === 'finished')) {
            setWinner(player);
            setMessage(`${player.charAt(0).toUpperCase() + player.slice(1)} wins!`);
            return;
        }

        if (roll !== 6) setTurn(player === 'green' ? 'red' : 'green');
        setDiceValue(null);
        setMovablePieces([]);
    };

    const handleRoll = () => {
        if (turn !== 'green' || isRolling || diceValue !== null) return;
        setIsRolling(true);
        setTimeout(() => {
            const roll = Math.floor(Math.random() * 6) + 1;
            setDiceValue(roll);
            setIsRolling(false);
            const validMoves = getValidMoves('green', roll, gameState);
            if (validMoves.length === 0) {
                setMessage(`No valid moves. AI's turn.`);
                setTimeout(() => { setTurn('red'); setDiceValue(null); }, 1500);
            } else {
                setMessage('Click a highlighted piece to move.');
                setMovablePieces(validMoves);
            }
        }, 1000);
    };

    const handlePieceClick = (pieceIndex: number) => {
        if (turn !== 'green' || !diceValue || !movablePieces.includes(pieceIndex)) return;
        applyMove('green', pieceIndex, diceValue);
    };

    const handleAiTurn = useCallback(async () => {
        if (turn !== 'red' || winner) return;
        setMessage("AI is rolling...");
        setIsRolling(true);
        await new Promise(res => setTimeout(res, 500));
        const roll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(roll);
        setIsRolling(false);
        
        const validMoves = getValidMoves('red', roll, gameState);
        if (validMoves.length === 0) {
            setMessage("AI has no moves. Your turn.");
            setTimeout(() => { setTurn('green'); setDiceValue(null); }, 1000);
            return;
        }
        
        setMessage("AI is thinking...");
        const prompt = `You are a Ludo expert playing as red.
        - Your pieces are ${JSON.stringify(gameState.red)}.
        - Opponent's (green) pieces are ${JSON.stringify(gameState.green)}.
        - Position -1 is home. 0-51 is main track. 58-63 is your home stretch. 100 is finished. Your start is 26.
        - You rolled a ${roll}.
        - Your valid moves are for pieces with these indices: [${validMoves.join(', ')}].
        - Choose the best piece index to move for a strategic advantage (prioritize capturing, moving pieces out of home, and getting pieces to the finish). Respond with a JSON object containing the chosen "pieceIndex".`;
        const schema = { type: Type.OBJECT, properties: { pieceIndex: { type: Type.INTEGER } }, required: ["pieceIndex"] };

        try {
            const res = await getAiResponse(prompt, schema);
            const chosenIndex = validMoves.includes(res.pieceIndex) ? res.pieceIndex : validMoves[0];
            await new Promise(res => setTimeout(res, 200));
            applyMove('red', chosenIndex, roll);
        } catch(e) {
            console.error("AI Error, making random move", e);
            applyMove('red', validMoves[Math.floor(Math.random() * validMoves.length)], roll);
        }
    }, [turn, winner, gameState, getValidMoves]);

    useEffect(() => {
        if (isGameReady && turn === 'red' && !winner && diceValue === null) {
            const timer = setTimeout(handleAiTurn, 500);
            return () => clearTimeout(timer);
        }
    }, [isGameReady, turn, winner, diceValue, handleAiTurn]);
    
    useEffect(() => {
        if (winner && user) {
            const timePlayed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            updateUserStats('ludo', winner === 'green' ? 'win' : 'loss', timePlayed);
            clearSavedGame('ludo');
        }
    }, [winner, user, updateUserStats, clearSavedGame]);
    
    const getPieceStyle = (player: Player, piece: PieceState, pieceIndex: number): React.CSSProperties => {
        let coords = { r: 0, c: 0 };
        if (piece.state === 'home') {
            const homeCoords = {
                green: [{ r: 10, c: 1 }, { r: 10, c: 4 }, { r: 13, c: 1 }, { r: 13, c: 4 }],
                red: [{ r: 1, c: 10 }, { r: 1, c: 13 }, { r: 4, c: 10 }, { r: 4, c: 13 }],
                yellow: [{ r: 1, c: 1 }, { r: 1, c: 4 }, { r: 4, c: 1 }, { r: 4, c: 4 }],
                blue: [{ r: 10, c: 10 }, { r: 10, c: 13 }, { r: 13, c: 10 }, { r: 13, c: 13 }],
            };
            coords = homeCoords[player][pieceIndex];
        } else if (piece.state === 'finished') {
             const finishCoords = {
                green: { r: 7, c: 6 }, red: { r: 6, c: 7 },
                yellow: { r: 6, c: 7 }, blue: { r: 7, c: 6 }
            };
            coords = finishCoords[player];
        }
        else {
            coords = PATH_COORDS[piece.pos];
        }

        return {
            gridRowStart: coords.r + 1,
            gridColumnStart: coords.c + 1,
            transform: `translate(0, 0)`
        };
    };

    const renderBoard = () => {
        const boardCells = Array.from({ length: 15 * 15 });
        const safeSquares = [0, 8, 13, 21, 26, 34, 39, 47];

        const piecesOnBoard = (Object.keys(gameState) as Player[]).flatMap(player =>
            gameState[player]
                .map((piece, index) => ({ player, piece, index }))
                .filter(({ piece }) => piece.state !== 'finished')
        );
        
        const occupancy: { [key: string]: { player: Player, index: number }[] } = {};
        piecesOnBoard.forEach(({player, piece, index}) => {
            if (piece.pos !== -1) {
                const key = `${piece.pos}`;
                if (!occupancy[key]) occupancy[key] = [];
                occupancy[key].push({player, index});
            }
        });
        
        return (
            <div className="w-full aspect-square bg-brand-secondary p-2 rounded-md">
                <div className="grid grid-cols-[repeat(15,1fr)] grid-rows-[repeat(15,1fr)] w-full h-full relative">
                    {/* Color Bases */}
                    <div className="col-start-1 col-span-6 row-start-1 row-span-6 bg-yellow-400 p-2"><div className="w-full h-full bg-yellow-200/50 rounded-md"/></div>
                    <div className="col-start-10 col-span-6 row-start-1 row-span-6 bg-red-500 p-2"><div className="w-full h-full bg-red-300/50 rounded-md"/></div>
                    <div className="col-start-1 col-span-6 row-start-10 row-span-6 bg-green-500 p-2"><div className="w-full h-full bg-green-300/50 rounded-md"/></div>
                    <div className="col-start-10 col-span-6 row-start-10 row-span-6 bg-blue-500 p-2"><div className="w-full h-full bg-blue-300/50 rounded-md"/></div>
                    
                    {/* Center Finish Area */}
                    <div className="col-start-7 col-span-3 row-start-7 row-span-3 bg-brand-primary flex items-center justify-center">
                        <div className="w-full h-full transform rotate-45">
                            <div className="w-1/2 h-1/2 float-left bg-green-500"></div>
                            <div className="w-1/2 h-1/2 float-left bg-yellow-400"></div>
                            <div className="w-1/2 h-1/2 float-left bg-blue-500"></div>
                            <div className="w-1/2 h-1/2 float-left bg-red-500"></div>
                        </div>
                    </div>
                    
                    {/* Paths */}
                    {Object.entries(PATH_COORDS).map(([pos, { r, c }]) => {
                         const isSafe = safeSquares.includes(parseInt(pos));
                         return <div key={pos} style={{ gridRow: r + 1, gridColumn: c + 1 }} className="bg-brand-light/90 border border-brand-secondary/30 flex items-center justify-center">{isSafe && <span className="text-xl text-brand-secondary">★</span>}</div>
                    })}
                    
                     {/* Pieces */}
                    {piecesOnBoard.map(({ player, piece, index }) => {
                        const style = getPieceStyle(player, piece, index);
                        const isMovable = player === 'green' && movablePieces.includes(index);
                        const posKey = `${piece.pos}`;
                        const piecesOnSquare = occupancy[posKey] || [];
                        if (piecesOnSquare.length > 1) {
                            const size = 100 / piecesOnSquare.length;
                            const pieceIdxOnSquare = piecesOnSquare.findIndex(p => p.player === player && p.index === index);
                            style.width = `${size}%`;
                            style.height = `${size}%`;
                            style.transform = `translateX(${pieceIdxOnSquare * size}%)`;
                        }

                        return (
                            <div key={`${player}-${index}`} style={style} onClick={() => handlePieceClick(index)}
                                className={`absolute w-[6.66%] h-[6.66%] p-0.5 rounded-full transition-all duration-300 ease-in-out z-20 ${isMovable ? 'cursor-pointer animate-pulse-fast' : ''}`}>
                                <div className={`w-full h-full rounded-full ${PIECE_COLORS[player]} border-2 border-white/80 shadow-lg ${isMovable ? 'ring-2 ring-white' : ''}`} />
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    };

    const handleContinueGame = () => {
        if (savedStateJSON) {
            const saved = JSON.parse(savedStateJSON);
            setGameState(saved.gameState);
            setTurn(saved.turn);
            const timePlayedSoFar = saved.timePlayed || 0;
            startTimeRef.current = Date.now() - timePlayedSoFar * 1000;
        }
        setShowContinueModal(false);
        setIsGameReady(true);
    };

    const handleStartNewGame = () => {
        clearSavedGame('ludo');
        setGameState(createInitialState());
        setTurn('green');
        setWinner(null);
        setDiceValue(null);
        setMessage('Roll the dice to start!');
        startTimeRef.current = Date.now();
        setShowContinueModal(false);
        setIsGameReady(true);
    };
    
    const handleSaveAndExit = () => {
        if (user && !winner) {
            const timePlayed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            saveGame('ludo', JSON.stringify({ gameState, turn, timePlayed }));
        }
        onBackToLobby();
    };
    
    if (!isGameReady && user) {
        return (
             <div className="w-full max-w-xl mx-auto flex items-center justify-center h-96">
                <ContinueGameModal isOpen={showContinueModal} onContinue={handleContinueGame} onStartNew={handleStartNewGame} title="Continue Ludo?" message="Would you like to continue your saved game of Ludo?" />
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
            {renderBoard()}
             <div className="text-center h-10 flex flex-col justify-center items-center mt-4 text-xl font-medium text-brand-light">{message}</div>
            <div className="flex justify-around items-center mt-4">
                <Dice value={diceValue} isRolling={isRolling} />
                <button onClick={handleRoll} disabled={turn !== 'green' || isRolling || winner !== null || diceValue !== null} className="bg-brand-accent text-brand-primary font-bold py-3 px-8 text-lg rounded-md hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Roll Dice
                </button>
            </div>
             {winner && <button onClick={handleStartNewGame} className="w-full mt-4 bg-brand-accent text-brand-primary font-bold py-2 px-6 rounded-md hover:bg-opacity-80 transition-colors duration-300">Play Again</button>}
        </div>
    );
};

export default LudoGame;