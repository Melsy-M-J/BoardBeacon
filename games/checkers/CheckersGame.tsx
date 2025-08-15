import React, { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { GameComponentProps } from '../../types';
import { getAiResponse } from '../../services/geminiService';
import { AuthContext } from '../../contexts/AuthContext';
import ContinueGameModal from '../../components/ContinueGameModal';
import { Type } from '@google/genai';
import { RedPieceIcon, BlackPieceIcon, RedKingIcon, BlackCheckersKingIcon } from '../../components/icons/pieces';

type Player = 'red' | 'black';
type Piece = { player: Player; isKing: boolean } | null;
type Board = Piece[][];
type Move = { from: { r: number; c: number }; to: { r: number; c: number }; jumped: { r: number; c: number } | null };

const createInitialBoard = (): Board => {
    const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 8; c++) {
            if ((r + c) % 2 !== 0) board[r][c] = { player: 'black', isKing: false };
        }
    }
    for (let r = 5; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if ((r + c) % 2 !== 0) board[r][c] = { player: 'red', isKing: false };
        }
    }
    return board;
};

const CheckersGame: React.FC<GameComponentProps> = ({ onBackToLobby, gameName }) => {
    const { user, updateUserStats, saveGame, clearSavedGame } = useContext(AuthContext);
    const startTimeRef = useRef<number>(Date.now());
    
    const [board, setBoard] = useState<Board>(createInitialBoard());
    const [turn, setTurn] = useState<Player>('red');
    const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
    const [validMoves, setValidMoves] = useState<Move[]>([]);
    const [winner, setWinner] = useState<Player | null>(null);
    const [aiIsThinking, setAiIsThinking] = useState(false);

    const [showContinueModal, setShowContinueModal] = useState(false);
    const [isGameReady, setIsGameReady] = useState(false);

    const savedStateJSON = useMemo(() => user?.savedGames?.checkers, [user]);

     useEffect(() => {
        if (user && savedStateJSON) setShowContinueModal(true);
        else setIsGameReady(true);
    }, [user, savedStateJSON]);

    const findValidMoves = useCallback((boardState: Board, forPlayer: Player): Move[] => {
        let moves: Move[] = [];
        let jumps: Move[] = [];
        const dirs = forPlayer === 'red' ? [-1] : [1];
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = boardState[r][c];
                if (piece?.player !== forPlayer) continue;

                const pieceDirs = piece.isKing ? [-1, 1] : dirs;

                for (const dr of pieceDirs) {
                    for (const dc of [-1, 1]) {
                        const nr = r + dr, nc = c + dc;
                        const jr = r + dr * 2, jc = c + dc * 2;

                        // Check jumps first
                        if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && !boardState[jr][jc] && boardState[nr]?.[nc]?.player && boardState[nr][nc]?.player !== forPlayer) {
                            jumps.push({ from: { r, c }, to: { r: jr, c: jc }, jumped: { r: nr, c: nc } });
                        }
                        // Check simple moves
                        else if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !boardState[nr][nc]) {
                            moves.push({ from: { r, c }, to: { r: nr, c: nc }, jumped: null });
                        }
                    }
                }
            }
        }
        return jumps.length > 0 ? jumps : moves;
    }, []);

    const checkWinner = useCallback((boardState: Board, currentPlayer: Player): Player | null => {
        const opponent: Player = currentPlayer === 'red' ? 'black' : 'red';
        if (findValidMoves(boardState, opponent).length === 0) return currentPlayer;
        
        const redCount = boardState.flat().filter(p => p?.player === 'red').length;
        const blackCount = boardState.flat().filter(p => p?.player === 'black').length;
        if (redCount === 0) return 'black';
        if (blackCount === 0) return 'red';
        
        return null;
    }, [findValidMoves]);
    
    useEffect(() => {
        if (winner) {
            const timePlayed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            updateUserStats('checkers', winner === 'red' ? 'win' : 'loss', timePlayed);
            clearSavedGame('checkers');
        }
    }, [winner, updateUserStats, clearSavedGame]);

    const applyMove = (move: Move) => {
        const newBoard = board.map(row => [...row]);
        const piece = newBoard[move.from.r][move.from.c];
        newBoard[move.to.r][move.to.c] = piece;
        newBoard[move.from.r][move.from.c] = null;

        if (move.jumped) newBoard[move.jumped.r][move.jumped.c] = null;

        // Kinging
        const movedPiece = newBoard[move.to.r][move.to.c];
        if (movedPiece && !movedPiece.isKing && ((movedPiece.player === 'red' && move.to.r === 0) || (movedPiece.player === 'black' && move.to.r === 7))) {
            movedPiece.isKing = true;
        }

        setBoard(newBoard);
        setSelected(null);
        setValidMoves([]);

        const nextPlayer = turn === 'red' ? 'black' : 'red';
        const gameWinner = checkWinner(newBoard, turn);
        if (gameWinner) setWinner(gameWinner);
        else setTurn(nextPlayer);
    };

    const handleSquareClick = (r: number, c: number) => {
        if (turn !== 'red' || winner) return;

        const move = validMoves.find(m => m.from.r === selected?.r && m.from.c === selected?.c && m.to.r === r && m.to.c === c);
        if (move) {
            applyMove(move);
        } else {
            const piece = board[r][c];
            if (piece?.player === 'red') {
                const allPlayerMoves = findValidMoves(board, 'red');
                const pieceMoves = allPlayerMoves.filter(m => m.from.r === r && m.from.c === c);
                if(pieceMoves.length > 0){
                    setSelected({ r, c });
                    setValidMoves(pieceMoves);
                }
            }
        }
    };
    
    const handleAiMove = useCallback(async () => {
        setAiIsThinking(true);
        const aiMoves = findValidMoves(board, 'black');
        if (aiMoves.length === 0) {
            setWinner('red');
            setAiIsThinking(false);
            return;
        }
        
        const prompt = `You are a Checkers expert playing as black.
        The board is 8x8. 'r' is red player, 'b' is black player. 'R' and 'B' are kings. null is empty.
        Current board state:
        ${JSON.stringify(board.map(row => row.map(p => p ? `${p.player.charAt(0)}${p.isKing ? 'K' : ''}` : null)))}
        It's your turn. Here are your valid moves: ${JSON.stringify(aiMoves)}
        Choose the best move. Respond with a JSON object of the chosen move.`;
        
        const schema = { type: Type.OBJECT, properties: { 
            from: { type: Type.OBJECT, properties: { r: { type: Type.INTEGER }, c: { type: Type.INTEGER } } },
            to: { type: Type.OBJECT, properties: { r: { type: Type.INTEGER }, c: { type: Type.INTEGER } } },
        }, required: ["from", "to"] };
        
        try {
            const response = await getAiResponse(prompt, schema);
            const chosenMove = aiMoves.find(m => m.from.r === response.from.r && m.from.c === response.from.c && m.to.r === response.to.r && m.to.c === response.to.c);
            applyMove(chosenMove || aiMoves[0]);
        } catch (e) {
            console.error("AI move failed, making a random move.", e);
            applyMove(aiMoves[Math.floor(Math.random() * aiMoves.length)]);
        } finally {
            setAiIsThinking(false);
        }
    }, [board, findValidMoves]);

    useEffect(() => {
        if (isGameReady && turn === 'black' && !winner) {
            const timer = setTimeout(handleAiMove, 300);
            return () => clearTimeout(timer);
        }
    }, [isGameReady, turn, winner, handleAiMove]);

    const getStatusMessage = () => {
        if (winner) return winner === 'red' ? 'Congratulations, you win!' : 'AI wins!';
        if (aiIsThinking) return 'AI is thinking...';
        return turn === 'red' ? 'Your turn (Red)' : "AI's turn (Black)";
    };
    
    const renderPiece = (piece: Piece) => {
        if (!piece) return null;
        if (piece.player === 'red') return piece.isKing ? <RedKingIcon /> : <RedPieceIcon />;
        return piece.isKing ? <BlackCheckersKingIcon /> : <BlackPieceIcon />;
    };

    const handleContinueGame = () => {
        if (savedStateJSON) {
            const saved = JSON.parse(savedStateJSON);
            setBoard(saved.board);
            setTurn(saved.turn);
            const timePlayedSoFar = saved.timePlayed || 0;
            startTimeRef.current = Date.now() - timePlayedSoFar * 1000;
        }
        setShowContinueModal(false);
        setIsGameReady(true);
    };

    const handleStartNewGame = () => {
        clearSavedGame('checkers');
        setBoard(createInitialBoard());
        setTurn('red');
        setWinner(null);
        startTimeRef.current = Date.now();
        setShowContinueModal(false);
        setIsGameReady(true);
    };
    
    const handleSaveAndExit = () => {
        if (user && !winner) {
            const timePlayed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            saveGame('checkers', JSON.stringify({ board, turn, timePlayed }));
        }
        onBackToLobby();
    };
    
    if (!isGameReady && user) {
        return (
             <div className="w-full max-w-xl mx-auto flex items-center justify-center h-96">
                <ContinueGameModal isOpen={showContinueModal} onContinue={handleContinueGame} onStartNew={handleStartNewGame} title="Continue Checkers?" message="Would you like to continue your saved game of Checkers?" />
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
                {board.map((row, r) => row.map((piece, c) => {
                    const isLight = (r + c) % 2 !== 0;
                    const isPossibleMove = validMoves.some(m => m.to.r === r && m.to.c === c);
                    return (
                        <div key={`${r}-${c}`} onClick={() => handleSquareClick(r, c)}
                            className={`relative flex items-center justify-center p-1 ${isLight ? 'bg-brand-secondary' : 'bg-brand-light/90'} ${turn === 'red' && !winner ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                            {renderPiece(piece)}
                            {isPossibleMove && <div className="absolute inset-0 flex items-center justify-center"><div className="w-1/3 h-1/3 bg-brand-accent/50 rounded-full"></div></div>}
                            {selected?.r === r && selected?.c === c && <div className="absolute inset-0 bg-brand-accent/40"></div>}
                        </div>
                    );
                }))}
            </div>
            
             <div className="text-center h-16 flex flex-col justify-center items-center mt-4">
                <p className={`text-xl font-medium mb-2 ${winner ? 'text-brand-accent' : 'text-brand-light'}`}>{getStatusMessage()}</p>
                {winner && <button onClick={handleStartNewGame} className="bg-brand-accent text-brand-primary font-bold py-2 px-6 rounded-md hover:bg-opacity-80 transition-colors duration-300">Play Again</button>}
            </div>
        </div>
    );
};
export default CheckersGame;