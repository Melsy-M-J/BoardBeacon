import React, { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { GameComponentProps } from '../../types';
import { getAiResponse } from '../../services/geminiService';
import { AuthContext } from '../../contexts/AuthContext';
import ContinueGameModal from '../../components/ContinueGameModal';
import { Type } from '@google/genai';

type Difficulty = 'Easy' | 'Medium' | 'Hard';
type Grid = (number | null)[][];

const SudokuGame: React.FC<GameComponentProps> = ({ onBackToLobby, gameName }) => {
    const { user, updateUserStats, saveGame, clearSavedGame } = useContext(AuthContext);
    const startTimeRef = useRef<number>(Date.now());

    const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
    const [grid, setGrid] = useState<Grid>(Array(9).fill(null).map(() => Array(9).fill(null)));
    const [initialGrid, setInitialGrid] = useState<Grid>(Array(9).fill(null).map(() => Array(9).fill(null)));
    const [solution, setSolution] = useState<Grid>(Array(9).fill(null).map(() => Array(9).fill(null)));
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGameWon, setIsGameWon] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Select a difficulty and start a new game!');

    const [showContinueModal, setShowContinueModal] = useState(false);
    const [isGameReady, setIsGameReady] = useState(false);
    
    const savedStateJSON = useMemo(() => user?.savedGames?.sudoku, [user]);

    useEffect(() => {
        if (user && savedStateJSON) {
            setShowContinueModal(true);
        } else {
            setIsGameReady(true);
            generateNewPuzzle();
        }
    }, [user, savedStateJSON]); // Note: generateNewPuzzle is not a dependency to avoid re-running

    const generateNewPuzzle = useCallback(async (newDifficulty?: Difficulty) => {
        const diff = newDifficulty || difficulty;
        setIsLoading(true);
        setStatusMessage(`Generating a new ${diff.toLowerCase()} puzzle...`);
        setGrid(Array(9).fill(null).map(() => Array(9).fill(null))); // Clear board while loading
        const prompt = `Generate a 9x9 Sudoku puzzle and its complete solution. The difficulty should be '${diff}'.
        Provide the response as a JSON object with two keys: "puzzle" and "solution".
        The "puzzle" should be a 9x9 grid where empty cells are represented by 'null'.
        The "solution" should be the fully solved 9x9 grid.`;

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
            startTimeRef.current = Date.now();
        } catch (error) {
            console.error("Failed to generate Sudoku puzzle:", error);
            setStatusMessage('Error generating puzzle. Please try again.');
        } finally {
            setIsLoading(false);
            setSelectedCell(null);
        }
    }, [difficulty]);
    

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
            setGrid(savedState.grid);
            setInitialGrid(savedState.initialGrid);
            setSolution(savedState.solution);
            const timePlayedSoFar = savedState.timePlayed || 0;
            startTimeRef.current = Date.now() - timePlayedSoFar * 1000;
        }
        setShowContinueModal(false);
        setIsGameReady(true);
    };

    const handleStartNewGame = () => {
        clearSavedGame('sudoku');
        generateNewPuzzle(difficulty);
        setShowContinueModal(false);
        setIsGameReady(true);
    };

    const handleSaveAndExit = () => {
        if (user && !isGameWon) {
            const timePlayed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const gameState = JSON.stringify({
                difficulty,
                grid,
                initialGrid,
                solution,
                timePlayed,
            });
            saveGame('sudoku', gameState);
        }
        onBackToLobby();
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
                <div className="flex items-center gap-2">
                    <label htmlFor="difficulty" className="text-sm font-medium">Difficulty:</label>
                    <select id="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)} className="bg-brand-primary text-brand-light rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent">
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                    </select>
                </div>
                <button onClick={() => generateNewPuzzle(difficulty)} disabled={isLoading} className="bg-brand-accent text-brand-primary font-bold py-1 px-4 text-sm rounded-md hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Generating...' : 'New Game'}
                </button>
            </div>

            <div className="aspect-square grid grid-cols-9 gap-0.5 bg-brand-secondary/50 p-1 rounded-md mb-4">
                {grid.map((row, rIndex) => row.map((cell, cIndex) => (
                    <div key={`${rIndex}-${cIndex}`} onClick={() => handleCellClick(rIndex, cIndex)}
                        className={`
                            flex items-center justify-center aspect-square text-2xl font-semibold transition-colors
                            ${Math.floor(rIndex/3) % 2 === Math.floor(cIndex/3) % 2 ? 'bg-brand-primary' : 'bg-brand-secondary/60'}
                            ${selectedCell?.row === rIndex && selectedCell?.col === cIndex ? 'ring-2 ring-brand-accent z-10' : ''}
                            ${initialGrid[rIndex][cIndex] !== null ? 'text-brand-light cursor-not-allowed' : 'text-brand-accent cursor-pointer hover:bg-brand-secondary'}
                            ${isGameWon ? 'cursor-not-allowed hover:bg-brand-secondary' : ''}
                        `}
                    >
                        {cell}
                    </div>
                )))}
            </div>
            
            <div className="text-center text-brand-light mb-4 h-6">{statusMessage}</div>

            <div className="flex justify-center gap-2 mb-4">
                {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
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