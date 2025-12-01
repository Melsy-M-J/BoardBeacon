
import React, { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { GameComponentProps } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';
import ContinueGameModal from '../../components/ContinueGameModal';
import Dice from '../../components/Dice';
import { LudoPieceIcon } from '../../components/icons';

type Player = 'red' | 'green' | 'yellow' | 'blue';
type PieceStateVal = 'home' | 'active' | 'finished';
type PieceState = { pos: number; state: PieceStateVal }; // pos is 0-54 for main track, 100+ for home stretch
type GameState = Record<Player, PieceState[]>;

// START SQUARES (Main Track Indices)
// Corrected to correspond to the colored squares (2nd from corner)
const PLAYER_STARTS: Record<Player, number> = { 
    red: 0, green: 13, yellow: 27, blue: 41 
};

// SAFE SQUARES (Star/Globe)
// Start square + 8th square from start
const SAFE_SQUARES = [0, 8, 13, 21, 27, 35, 41, 49];

// HOME STRETCH ENTRY POINT (Index on main track where piece enters home stretch)
// This is the square typically adjacent to the home column arrow
const HOME_ENTRIES: Record<Player, number> = {
    red: 53, green: 11, yellow: 25, blue: 39
};

const PIECE_FILL_COLORS: Record<Player, string> = { 
    red: 'fill-red-600', green: 'fill-green-600', yellow: 'fill-yellow-500', blue: 'fill-blue-600' 
};

// 15x15 Grid Coordinates for Main Track (Indices 0-54)
const MAIN_PATH_COORDS: { r: number, c: number }[] = [
    // Red Start (Left Wing, Top Row) -> Right (Towards Center)
    {r:6,c:1}, {r:6,c:2}, {r:6,c:3}, {r:6,c:4}, {r:6,c:5}, // 0-4
    // Top Wing, Left Col -> Up (Away from Center)
    {r:5,c:6}, {r:4,c:6}, {r:3,c:6}, {r:2,c:6}, {r:1,c:6}, {r:0,c:6}, // 5-10
    // Top Center Cross
    {r:0,c:7}, {r:0,c:8}, // 11 (Green Home Entry), 12
    // Top Wing, Right Col -> Down (Towards Center) - Green Start at 13
    {r:1,c:8}, {r:2,c:8}, {r:3,c:8}, {r:4,c:8}, {r:5,c:8}, {r:6,c:8}, // 13-18
    // Right Wing, Top Row -> Right (Away from Center)
    {r:6,c:9}, {r:6,c:10}, {r:6,c:11}, {r:6,c:12}, {r:6,c:13}, {r:6,c:14}, // 19-24
    // Right Center Cross
    {r:7,c:14}, {r:8,c:14}, // 25 (Yellow Home Entry), 26
    // Right Wing, Bottom Row -> Left (Towards Center) - Yellow Start at 27
    {r:8,c:13}, {r:8,c:12}, {r:8,c:11}, {r:8,c:10}, {r:8,c:9}, {r:8,c:8}, // 27-32
    // Bottom Wing, Right Col -> Down (Away from Center)
    {r:9,c:8}, {r:10,c:8}, {r:11,c:8}, {r:12,c:8}, {r:13,c:8}, {r:14,c:8}, // 33-38
    // Bottom Center Cross
    {r:14,c:7}, {r:14,c:6}, // 39 (Blue Home Entry), 40
    // Bottom Wing, Left Col -> Up (Towards Center) - Blue Start at 41
    {r:13,c:6}, {r:12,c:6}, {r:11,c:6}, {r:10,c:6}, {r:9,c:6}, {r:8,c:6}, // 41-46
    // Left Wing, Bottom Row -> Left (Away from Center)
    {r:8,c:5}, {r:8,c:4}, {r:8,c:3}, {r:8,c:2}, {r:8,c:1}, {r:8,c:0}, // 47-52
    // Left Center Cross
    {r:7,c:0}, {r:6,c:0} // 53 (Red Home Entry), 54
];

const HOME_COORDS: Record<Player, { r: number, c: number }[]> = {
    red: [{r:7,c:1}, {r:7,c:2}, {r:7,c:3}, {r:7,c:4}, {r:7,c:5}, {r:7,c:6}],
    green: [{r:1,c:7}, {r:2,c:7}, {r:3,c:7}, {r:4,c:7}, {r:5,c:7}, {r:6,c:7}],
    yellow: [{r:7,c:13}, {r:7,c:12}, {r:7,c:11}, {r:7,c:10}, {r:7,c:9}, {r:7,c:8}],
    blue: [{r:13,c:7}, {r:12,c:7}, {r:11,c:7}, {r:10,c:7}, {r:9,c:7}, {r:8,c:7}],
};

const LudoGame: React.FC<GameComponentProps> = ({ onBackToLobby, gameName }) => {
    const { user, updateUserStats, saveGame, clearSavedGame } = useContext(AuthContext);
    const startTimeRef = useRef<number>(Date.now());
    
    const createInitialState = (): GameState => ({
        red: Array(4).fill(null).map(() => ({ pos: -1, state: 'home' })),
        green: Array(4).fill(null).map(() => ({ pos: -1, state: 'home' })),
        yellow: Array(4).fill(null).map(() => ({ pos: -1, state: 'home' })),
        blue: Array(4).fill(null).map(() => ({ pos: -1, state: 'home' })),
    });

    const [gameState, setGameState] = useState<GameState>(createInitialState());
    const [turn, setTurn] = useState<Player>('red');
    const [diceValue, setDiceValue] = useState<number | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [winner, setWinner] = useState<Player | null>(null);
    const [message, setMessage] = useState('Roll the dice to start!');
    const [movablePieces, setMovablePieces] = useState<number[]>([]); // Indices of current player's pieces

    const [showContinueModal, setShowContinueModal] = useState(false);
    const [isGameReady, setIsGameReady] = useState(false);
    const savedStateJSON = useMemo(() => user?.savedGames?.ludo, [user]);

    useEffect(() => {
        if (user && savedStateJSON) setShowContinueModal(true);
        else setIsGameReady(true);
    }, [user, savedStateJSON]);

    // Check for blockades (2 pieces of same color on same square)
    // Returns true if a blockade exists at pos formed by any OTHER player
    const isBlockaded = useCallback((pos: number, currentPlayer: Player, state: GameState): boolean => {
        const opponents = (['red', 'green', 'yellow', 'blue'] as Player[]).filter(p => p !== currentPlayer);
        for (const op of opponents) {
            const count = state[op].filter(p => p.state === 'active' && p.pos === pos).length;
            if (count >= 2) return true;
        }
        return false;
    }, []);

    const getValidMoves = useCallback((player: Player, roll: number, state: GameState): number[] => {
        const moves: number[] = [];
        const playerPieces = state[player];
        const entryPoint = HOME_ENTRIES[player];
        const startPoint = PLAYER_STARTS[player];

        playerPieces.forEach((piece, index) => {
            if (piece.state === 'finished') return;

            // Enter board rule
            if (piece.state === 'home') {
                if (roll === 6) {
                    // Can only enter if start square isn't blockaded by opponents
                    if (!isBlockaded(startPoint, player, state)) {
                         moves.push(index);
                    }
                }
                return;
            }

            // Active piece movement
            let currentPos = piece.pos;
            
            let simPos = currentPos;
            let blocked = false;

            for (let i = 1; i <= roll; i++) {
                // If currently in home stretch
                if (simPos >= 100) {
                    simPos++;
                    if (simPos > 105) { // Overshot home (105 is the goal index 5)
                        blocked = true; 
                        break; 
                    }
                } else {
                    // Main track
                    // Check if we are entering home stretch
                    if (simPos === entryPoint) {
                        simPos = 100; // Enter home stretch index 0
                    } else {
                        simPos = (simPos + 1) % 55; // Modulo 55 for 55 squares
                    }

                    // Check blockade on this step
                    if (simPos < 100 && isBlockaded(simPos, player, state)) {
                        blocked = true;
                        break;
                    }
                }
            }

            if (!blocked) moves.push(index);
        });
        return moves;
    }, [isBlockaded]);

    const applyMove = (player: Player, pieceIndex: number, roll: number) => {
        setIsAnimating(true);
        setMessage('');
        const newState = JSON.parse(JSON.stringify(gameState));
        const piece = newState[player][pieceIndex];
        
        // Internal Move Logic
        const entryPoint = HOME_ENTRIES[player];
        const startPoint = PLAYER_STARTS[player];
        
        let newPos = piece.pos;
        let enteredBoard = false;

        if (piece.state === 'home') {
            newPos = startPoint;
            enteredBoard = true;
            piece.state = 'active';
        } else {
            // Move step by step
            for (let i = 0; i < roll; i++) {
                 if (newPos >= 100) {
                     newPos++;
                 } else if (newPos === entryPoint) {
                     newPos = 100;
                 } else {
                     newPos = (newPos + 1) % 55;
                 }
            }
        }
        
        // Capture Logic
        let captured = false;
        if (!enteredBoard && newPos < 100 && !SAFE_SQUARES.includes(newPos)) {
            const opponents = (['red', 'green', 'yellow', 'blue'] as Player[]).filter(p => p !== player);
            for (const op of opponents) {
                const opPieces = newState[op].filter((p: PieceState) => p.state === 'active' && p.pos === newPos);
                // If exactly 1 opponent piece, capture it (Blockades of 2+ are safe from capture)
                if (opPieces.length === 1) {
                    // Find index
                    const opIndex = newState[op].findIndex((p: PieceState) => p.state === 'active' && p.pos === newPos);
                    if (opIndex !== -1) {
                        newState[op][opIndex] = { pos: -1, state: 'home' };
                        captured = true;
                        setMessage("Captured!");
                    }
                }
            }
        }

        piece.pos = newPos;
        
        // Check Finish
        if (newPos === 105) {
            piece.state = 'finished';
            setMessage("Piece Finished!");
        }
        
        setGameState(newState);
        
        setTimeout(() => {
            // Check Win
            if (newState[player].every((p: PieceState) => p.state === 'finished')) {
                setWinner(player);
                setMessage(`${player.toUpperCase()} WINS!`);
                setIsAnimating(false);
                return;
            }
            
            // Turn Logic
            // Bonus turn if 6 rolled, captured piece, or finished piece
            const finished = newPos === 105;
            if (roll === 6 || captured || finished) {
                // Same player rolls again
                setDiceValue(null);
                setMovablePieces([]);
                setMessage(roll === 6 ? "Rolled a 6! Roll again." : "Bonus turn!");
            } else {
                // Next player
                const order: Player[] = ['red', 'green', 'yellow', 'blue']; // Clockwise
                const nextIdx = (order.indexOf(player) + 1) % 4;
                setTurn(order[nextIdx]);
                setDiceValue(null);
                setMovablePieces([]);
            }
            setIsAnimating(false);
        }, 600);
    };

    const handleRoll = () => {
        if (isRolling || diceValue !== null || winner || isAnimating) return;
        setIsRolling(true);
        setTimeout(() => {
            const roll = Math.floor(Math.random() * 6) + 1;
            setDiceValue(roll);
            setIsRolling(false);
            
            const moves = getValidMoves(turn, roll, gameState);
            if (moves.length === 0) {
                setMessage(`Rolled ${roll}. No moves.`);
                setTimeout(() => {
                    const order: Player[] = ['red', 'green', 'yellow', 'blue'];
                    setTurn(order[(order.indexOf(turn) + 1) % 4]);
                    setDiceValue(null);
                    setMessage("");
                }, 1000);
            } else {
                setMovablePieces(moves);
                setMessage("Select a piece to move.");
                
                // Auto-move if only 1 move available and it's AI (or user convenience)
                // For now, let user click.
            }
        }, 500);
    };

    // AI Logic placeholder
    useEffect(() => {
        if (isGameReady && turn !== 'red' && !winner && diceValue === null && !isRolling && !isAnimating) {
             const timer = setTimeout(handleRoll, 1000); // AI rolls
             return () => clearTimeout(timer);
        }
        
        if (isGameReady && turn !== 'red' && diceValue !== null && !isRolling && !isAnimating && movablePieces.length > 0) {
            // AI Select Move
            const timer = setTimeout(() => {
                // Simple AI: prioritize capture, then finish, then home exit
                const randIndex = Math.floor(Math.random() * movablePieces.length);
                applyMove(turn, movablePieces[randIndex], diceValue);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isGameReady, turn, winner, diceValue, isRolling, movablePieces, isAnimating]);

    const handlePieceClick = (player: Player, index: number) => {
        if (turn !== player || !movablePieces.includes(index) || isAnimating) return;
        applyMove(player, index, diceValue!);
    };
    
    // Save/Load
    const handleSaveAndExit = () => {
        if (user && !winner) {
            const timePlayed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            saveGame('ludo', JSON.stringify({ gameState, turn, timePlayed }));
        }
        onBackToLobby();
    };

    const handleContinueGame = () => {
        if (savedStateJSON) {
            const saved = JSON.parse(savedStateJSON);
            setGameState(saved.gameState); setTurn(saved.turn);
            startTimeRef.current = Date.now() - (saved.timePlayed || 0) * 1000;
        }
        setShowContinueModal(false); setIsGameReady(true);
    };

    const handleStartNewGame = () => {
        clearSavedGame('ludo'); setGameState(createInitialState()); setTurn('red'); setWinner(null);
        setDiceValue(null); setMessage('Roll the dice to start!'); startTimeRef.current = Date.now();
        setShowContinueModal(false); setIsGameReady(true);
    };

    // Rendering Helpers
    const getSquarePieces = (pos: number, isHomeStretch: boolean) => {
        const pieces: { player: Player, index: number }[] = [];
        (['red', 'green', 'yellow', 'blue'] as Player[]).forEach(p => {
            gameState[p].forEach((piece, idx) => {
                if (piece.state === 'active') {
                    if (isHomeStretch) {
                         // Check if this piece is in home stretch at correct index
                    } else if (piece.pos === pos && piece.pos < 100) {
                        pieces.push({ player: p, index: idx });
                    }
                }
            });
        });
        return pieces;
    };
    
    // UI Render
    if (!isGameReady && user) {
        return (
             <div className="w-full max-w-xl mx-auto flex items-center justify-center h-96">
                <ContinueGameModal isOpen={showContinueModal} onContinue={handleContinueGame} onStartNew={handleStartNewGame} title="Continue Ludo?" message="Resume your game?" />
                {!showContinueModal && <p className="text-brand-light">Loading...</p>}
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl mx-auto bg-brand-primary p-4 rounded-lg shadow-2xl animate-fade-in select-none">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold text-brand-light">{gameName}</h2>
                <div>
                    {user && !winner && <button onClick={handleSaveAndExit} className="text-sm bg-brand-secondary text-brand-light hover:bg-brand-accent hover:text-brand-primary font-medium py-1 px-3 rounded-md mr-2">Save</button>}
                    <button onClick={onBackToLobby} className="text-sm text-brand-accent hover:underline">Exit</button>
                </div>
            </div>

            {/* BOARD */}
            <div className="w-full aspect-square bg-white border-4 border-gray-800 rounded-lg relative shadow-2xl overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-15 grid-rows-15">
                    {/* Render Main Track Squares */}
                    {MAIN_PATH_COORDS.map((coord, idx) => {
                        const isSafe = SAFE_SQUARES.includes(idx);
                        // Determine Color
                        let bgClass = "bg-white";
                        if (idx === PLAYER_STARTS.red) bgClass = "bg-red-500";
                        if (idx === PLAYER_STARTS.green) bgClass = "bg-green-500";
                        if (idx === PLAYER_STARTS.yellow) bgClass = "bg-yellow-400";
                        if (idx === PLAYER_STARTS.blue) bgClass = "bg-blue-500";
                        
                        // Find pieces on this square
                        const piecesHere = getSquarePieces(idx, false);
                        
                        return (
                            <div key={idx} className={`border border-black/20 ${bgClass} relative flex items-center justify-center`}
                                style={{ gridRow: coord.r + 1, gridColumn: coord.c + 1 }}>
                                {isSafe && !piecesHere.length && <span className="text-black/20 text-xs">★</span>}
                                {piecesHere.map((p, i) => {
                                    const isMovable = p.player === turn && movablePieces.includes(p.index);
                                    // Stack offset
                                    const offset = piecesHere.length > 1 ? (i * 4) - ((piecesHere.length - 1) * 2) : 0;
                                    return (
                                        <div key={`${p.player}-${p.index}`} 
                                            onClick={() => handlePieceClick(p.player, p.index)}
                                            className={`absolute w-[70%] h-[70%] transition-transform duration-300 z-10 ${isMovable ? 'cursor-pointer animate-bounce' : ''}`}
                                            style={{ transform: `translate(${offset}px, ${-offset}px)` }}
                                        >
                                             <LudoPieceIcon className={`w-full h-full ${PIECE_FILL_COLORS[p.player]} drop-shadow-md stroke-black`} />
                                        </div>
                                    )
                                })}
                            </div>
                        );
                    })}
                    
                    {/* Render Home Stretches */}
                    {(['red', 'green', 'yellow', 'blue'] as Player[]).map(p => (
                        HOME_COORDS[p].map((coord, i) => {
                            const bgClass = p === 'red' ? 'bg-red-500' : p === 'green' ? 'bg-green-500' : p === 'yellow' ? 'bg-yellow-400' : 'bg-blue-500';
                            
                            // Check pieces in home stretch
                            // Internal pos 100+i
                            const piecesHere = gameState[p].map((piece, idx) => ({ piece, idx }))
                                .filter(item => item.piece.state === 'active' && item.piece.pos === 100 + i);

                            return (
                                <div key={`${p}-home-${i}`} className={`border border-black/20 ${bgClass} relative flex items-center justify-center`}
                                    style={{ gridRow: coord.r + 1, gridColumn: coord.c + 1 }}>
                                     {piecesHere.map(({ piece, idx }, k) => {
                                        const isMovable = p === turn && movablePieces.includes(idx);
                                        const offset = piecesHere.length > 1 ? (k * 4) - ((piecesHere.length - 1) * 2) : 0;
                                        return (
                                            <div key={`${p}-${idx}`} 
                                                onClick={() => handlePieceClick(p, idx)}
                                                className={`absolute w-[70%] h-[70%] transition-transform duration-300 z-10 ${isMovable ? 'cursor-pointer animate-bounce' : ''}`}
                                                style={{ transform: `translate(${offset}px, ${-offset}px)` }}
                                            >
                                                <LudoPieceIcon className={`w-full h-full ${PIECE_FILL_COLORS[p]} drop-shadow-md stroke-white`} />
                                            </div>
                                        )
                                     })}
                                </div>
                            )
                        })
                    ))}

                    {/* Bases */}
                    <div className="row-start-1 row-span-6 col-start-1 col-span-6 bg-red-600 p-4 border-r-2 border-b-2 border-black/20 relative">
                        <div className="w-full h-full bg-white rounded-xl flex flex-wrap p-4 content-center justify-center gap-4">
                            {gameState.red.map((piece, idx) => (
                                piece.state === 'home' && <div key={idx} onClick={() => handlePieceClick('red', idx)} className={`w-10 h-10 rounded-full border-4 border-red-600 bg-red-600 shadow-md ${turn === 'red' && movablePieces.includes(idx) ? 'animate-pulse cursor-pointer ring-4 ring-yellow-400' : ''}`}></div>
                            ))}
                        </div>
                    </div>
                    <div className="row-start-1 row-span-6 col-start-10 col-span-6 bg-green-600 p-4 border-l-2 border-b-2 border-black/20 relative">
                         <div className="w-full h-full bg-white rounded-xl flex flex-wrap p-4 content-center justify-center gap-4">
                            {gameState.green.map((piece, idx) => (
                                piece.state === 'home' && <div key={idx} onClick={() => handlePieceClick('green', idx)} className={`w-10 h-10 rounded-full border-4 border-green-600 bg-green-600 shadow-md ${turn === 'green' && movablePieces.includes(idx) ? 'animate-pulse cursor-pointer ring-4 ring-yellow-400' : ''}`}></div>
                            ))}
                        </div>
                    </div>
                    <div className="row-start-10 row-span-6 col-start-1 col-span-6 bg-blue-600 p-4 border-r-2 border-t-2 border-black/20 relative">
                         <div className="w-full h-full bg-white rounded-xl flex flex-wrap p-4 content-center justify-center gap-4">
                            {gameState.blue.map((piece, idx) => (
                                piece.state === 'home' && <div key={idx} onClick={() => handlePieceClick('blue', idx)} className={`w-10 h-10 rounded-full border-4 border-blue-600 bg-blue-600 shadow-md ${turn === 'blue' && movablePieces.includes(idx) ? 'animate-pulse cursor-pointer ring-4 ring-yellow-400' : ''}`}></div>
                            ))}
                        </div>
                    </div>
                    <div className="row-start-10 row-span-6 col-start-10 col-span-6 bg-yellow-500 p-4 border-l-2 border-t-2 border-black/20 relative">
                        <div className="w-full h-full bg-white rounded-xl flex flex-wrap p-4 content-center justify-center gap-4">
                            {gameState.yellow.map((piece, idx) => (
                                piece.state === 'home' && <div key={idx} onClick={() => handlePieceClick('yellow', idx)} className={`w-10 h-10 rounded-full border-4 border-yellow-500 bg-yellow-500 shadow-md ${turn === 'yellow' && movablePieces.includes(idx) ? 'animate-pulse cursor-pointer ring-4 ring-red-400' : ''}`}></div>
                            ))}
                        </div>
                    </div>

                    {/* Center Goal */}
                    <div className="row-start-7 row-span-3 col-start-7 col-span-3 relative">
                        {/* Triangles */}
                        <div className="absolute inset-0 bg-white"></div>
                        <div className="absolute top-0 left-0 w-full h-full bg-green-600" style={{clipPath: 'polygon(0 0, 100% 0, 50% 50%)'}}></div>
                        <div className="absolute top-0 left-0 w-full h-full bg-yellow-400" style={{clipPath: 'polygon(100% 0, 100% 100%, 50% 50%)'}}></div>
                        <div className="absolute top-0 left-0 w-full h-full bg-blue-600" style={{clipPath: 'polygon(0 100%, 100% 100%, 50% 50%)'}}></div>
                        <div className="absolute top-0 left-0 w-full h-full bg-red-600" style={{clipPath: 'polygon(0 0, 0 100%, 50% 50%)'}}></div>
                        
                        {/* Finished Pieces */}
                        {/* Red finished (Left Triangle) */}
                         <div className="absolute left-[10%] top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20">
                            {gameState.red.filter(p => p.state === 'finished').map((_, i) => (
                                <LudoPieceIcon key={i} className="w-4 h-4 fill-white stroke-black" />
                            ))}
                        </div>
                        {/* Green finished (Top) */}
                        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 flex gap-1 z-20">
                            {gameState.green.filter(p => p.state === 'finished').map((_, i) => (
                                <LudoPieceIcon key={i} className="w-4 h-4 fill-white stroke-black" />
                            ))}
                        </div>
                        {/* Yellow finished (Right) */}
                        <div className="absolute right-[10%] top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20">
                            {gameState.yellow.filter(p => p.state === 'finished').map((_, i) => (
                                <LudoPieceIcon key={i} className="w-4 h-4 fill-white stroke-black" />
                            ))}
                        </div>
                        {/* Blue finished (Bottom) */}
                        <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 flex gap-1 z-20">
                            {gameState.blue.filter(p => p.state === 'finished').map((_, i) => (
                                <LudoPieceIcon key={i} className="w-4 h-4 fill-white stroke-black" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Controls */}
             <div className="text-center h-8 flex flex-col justify-center items-center mt-4 text-xl font-bold text-brand-accent animate-pulse">{message}</div>
            
            <div className="flex justify-between items-center mt-4 bg-brand-secondary p-4 rounded-lg">
                <div className="flex flex-col items-center">
                    <span className="text-brand-light font-bold mb-2">Turn</span>
                    <div className={`px-4 py-1 rounded-full text-white font-bold capitalize ${turn === 'red' ? 'bg-red-600' : turn === 'green' ? 'bg-green-600' : turn === 'yellow' ? 'bg-yellow-500' : 'bg-blue-600'}`}>
                        {turn}
                    </div>
                </div>
                
                <div className="flex flex-col items-center">
                    <Dice value={diceValue} isRolling={isRolling} />
                </div>
                
                <button 
                    onClick={handleRoll} 
                    disabled={turn !== 'red' || isRolling || winner !== null || diceValue !== null || isAnimating}
                    className={`px-6 py-3 rounded-lg font-bold shadow-lg transition-transform active:scale-95 ${turn === 'red' && !isRolling && !diceValue ? 'bg-brand-accent text-brand-primary hover:bg-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                >
                    ROLL
                </button>
            </div>
            
             {winner && <button onClick={handleStartNewGame} className="w-full mt-4 bg-brand-accent text-brand-primary font-bold py-3 px-6 rounded-md hover:bg-opacity-80 transition-colors shadow-xl">New Game</button>}
             
             {/* Styles for grid */}
             <style>{`
                 .grid-cols-15 { grid-template-columns: repeat(15, minmax(0, 1fr)); }
                 .grid-rows-15 { grid-template-rows: repeat(15, minmax(0, 1fr)); }
             `}</style>
        </div>
    );
};

export default LudoGame;
