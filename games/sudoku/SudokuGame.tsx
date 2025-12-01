
import React, { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { GameComponentProps } from '../../types';
import { getAiResponse } from '../../services/geminiService';
import { AuthContext } from '../../contexts/AuthContext';
import ContinueGameModal from '../../components/ContinueGameModal';
import { Type } from '@google/genai';

type Difficulty = 'Easy' | 'Medium' | 'Hard';
type GridSize = 4 | 6 | 9;
type Grid = (number | null)[][];

const SudokuGame: React.FC<GameComponentProps> = ({ onBackToLobby, gameName }) => {
    const { user, updateUserStats, saveGame, clearSavedGame } = useContext(AuthContext);
    const startTimeRef = useRef<number>(Date.now());

    const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
    const [gridSize, setGridSize] = useState<GridSize>(9);
    const [grid, setGrid] = useState<Grid>([]);
    const [initialGrid, setInitialGrid] = useState<Grid>([]);
    const [solution, setSolution] = useState<Grid>([]);
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGameWon, setIsGameWon] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    const [showContinueModal, setShowContinueModal] = useState(false);
    const [isGameReady, setIsGameReady] = useState(false);
    
    const savedStateJSON = useMemo(() => user?.savedGames?.sudoku, [user]);

    useEffect(() => {
        if (user && savedStateJSON) {
            setShowContinueModal(true);
        } else {
            setIsGameReady(true);
        }
    }, [user, savedStateJSON]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isPlaying && !isGameWon && !isLoading) {
            interval = setInterval(() => {
                const now = Date.now();
                const diff = Math.floor((now - startTimeRef.current) / 1000);
                setElapsedTime(diff);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, isGameWon, isLoading]);

    const generateNewPuzzle = useCallback(async (selectedSize: GridSize, selectedDifficulty: Difficulty) => {
        setIsLoading(true);
        setStatusMessage(`Generating a new ${selectedSize}x${selectedSize} ${selectedDifficulty.toLowerCase()} puzzle...`);
        // Initialize empty grid to prevent render errors during loading
        setGrid(Array(selectedSize).fill(null).map(() => Array(selectedSize).fill(null)));
        
        let prompt = `Generate a ${selectedSize}x${selectedSize} Sudoku puzzle and its complete solution. The difficulty should be '${selectedDifficulty}'.`;
        if (selectedSize === 6) {
             prompt += " The puzzle must use 2x3 subgrids (2 rows, 3 columns).";
        }
        prompt += `
        Provide the response as a JSON object with two keys: "puzzle" and "solution".
        The "puzzle" should be a ${selectedSize}x${selectedSize} grid where empty cells are represented by 'null'.
        The "solution" should be the fully solved ${selectedSize}x${selectedSize} grid.`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                puzzle: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER, nullable: true } } },
                solution: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } }
            },
            required: ["puzzle", "solution"]
        };

        try {
            const response = await getAiResponse(prompt, schema);
            setGrid(response.puzzle);
            setInitialGrid(response.puzzle);
            setSolution(response.solution);
            setStatusMessage('New puzzle generated! Good luck.');
            setIsGameWon(false);
            setElapsedTime(0);
            startTimeRef.current = Date.now();
            setIsPlaying(true);
        } catch (error) {
            console.error("Failed to generate Sudoku puzzle:", error);
            setStatusMessage('Error generating puzzle. Please try again.');
            setIsPlaying(false); // Go back to setup on error
        } finally {
            setIsLoading(false);
            setSelectedCell(null);
        }
    }, []);
    

    const handleCellClick = (row: number, col: number) => {
        if (initialGrid[row][col] === null && !isGameWon) {
            setSelectedCell({ row, col });
        }
    };
    
    const handleNumberInput = (num: number) => {
        if (!selectedCell || isGameWon) return;
        const newGrid = grid.map(r => [...r]);
        newGrid[selectedCell.row][selectedCell.col] = num;
        setGrid(newGrid);
    };
    
    const checkSolution = () => {
        const isCorrect = JSON.stringify(grid) === JSON.stringify(solution);
        if (isCorrect) {
            setStatusMessage('Congratulations! You solved the puzzle!');
            setIsGameWon(true);
            if (user) {
                const timePlayed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                updateUserStats('sudoku', 'win', timePlayed);
            }
        } else {
            setStatusMessage('Not quite right. Keep trying!');
        }
    };
    
     const handleContinueGame = () => {
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            setDifficulty(savedState.difficulty);
            setGridSize(savedState.gridSize || 9); // Fallback to 9 for old saves
            setGrid(savedState.grid);
            setInitialGrid(savedState.initialGrid);
            setSolution(savedState.solution);
            const timePlayedSoFar = savedState.timePlayed || 0;
            setElapsedTime(timePlayedSoFar);
            startTimeRef.current = Date.now() - timePlayedSoFar * 1000;
            setIsPlaying(true);
        }
        setShowContinueModal(false);
        setIsGameReady(true);
    };

    const handleStartNewGame = () => {
        clearSavedGame('sudoku');
        setIsPlaying(false); // Show setup screen
        setShowContinueModal(false);
        setIsGameReady(true);
    };

    const startGame = () => {
        generateNewPuzzle(gridSize, difficulty);
    };

    const handleSaveAndExit = () => {
        if (user && !isGameWon && isPlaying) {
            const timePlayed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const gameState = JSON.stringify({
                difficulty,
                gridSize,
                grid,
                initialGrid,
                solution,
                timePlayed,
            });
            saveGame('sudoku', gameState);
        }
        onBackToLobby();
    };

    const getBlockDimensions = (size: number) => {
        if (size === 9) return { width: 3, height: 3 };
        if (size === 6) return { width: 3, height: 2 };
        return { width: 2, height: 2 };
    };

    const blockDims = getBlockDimensions(gridSize);
    const gridColsClass = gridSize === 9 ? 'grid-cols-9' : gridSize === 6 ? 'grid-cols-6' : 'grid-cols-4';

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isGameReady && user) {
        return (
             <div className="w-full max-w-xl mx-auto flex items-center justify-center h-96">
                <ContinueGameModal 
                    isOpen={showContinueModal}
                    onContinue={handleContinueGame}
                    onStartNew={handleStartNewGame}
                    title="Unfinished Game Found"
                    message="Would you like to continue your saved game of Sudoku?"
                />
                 {!showContinueModal && <p className="text-brand-light">Loading game...</p>}
            </div>
        )
    }

    if (!isPlaying) {
        return (
            <div className="w-full max-w-xl mx-auto bg-brand-primary p-6 rounded-lg shadow-2xl animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-brand-light">{gameName}</h2>
                    <button onClick={onBackToLobby} className="text-sm text-brand-accent hover:underline">Back to Lobby</button>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold text-brand-light mb-3">Select Grid Size</h3>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setGridSize(4)}
                                className={`flex-1 py-3 rounded-md font-bold transition-colors ${gridSize === 4 ? 'bg-brand-accent text-brand-primary' : 'bg-brand-secondary text-brand-light hover:bg-brand-secondary/80'}`}
                            >
                                4x4 (Mini)
                            </button>
                            <button 
                                onClick={() => setGridSize(6)}
                                className={`flex-1 py-3 rounded-md font-bold transition-colors ${gridSize === 6 ? 'bg-brand-accent text-brand-primary' : 'bg-brand-secondary text-brand-light hover:bg-brand-secondary/80'}`}
                            >
                                6x6 (Medium)
                            </button>
                            <button 
                                onClick={() => setGridSize(9)}
                                className={`flex-1 py-3 rounded-md font-bold transition-colors ${gridSize === 9 ? 'bg-brand-accent text-brand-primary' : 'bg-brand-secondary text-brand-light hover:bg-brand-secondary/80'}`}
                            >
                                9x9 (Standard)
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-brand-light mb-3">Select Difficulty</h3>
                        <div className="flex gap-4">
                            {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((level) => (
                                <button 
                                    key={level}
                                    onClick={() => setDifficulty(level)}
                                    className={`flex-1 py-3 rounded-md font-bold transition-colors ${difficulty === level ? 'bg-brand-accent text-brand-primary' : 'bg-brand-secondary text-brand-light hover:bg-brand-secondary/80'}`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={startGame}
                        disabled={isLoading}
                        className="w-full bg-brand-accent text-brand-primary font-bold py-4 rounded-md text-xl hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                    >
                        {isLoading ? 'Generating Puzzle...' : 'Start Game'}
                    </button>
                    {statusMessage && <p className="text-center text-brand-light animate-pulse">{statusMessage}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl mx-auto bg-brand-primary p-6 rounded-lg shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold text-brand-light">{gameName}</h2>
                 <div>
                    {user && <button onClick={handleSaveAndExit} className="text-sm bg-brand-secondary text-brand-light hover:bg-brand-accent hover:text-brand-primary font-medium py-1 px-3 rounded-md transition-colors duration-300 mr-2">Save & Exit</button>}
                    <button onClick={onBackToLobby} className="text-sm text-brand-accent hover:underline">Back to Lobby</button>
                </div>
            </div>

            <div className="flex justify-between items-center bg-brand-secondary p-3 rounded-md mb-4 flex-wrap gap-2">
                <div className="text-sm text-brand-light">
                    <span className="font-semibold text-brand-accent">{gridSize}x{gridSize}</span> - <span className="font-semibold text-brand-accent">{difficulty}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <span className="text-brand-light text-sm">Time:</span>
                    <span className="font-mono text-xl text-brand-accent font-bold">{formatTime(elapsedTime)}</span>
                </div>
                <button onClick={() => setIsPlaying(false)} className="bg-brand-secondary text-brand-light hover:text-brand-accent text-sm font-semibold underline">
                    New Configuration
                </button>
            </div>

            <div className={`aspect-square grid gap-0.5 bg-brand-secondary/50 p-1 rounded-md mb-4 ${gridColsClass}`}>
                {grid.map((row, rIndex) => row.map((cell, cIndex) => (
                    <div key={`${rIndex}-${cIndex}`} onClick={() => handleCellClick(rIndex, cIndex)}
                        className={`
                            flex items-center justify-center aspect-square font-semibold transition-colors
                            ${gridSize === 9 ? 'text-2xl' : gridSize === 6 ? 'text-3xl' : 'text-4xl'}
                            ${Math.floor(rIndex/blockDims.height) % 2 === Math.floor(cIndex/blockDims.width) % 2 ? 'bg-brand-primary' : 'bg-brand-secondary/60'}
                            ${selectedCell?.row === rIndex && selectedCell?.col === cIndex ? 'ring-2 ring-brand-accent z-10' : ''}
                            ${initialGrid[rIndex]?.[cIndex] !== null ? 'text-brand-light cursor-not-allowed' : 'text-brand-accent cursor-pointer hover:bg-brand-secondary'}
                            ${isGameWon ? 'cursor-not-allowed hover:bg-brand-secondary' : ''}
                        `}
                    >
                        {cell}
                    </div>
                )))}
            </div>
            
            <div className="text-center text-brand-light mb-4 h-6">{statusMessage}</div>

            <div className="flex justify-center flex-wrap gap-2 mb-4">
                {Array.from({ length: gridSize }, (_, i) => i + 1).map(num => (
                    <button key={num} onClick={() => handleNumberInput(num)} disabled={isGameWon} className="w-10 h-10 bg-brand-secondary rounded text-brand-light font-bold text-xl hover:bg-brand-accent hover:text-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {num}
                    </button>
                ))}
                 <button onClick={() => handleNumberInput(0)} disabled={isGameWon} className="w-10 h-10 bg-brand-secondary rounded text-brand-light font-bold text-xl hover:bg-brand-accent hover:text-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    C
                </button>
            </div>
             <button onClick={checkSolution} disabled={isGameWon} className="w-full bg-brand-accent text-brand-primary font-bold py-2 px-6 rounded-md hover:bg-opacity-80 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {isGameWon ? 'Solved!' : 'Check My Solution'}
            </button>
        </div>
    );
};
export default SudokuGame;
