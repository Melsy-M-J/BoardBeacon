import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { GameComponentProps } from '../../types';
import { getAiResponse } from '../../services/geminiService';
import { AuthContext } from '../../contexts/AuthContext';
import { Type } from '@google/genai';

type Player = 'O' | 'X';
type Cell = Player | null;
type Board = Cell[][];
type GameStatus = 'playing' | 'draw' | 'winner';

const TicTacToeGame: React.FC<GameComponentProps> = ({ onBackToLobby, gameName }) => {
    const { user, updateUserStats } = useContext(AuthContext);
    const startTimeRef = useRef<number>(Date.now());
    
    const createEmptyBoard = (): Board => Array(3).fill(null).map(() => Array(3).fill(null));

    const [board, setBoard] = useState<Board>(createEmptyBoard());
    const [currentPlayer, setCurrentPlayer] = useState<Player>('O'); // Player 'O' starts
    const [status, setStatus] = useState<GameStatus>('playing');
    const [winner, setWinner] = useState<Player | null>(null);
    const [aiIsThinking, setAiIsThinking] = useState<boolean>(false);

    const checkWinner = useCallback((currentBoard: Board): { winner: Player | null, status: GameStatus } => {
        const lines = [ // Rows, Columns, Diagonals
            [currentBoard[0][0], currentBoard[0][1], currentBoard[0][2]], [currentBoard[1][0], currentBoard[1][1], currentBoard[1][2]], [currentBoard[2][0], currentBoard[2][1], currentBoard[2][2]],
            [currentBoard[0][0], currentBoard[1][0], currentBoard[2][0]], [currentBoard[0][1], currentBoard[1][1], currentBoard[2][1]], [currentBoard[0][2], currentBoard[1][2], currentBoard[2][2]],
            [currentBoard[0][0], currentBoard[1][1], currentBoard[2][2]], [currentBoard[0][2], currentBoard[1][1], currentBoard[2][0]],
        ];
        for (const line of lines) {
            if (line[0] && line[0] === line[1] && line[0] === line[2]) return { winner: line[0], status: 'winner' };
        }
        if (currentBoard.flat().every(cell => cell !== null)) return { winner: null, status: 'draw' };
        return { winner: null, status: 'playing' };
    }, []);

    useEffect(() => {
        if (status !== 'playing' && user) {
            const timePlayed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            let result: 'win' | 'loss' | 'draw' = 'draw';
            if (status === 'winner') {
                result = winner === 'O' ? 'win' : 'loss';
            }
            updateUserStats('tic-tac-toe', result, timePlayed);
        }
    }, [status, winner, user, updateUserStats]);

    const handlePlayerMove = (row: number, col: number) => {
        if (board[row][col] || status !== 'playing' || currentPlayer === 'X') return;
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = 'O';
        setBoard(newBoard);
        const gameResult = checkWinner(newBoard);
        if (gameResult.status !== 'playing') {
            setStatus(gameResult.status);
            setWinner(gameResult.winner);
        } else {
            setCurrentPlayer('X');
        }
    };
    
    const handleAiMove = useCallback(async (currentBoard: Board) => {
        setAiIsThinking(true);
        const prompt = `You are an expert Tic-Tac-Toe player. It is your turn to move as 'X'.
        The current board is represented by a 3x3 array. 'X' is you, 'O' is the human opponent, and null is an empty cell.
        Your goal is to win or draw. Analyze the board and provide the coordinates for your best move.
        Current Board: ${JSON.stringify(currentBoard)}
        Respond with a JSON object indicating the row and column for your move. Choose an empty cell.`;
        const schema = { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ["row", "col"] };
        
        try {
            let validMove = false;
            for (let attempts = 0; attempts < 3 && !validMove; attempts++) {
                const aiResponse = await getAiResponse(prompt, schema);
                const { row, col } = aiResponse;
                if (currentBoard[row]?.[col] === null) {
                    const newBoard = currentBoard.map(r => [...r]); newBoard[row][col] = 'X'; setBoard(newBoard);
                    const gameResult = checkWinner(newBoard);
                    if (gameResult.status !== 'playing') { setStatus(gameResult.status); setWinner(gameResult.winner); } else { setCurrentPlayer('O'); }
                    validMove = true;
                } else { console.warn("AI suggested an invalid move. Retrying..."); }
            }
            if (!validMove) { console.error("AI failed to provide a valid move. Making a random valid move."); /* Fallback logic */ }
        } catch (error) { console.error("Error during AI move:", error); } 
        finally { setAiIsThinking(false); }
    }, [checkWinner]);

    useEffect(() => {
        if (currentPlayer === 'X' && status === 'playing') {
            const timer = setTimeout(() => handleAiMove(board), 500);
            return () => clearTimeout(timer);
        }
    }, [currentPlayer, status, board, handleAiMove]);

    const handleReset = () => {
        setBoard(createEmptyBoard());
        setCurrentPlayer('O');
        setStatus('playing');
        setWinner(null);
        setAiIsThinking(false);
        startTimeRef.current = Date.now();
    };
    
    const getStatusMessage = () => {
        if (status === 'winner') return winner === 'O' ? "Congratulations, you win!" : "AI wins!";
        if (status === 'draw') return "It's a draw!";
        if (aiIsThinking) return "AI is thinking...";
        return `Your turn (O)`;
    };

    return (
        <div className="w-full max-w-lg mx-auto bg-brand-primary p-6 rounded-lg shadow-2xl animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-brand-light">{gameName}</h2>
                <button onClick={onBackToLobby} className="text-sm text-brand-accent hover:underline">Back to Lobby</button>
            </div>
            <div className="aspect-square grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                {board.map((row, rowIndex) => row.map((cell, colIndex) => (
                    <div key={`${rowIndex}-${colIndex}`} onClick={() => handlePlayerMove(rowIndex, colIndex)}
                        className={`flex items-center justify-center bg-brand-secondary rounded-md text-5xl sm:text-7xl font-bold transition-colors ${status === 'playing' && currentPlayer === 'O' && !cell ? 'cursor-pointer hover:bg-brand-secondary/70' : 'cursor-not-allowed'} ${cell === 'X' ? 'text-brand-accent' : 'text-white'}`}>
                        {cell}
                    </div>
                )))}
            </div>
            <div className="text-center h-16 flex flex-col justify-center items-center">
                <p className={`text-xl font-medium mb-4 ${status !== 'playing' ? 'text-brand-accent' : 'text-brand-light'}`}>{getStatusMessage()}</p>
                {status !== 'playing' && <button onClick={handleReset} className="bg-brand-accent text-brand-primary font-bold py-2 px-6 rounded-md hover:bg-opacity-80 transition-colors duration-300">Play Again</button>}
            </div>
        </div>
    );
};
export default TicTacToeGame;