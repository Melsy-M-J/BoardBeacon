import React, { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { GameComponentProps } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';
import ContinueGameModal from '../../components/ContinueGameModal';
import Dice from '../../components/Dice';

const SNAKES_LADDERS_MAP: Record<number, number> = {
  4: 14, 9: 31, 17: 7, 20: 38, 28: 84, 40: 59, 51: 67, 54: 34, 62: 19, 63: 81, 64: 60, 71: 91, 87: 24, 93: 73, 95: 75, 99: 78,
};
const WIN_SQUARE = 100;

const Ladder: React.FC<{ startCoords: { x: number; y: number }, endCoords: { x: number; y: number } }> = ({ startCoords, endCoords }) => {
    const dx = endCoords.x - startCoords.x;
    const dy = endCoords.y - startCoords.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    const railOffset = 5;
    const numRungs = Math.floor(length / 15);

    const perpDx = -dy / length;
    const perpDy = dx / length;

    const rail1StartX = startCoords.x + perpDx * railOffset;
    const rail1StartY = startCoords.y + perpDy * railOffset;
    const rail1EndX = endCoords.x + perpDx * railOffset;
    const rail1EndY = endCoords.y + perpDy * railOffset;

    const rail2StartX = startCoords.x - perpDx * railOffset;
    const rail2StartY = startCoords.y - perpDy * railOffset;
    const rail2EndX = endCoords.x - perpDx * railOffset;
    const rail2EndY = endCoords.y - perpDy * railOffset;

    const rungs = [];
    for (let i = 1; i <= numRungs; i++) {
        const ratio = i / (numRungs + 1);
        const rungX1 = rail1StartX + (rail1EndX - rail1StartX) * ratio;
        const rungY1 = rail1StartY + (rail1EndY - rail1StartY) * ratio;
        const rungX2 = rail2StartX + (rail2EndX - rail2StartX) * ratio;
        const rungY2 = rail2StartY + (rail2EndY - rail2StartY) * ratio;
        rungs.push(<line key={i} x1={rungX1} y1={rungY1} x2={rungX2} y2={rungY2} stroke="#a16207" strokeWidth="3" />);
    }

    return (
        <g className="drop-shadow-md">
            <line x1={rail1StartX} y1={rail1StartY} x2={rail1EndX} y2={rail1EndY} stroke="#854d0e" strokeWidth="4" strokeLinecap="round" />
            <line x1={rail2StartX} y1={rail2StartY} x2={rail2EndX} y2={rail2EndY} stroke="#854d0e" strokeWidth="4" strokeLinecap="round" />
            {rungs}
        </g>
    );
};

const Snake: React.FC<{ start: number, end: number, startCoords: { x: number; y: number }, endCoords: { x: number; y: number } }> = ({ start, end, startCoords, endCoords }) => {
    const dx = endCoords.x - startCoords.x;
    const dy = endCoords.y - startCoords.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    const midX = startCoords.x + dx * 0.5;
    const midY = startCoords.y + dy * 0.5;
    const perpDx = -dy / length;
    const perpDy = dx / length;
    const curveDirection = (start + end) % 2 === 0 ? 1 : -1;
    const curveAmount = Math.max(30, length / 4) * curveDirection;
    const controlX = midX + perpDx * curveAmount;
    const controlY = midY + perpDy * curveAmount;

    const pathData = `M ${startCoords.x} ${startCoords.y} Q ${controlX} ${controlY} ${endCoords.x} ${endCoords.y}`;

    const headSize = 10;
    const angle = Math.atan2(endCoords.y - controlY, endCoords.x - controlX);
    const eye1X = endCoords.x - headSize * 0.4 * Math.cos(angle - Math.PI / 4);
    const eye1Y = endCoords.y - headSize * 0.4 * Math.sin(angle - Math.PI / 4);
    const eye2X = endCoords.x - headSize * 0.4 * Math.cos(angle + Math.PI / 4);
    const eye2Y = endCoords.y - headSize * 0.4 * Math.sin(angle + Math.PI / 4);

    return (
        <g className="drop-shadow-md">
            <path d={pathData} stroke="#ef4444" strokeWidth="12" fill="none" strokeLinecap="round" />
            <path d={pathData} stroke="#dc2626" strokeWidth="6" fill="none" strokeLinecap="round" />
            <circle cx={endCoords.x} cy={endCoords.y} r={headSize * 0.7} fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
            <circle cx={eye1X} cy={eye1Y} r="1.5" fill="white" />
            <circle cx={eye2X} cy={eye2Y} r="1.5" fill="white" />
        </g>
    );
};

const SvgOverlay: React.FC<{ map: Map<number, { row: number, col: number }> }> = ({ map }) => {
    const getCoords = (square: number) => {
        const coords = map.get(square);
        if (!coords) return { x: 0, y: 0 };
        const { row, col } = coords;
        return { x: col * 50 + 25, y: row * 50 + 25 }; // Viewbox 0 0 500 500
    };

    return (
        <svg viewBox="0 0 500 500" className="absolute inset-0 w-full h-full pointer-events-none">
            {Object.entries(SNAKES_LADDERS_MAP).map(([startStr, end]) => {
                const start = parseInt(startStr);
                const isLadder = end > start;
                const startCoords = getCoords(start);
                const endCoords = getCoords(end);

                if (isLadder) {
                    return <Ladder key={`${start}-${end}`} startCoords={startCoords} endCoords={endCoords} />;
                } else {
                    return <Snake key={`${start}-${end}`} start={start} end={end} startCoords={startCoords} endCoords={endCoords} />;
                }
            })}
        </svg>
    );
};


const SnakesAndLaddersGame: React.FC<GameComponentProps> = ({ onBackToLobby, gameName }) => {
    const { user, updateUserStats, saveGame, clearSavedGame } = useContext(AuthContext);
    const startTimeRef = useRef<number>(Date.now());
    
    const [positions, setPositions] = useState({ player: 1, ai: 1 });
    const [turn, setTurn] = useState<'player' | 'ai'>('player');
    const [diceValue, setDiceValue] = useState<number | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
    const [message, setMessage] = useState('Your turn to roll!');

    const [showContinueModal, setShowContinueModal] = useState(false);
    const [isGameReady, setIsGameReady] = useState(false);
    const savedStateJSON = useMemo(() => user?.savedGames?.['snake-and-ladder'], [user]);

     useEffect(() => {
        if (user && savedStateJSON) setShowContinueModal(true);
        else setIsGameReady(true);
    }, [user, savedStateJSON]);

    const movePlayer = useCallback((player: 'player' | 'ai', roll: number) => {
        setPositions(prev => {
            let newPos = prev[player] + roll;
            if (newPos > WIN_SQUARE) return prev;
            if (newPos === WIN_SQUARE) {
                setWinner(player);
                setMessage(player === 'player' ? 'You reached 100! You win!' : 'AI reached 100! AI wins!');
                return { ...prev, [player]: WIN_SQUARE };
            }

            const mappedPos = SNAKES_LADDERS_MAP[newPos];
            if (mappedPos) {
                 setTimeout(() => {
                    setMessage(player === 'player' ? `You found a ${mappedPos > newPos ? 'ladder' : 'snake'}!` : `AI found a ${mappedPos > newPos ? 'ladder' : 'snake'}!`);
                    setPositions(p => ({...p, [player]: mappedPos }));
                }, 600);
            }
            return { ...prev, [player]: newPos };
        });

        if (roll !== 6) setTurn(player === 'player' ? 'ai' : 'player');
        else setMessage(player === 'player' ? 'You rolled a 6! Roll again.' : 'AI rolled a 6! Rolling again.');

    }, []);

    const handleRoll = () => {
        if (turn !== 'player' || winner || isRolling) return;
        setIsRolling(true);
        setTimeout(() => {
            const roll = Math.floor(Math.random() * 6) + 1;
            setDiceValue(roll);
            setIsRolling(false);
            setMessage(`You rolled a ${roll}!`);
            setTimeout(() => movePlayer('player', roll), 500);
        }, 1000);
    };

    const handleAiTurn = useCallback(() => {
        if (turn !== 'ai' || winner || isRolling) return;
        setIsRolling(true);
        setMessage('AI is rolling...');
        setTimeout(() => {
            const roll = Math.floor(Math.random() * 6) + 1;
            setDiceValue(roll);
            setIsRolling(false);
            setMessage(`AI rolled a ${roll}!`);
            setTimeout(() => movePlayer('ai', roll), 500);
        }, 500);
    }, [turn, winner, isRolling, movePlayer]);

    useEffect(() => {
        if (isGameReady && turn === 'ai' && !winner) {
            const timer = setTimeout(handleAiTurn, 500);
            return () => clearTimeout(timer);
        } else if (turn === 'player' && !winner) {
            setMessage('Your turn to roll!');
        }
    }, [isGameReady, turn, winner, handleAiTurn]);
    
    useEffect(() => {
        if (winner && user) {
            const timePlayed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            updateUserStats('snake-and-ladder', winner === 'player' ? 'win' : 'loss', timePlayed);
            clearSavedGame('snake-and-ladder');
        }
    }, [winner, user, updateUserStats, clearSavedGame]);

    const boardLayout = useMemo(() => {
        const map = new Map<number, { row: number; col: number }>();
        for (let i = 1; i <= 100; i++) {
            const zeroBased = i - 1;
            const rowFromBottom = Math.floor(zeroBased / 10);
            const row = 9 - rowFromBottom;
            let col = zeroBased % 10;
            if (rowFromBottom % 2 !== 0) { // RTL rows
                col = 9 - col;
            }
            map.set(i, { row, col });
        }

        const boardNumbers = Array(10).fill(0).map(() => Array(10).fill(0));
        for (const [number, { row, col }] of map.entries()) {
            boardNumbers[row][col] = number;
        }

        return { map, boardNumbers };
    }, []);

    const getPlayerPositionStyle = (position: number) => {
        const coords = boardLayout.map.get(position);
        if (!coords) return {};
        const { row, col } = coords;
        return {
            top: `${row * 10}%`,
            left: `${col * 10}%`,
            transform: 'translate(0, 0)',
        };
    };

    const renderBoard = () => {
        const playerStyle: React.CSSProperties = getPlayerPositionStyle(positions.player);
        const aiStyle: React.CSSProperties = getPlayerPositionStyle(positions.ai);

        if (positions.player === positions.ai) {
            playerStyle.transform = 'translate(-25%, -25%) scale(0.8)';
            aiStyle.transform = 'translate(25%, 25%) scale(0.8)';
        }

        return (
            <div className="relative aspect-square bg-brand-primary/50 rounded-lg shadow-inner overflow-hidden">
                <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
                    {boardLayout.boardNumbers.map((row, rIndex) =>
                        row.map((number) => (
                            <div key={number} className="border border-brand-secondary/50 flex items-center justify-center text-xs sm:text-sm font-bold text-brand-light/70">
                                {number}
                            </div>
                        ))
                    )}
                </div>
                <SvgOverlay map={boardLayout.map} />
                <div className="absolute w-[10%] h-[10%] transition-all duration-500 ease-in-out p-1 z-10" style={playerStyle}>
                    <div className="w-full h-full bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse-fast"></div>
                </div>
                <div className="absolute w-[10%] h-[10%] transition-all duration-500 ease-in-out p-1 z-10" style={aiStyle}>
                    <div className="w-full h-full bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse-fast"></div>
                </div>
            </div>
        );
    };
    
     const handleContinueGame = () => {
        if (savedStateJSON) {
            const saved = JSON.parse(savedStateJSON);
            setPositions(saved.positions);
            setTurn(saved.turn);
            const timePlayedSoFar = saved.timePlayed || 0;
            startTimeRef.current = Date.now() - timePlayedSoFar * 1000;
        }
        setShowContinueModal(false);
        setIsGameReady(true);
    };

    const handleStartNewGame = () => {
        clearSavedGame('snake-and-ladder');
        setPositions({ player: 1, ai: 1 });
        setTurn('player');
        setWinner(null);
        setDiceValue(null);
        setMessage('Your turn to roll!');
        startTimeRef.current = Date.now();
        setShowContinueModal(false);
        setIsGameReady(true);
    };

    const handleSaveAndExit = () => {
        if (user && !winner) {
            const timePlayed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            saveGame('snake-and-ladder', JSON.stringify({ positions, turn, timePlayed }));
        }
        onBackToLobby();
    };

    if (!isGameReady && user) {
        return (
             <div className="w-full max-w-xl mx-auto flex items-center justify-center h-96">
                <ContinueGameModal isOpen={showContinueModal} onContinue={handleContinueGame} onStartNew={handleStartNewGame} title="Continue Game?" message="Would you like to continue your saved game of Snakes & Ladders?" />
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
                <button onClick={handleRoll} disabled={turn !== 'player' || isRolling || winner !== null} className="bg-brand-accent text-brand-primary font-bold py-3 px-8 text-lg rounded-md hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Roll Dice
                </button>
            </div>
             {winner && <button onClick={handleStartNewGame} className="w-full mt-4 bg-brand-accent text-brand-primary font-bold py-2 px-6 rounded-md hover:bg-opacity-80 transition-colors duration-300">Play Again</button>}
        </div>
    );
};

export default SnakesAndLaddersGame;