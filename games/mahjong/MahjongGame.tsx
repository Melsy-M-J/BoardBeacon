
import React, { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { GameComponentProps } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';
import ContinueGameModal from '../../components/ContinueGameModal';

// --- Types ---
type Suit = 'dot' | 'bamboo' | 'char' | 'wind' | 'dragon' | 'flower' | 'season';
type TileValue = string | number;

interface TileData {
    id: number;
    suit: Suit;
    value: TileValue;
    label: string; // The unicode char or text
    color: string;
}

interface TileInstance extends TileData {
    uniqueId: string;
    x: number; // Grid units (1 unit = half tile width)
    y: number; // Grid units (1 unit = half tile height)
    z: number; // Layer
    isRemoved: boolean;
}

// --- Constants ---
const TILE_WIDTH = 60;
const TILE_HEIGHT = 80;
const GRID_X = TILE_WIDTH / 2;
const GRID_Y = TILE_HEIGHT / 2;

// Unicode mappings
const TILES_DEF: TileData[] = [
    // Dots (1-9) x 4
    ...Array.from({ length: 9 }, (_, i) => ({ suit: 'dot' as Suit, value: i + 1, label: String.fromCodePoint(0x1F019 + i), color: '#ef4444' })), // 🀙 - 🀡
    // Bamboo (1-9) x 4
    ...Array.from({ length: 9 }, (_, i) => ({ suit: 'bamboo' as Suit, value: i + 1, label: String.fromCodePoint(0x1F010 + i), color: '#10b981' })), // 🀐 - 🀘
    // Characters (1-9) x 4
    ...Array.from({ length: 9 }, (_, i) => ({ suit: 'char' as Suit, value: i + 1, label: String.fromCodePoint(0x1F007 + i), color: '#3b82f6' })), // 🀇 - 🀏
    // Winds (E, S, W, N) x 4
    { suit: 'wind' as Suit, value: 'east', label: '🀀', color: '#a855f7' },
    { suit: 'wind' as Suit, value: 'south', label: '🀁', color: '#a855f7' },
    { suit: 'wind' as Suit, value: 'west', label: '🀂', color: '#a855f7' },
    { suit: 'wind' as Suit, value: 'north', label: '🀃', color: '#a855f7' },
    // Dragons (Red, Green, White) x 4
    { suit: 'dragon' as Suit, value: 'red', label: '🀄', color: '#ef4444' },
    { suit: 'dragon' as Suit, value: 'green', label: '🀅', color: '#10b981' },
    { suit: 'dragon' as Suit, value: 'white', label: '🀆', color: '#3b82f6' },
    // Flowers (1-4) x 1
    { suit: 'flower' as Suit, value: 1, label: '🀢', color: '#eab308' },
    { suit: 'flower' as Suit, value: 2, label: '🀣', color: '#eab308' },
    { suit: 'flower' as Suit, value: 3, label: '🀤', color: '#eab308' },
    { suit: 'flower' as Suit, value: 4, label: '🀥', color: '#eab308' },
    // Seasons (1-4) x 1
    { suit: 'season' as Suit, value: 1, label: '🀦', color: '#f97316' },
    { suit: 'season' as Suit, value: 2, label: '🀧', color: '#f97316' },
    { suit: 'season' as Suit, value: 3, label: '🀨', color: '#f97316' },
    { suit: 'season' as Suit, value: 4, label: '🀩', color: '#f97316' },
].map((t, i) => ({ ...t, id: i }));

// Simplified Turtle Layout (approximate coordinates in grid units)
// x: 0-28, y: 0-16, z: 0-4
const LAYOUT_COORDS = [
    // Level 0 (Base)
    // Row 0
    {x:2,y:0,z:0},{x:4,y:0,z:0},{x:6,y:0,z:0},{x:8,y:0,z:0},{x:10,y:0,z:0},{x:12,y:0,z:0},{x:14,y:0,z:0},{x:16,y:0,z:0},{x:18,y:0,z:0},{x:20,y:0,z:0},{x:22,y:0,z:0},{x:24,y:0,z:0},
    // Row 2
    {x:6,y:2,z:0},{x:8,y:2,z:0},{x:10,y:2,z:0},{x:12,y:2,z:0},{x:14,y:2,z:0},{x:16,y:2,z:0},{x:18,y:2,z:0},{x:20,y:2,z:0},
    // Row 4
    {x:4,y:4,z:0},{x:6,y:4,z:0},{x:8,y:4,z:0},{x:10,y:4,z:0},{x:12,y:4,z:0},{x:14,y:4,z:0},{x:16,y:4,z:0},{x:18,y:4,z:0},{x:20,y:4,z:0},{x:22,y:4,z:0},
    // Row 6 (Center)
    {x:0,y:7,z:0},{x:2,y:6,z:0},{x:4,y:6,z:0},{x:6,y:6,z:0},{x:8,y:6,z:0},{x:10,y:6,z:0},{x:12,y:6,z:0},{x:14,y:6,z:0},{x:16,y:6,z:0},{x:18,y:6,z:0},{x:20,y:6,z:0},{x:22,y:6,z:0},{x:24,y:6,z:0},{x:26,y:7,z:0},{x:28,y:7,z:0},
    // Row 8
    {x:4,y:8,z:0},{x:6,y:8,z:0},{x:8,y:8,z:0},{x:10,y:8,z:0},{x:12,y:8,z:0},{x:14,y:8,z:0},{x:16,y:8,z:0},{x:18,y:8,z:0},{x:20,y:8,z:0},{x:22,y:8,z:0},
    // Row 10
    {x:6,y:10,z:0},{x:8,y:10,z:0},{x:10,y:10,z:0},{x:12,y:10,z:0},{x:14,y:10,z:0},{x:16,y:10,z:0},{x:18,y:10,z:0},{x:20,y:10,z:0},
    // Row 12
    {x:2,y:12,z:0},{x:4,y:12,z:0},{x:6,y:12,z:0},{x:8,y:12,z:0},{x:10,y:12,z:0},{x:12,y:12,z:0},{x:14,y:12,z:0},{x:16,y:12,z:0},{x:18,y:12,z:0},{x:20,y:12,z:0},{x:22,y:12,z:0},{x:24,y:12,z:0},

    // Level 1 (Center Block)
    {x:8,y:2,z:1},{x:10,y:2,z:1},{x:12,y:2,z:1},{x:14,y:2,z:1},{x:16,y:2,z:1},{x:18,y:2,z:1},
    {x:8,y:4,z:1},{x:10,y:4,z:1},{x:12,y:4,z:1},{x:14,y:4,z:1},{x:16,y:4,z:1},{x:18,y:4,z:1},
    {x:8,y:6,z:1},{x:10,y:6,z:1},{x:12,y:6,z:1},{x:14,y:6,z:1},{x:16,y:6,z:1},{x:18,y:6,z:1},
    {x:8,y:8,z:1},{x:10,y:8,z:1},{x:12,y:8,z:1},{x:14,y:8,z:1},{x:16,y:8,z:1},{x:18,y:8,z:1},
    {x:8,y:10,z:1},{x:10,y:10,z:1},{x:12,y:10,z:1},{x:14,y:10,z:1},{x:16,y:10,z:1},{x:18,y:10,z:1},

    // Level 2
    {x:10,y:4,z:2},{x:12,y:4,z:2},{x:14,y:4,z:2},{x:16,y:4,z:2},
    {x:10,y:6,z:2},{x:12,y:6,z:2},{x:14,y:6,z:2},{x:16,y:6,z:2},
    {x:10,y:8,z:2},{x:12,y:8,z:2},{x:14,y:8,z:2},{x:16,y:8,z:2},

    // Level 3
    {x:12,y:5,z:3},{x:14,y:5,z:3},
    {x:12,y:7,z:3},{x:14,y:7,z:3},

    // Level 4 (Top)
    {x:13,y:6,z:4}
];

// We need exactly 144 tiles usually. The layout above has:
// L0: 75, L1: 30, L2: 12, L3: 4, L4: 1 => Total 122 slots.
// We need 61 matching pairs from a standard deck.

const MahjongGame: React.FC<GameComponentProps> = ({ onBackToLobby, gameName }) => {
    const { user, updateUserStats, saveGame, clearSavedGame } = useContext(AuthContext);
    const startTimeRef = useRef<number>(Date.now());
    
    const [tiles, setTiles] = useState<TileInstance[]>([]);
    const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [matches, setMatches] = useState(0);
    const [hintsRemaining, setHintsRemaining] = useState(3);
    const [shufflesRemaining, setShufflesRemaining] = useState(1);
    const [hintPair, setHintPair] = useState<[string, string] | null>(null);
    const [isGameWon, setIsGameWon] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    const [showContinueModal, setShowContinueModal] = useState(false);
    const [isGameReady, setIsGameReady] = useState(false);
    const savedStateJSON = useMemo(() => user?.savedGames?.mahjong, [user]);

    // --- Initialization ---
    useEffect(() => {
        if (user && savedStateJSON) setShowContinueModal(true);
        else {
            startNewGame();
            setIsGameReady(true);
        }
    }, [user, savedStateJSON]);

    useEffect(() => {
        if (!isGameWon && isGameReady) {
            const interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isGameWon, isGameReady]);

    const startNewGame = useCallback(() => {
        // Build a pool of potential pairs to draw from to ensure a valid distribution
        const pairPool: TileData[][] = []; // Array of [TileData, TileData]

        // 1. Standard suits (Dot, Bamboo, Char, Wind, Dragon)
        // Each has 4 copies in a standard deck, creating 2 pairs.
        const standardTiles = TILES_DEF.filter(t => !['flower', 'season'].includes(t.suit));
        standardTiles.forEach(tileDef => {
            pairPool.push([tileDef, tileDef]);
            pairPool.push([tileDef, tileDef]);
        });

        // 2. Flowers (4 tiles)
        // In Mahjong Solitaire, any flower matches any flower. So 4 tiles = 2 pairs.
        const flowers = TILES_DEF.filter(t => t.suit === 'flower');
        if (flowers.length === 4) {
            pairPool.push([flowers[0], flowers[1]]);
            pairPool.push([flowers[2], flowers[3]]);
        }

        // 3. Seasons (4 tiles)
        // Any season matches any season. 4 tiles = 2 pairs.
        const seasons = TILES_DEF.filter(t => t.suit === 'season');
        if (seasons.length === 4) {
            pairPool.push([seasons[0], seasons[1]]);
            pairPool.push([seasons[2], seasons[3]]);
        }

        // Shuffle the pool of pairs
        pairPool.sort(() => Math.random() - 0.5);

        // Select the number of pairs needed for the layout (122 slots / 2 = 61 pairs)
        const numSlots = LAYOUT_COORDS.length; 
        const numPairsNeeded = Math.ceil(numSlots / 2); // 61
        const selectedPairs = pairPool.slice(0, numPairsNeeded);
        
        // Flatten into individual tiles
        const gameDeck: TileData[] = selectedPairs.flat();

        // Shuffle the tiles to randomize their positions in the layout
        gameDeck.sort(() => Math.random() - 0.5);

        // Assign to layout coordinates
        const newTiles: TileInstance[] = LAYOUT_COORDS.map((coord, index) => {
            if (index >= gameDeck.length) return null;
            return {
                ...gameDeck[index],
                uniqueId: `tile-${index}-${Date.now()}`,
                x: coord.x,
                y: coord.y,
                z: coord.z,
                isRemoved: false
            };
        }).filter((t): t is TileInstance => t !== null);

        setTiles(newTiles);
        setScore(0);
        setMatches(0);
        setHintsRemaining(3);
        setShufflesRemaining(1);
        setIsGameWon(false);
        setHintPair(null);
        setSelectedTileId(null);
        startTimeRef.current = Date.now();
        setElapsedTime(0);
        clearSavedGame('mahjong');
    }, [clearSavedGame]);

    // --- Logic ---

    // Check if a tile is free
    const isTileFree = useCallback((tile: TileInstance, currentTiles: TileInstance[]) => {
        if (tile.isRemoved) return false;

        // 1. Check for tiles on top (z + 1)
        // Tiles are 2x2 units. Overlap occurs if distance < 2 in both X and Y.
        const isCovered = currentTiles.some(t => 
            !t.isRemoved && 
            t.z === tile.z + 1 && 
            Math.abs(t.x - tile.x) < 2 && 
            Math.abs(t.y - tile.y) < 2
        );
        if (isCovered) return false;

        // 2. Check for blocking neighbors (Left OR Right)
        // A tile is blocked if it has neighbors on BOTH left and right?
        // No, standard rule: A tile is free if it has NO neighbor on Left OR NO neighbor on Right.
        // It needs at least one open side.
        
        // Neighbor check: Grid aligns mostly to 2 units. 
        // Left neighbor is at x - 2, Right is at x + 2.
        const hasLeft = currentTiles.some(t => 
            !t.isRemoved && 
            t.z === tile.z && 
            Math.abs(t.y - tile.y) < 2 && // Strict overlap in Y
            Math.abs(t.x - (tile.x - 2)) < 0.5 // Tolerance for float math
        );

        const hasRight = currentTiles.some(t => 
            !t.isRemoved && 
            t.z === tile.z && 
            Math.abs(t.y - tile.y) < 2 &&
            Math.abs(t.x - (tile.x + 2)) < 0.5
        );

        return !(hasLeft && hasRight);
    }, []);

    const isMatch = (t1: TileInstance, t2: TileInstance) => {
        if (t1.uniqueId === t2.uniqueId) return false;
        // Flowers match Flowers, Seasons match Seasons
        if (t1.suit === 'flower' && t2.suit === 'flower') return true;
        if (t1.suit === 'season' && t2.suit === 'season') return true;
        // Others exact match
        return t1.suit === t2.suit && t1.value === t2.value;
    };

    const handleTileClick = (tile: TileInstance) => {
        if (isGameWon) return;
        if (!isTileFree(tile, tiles)) return;

        if (selectedTileId === null) {
            setSelectedTileId(tile.uniqueId);
            setHintPair(null);
            return;
        }

        if (selectedTileId === tile.uniqueId) {
            setSelectedTileId(null); // Deselect
            return;
        }

        const selectedTile = tiles.find(t => t.uniqueId === selectedTileId);
        if (selectedTile) {
            if (isMatch(selectedTile, tile)) {
                // Match found!
                const newTiles = tiles.map(t => {
                    if (t.uniqueId === tile.uniqueId || t.uniqueId === selectedTile.uniqueId) {
                        return { ...t, isRemoved: true };
                    }
                    return t;
                });
                
                setTiles(newTiles);
                setScore(s => s + 100);
                setMatches(m => m + 1);
                setSelectedTileId(null);
                setHintPair(null);
                
                // Check Win
                if (newTiles.every(t => t.isRemoved)) {
                    setIsGameWon(true);
                    updateUserStats('mahjong', 'win', elapsedTime);
                    clearSavedGame('mahjong');
                }
            } else {
                // No match, switch selection
                setSelectedTileId(tile.uniqueId);
                setScore(s => Math.max(0, s - 10)); // Minor penalty for mismatch
            }
        }
    };

    const handleHint = () => {
        if (hintsRemaining <= 0 || isGameWon) return;

        // Find all free tiles
        const freeTiles = tiles.filter(t => !t.isRemoved && isTileFree(t, tiles));
        
        // Find a matching pair
        for (let i = 0; i < freeTiles.length; i++) {
            for (let j = i + 1; j < freeTiles.length; j++) {
                if (isMatch(freeTiles[i], freeTiles[j])) {
                    setHintPair([freeTiles[i].uniqueId, freeTiles[j].uniqueId]);
                    setHintsRemaining(h => h - 1);
                    setScore(s => Math.max(0, s - 50)); // Penalty
                    return;
                }
            }
        }
        // No moves
        alert("No moves available! Try shuffling.");
    };

    const handleShuffle = () => {
        if (shufflesRemaining <= 0 || isGameWon) return;

        // Get all unremoved tiles
        const activeTiles = tiles.filter(t => !t.isRemoved);
        const positions = activeTiles.map(t => ({ x: t.x, y: t.y, z: t.z }));
        
        // Shuffle positions
        positions.sort(() => Math.random() - 0.5);

        // Reassign
        const newTiles = tiles.map(t => {
            if (t.isRemoved) return t;
            const pos = positions.pop()!;
            return { ...t, x: pos.x, y: pos.y, z: pos.z };
        });

        setTiles(newTiles);
        setShufflesRemaining(s => s - 1);
        setScore(s => Math.max(0, s - 200)); // Big penalty
        setSelectedTileId(null);
        setHintPair(null);
    };

    // --- Save/Load ---
    const handleContinueGame = () => {
        if (savedStateJSON) {
            const saved = JSON.parse(savedStateJSON);
            setTiles(saved.tiles);
            setScore(saved.score);
            setMatches(saved.matches);
            setHintsRemaining(saved.hintsRemaining);
            setShufflesRemaining(saved.shufflesRemaining);
            startTimeRef.current = Date.now() - (saved.timePlayed || 0) * 1000;
        }
        setShowContinueModal(false);
        setIsGameReady(true);
    };

    const handleSaveAndExit = () => {
        if (user && !isGameWon) {
            saveGame('mahjong', JSON.stringify({
                tiles, score, matches, hintsRemaining, shufflesRemaining, timePlayed: elapsedTime
            }));
        }
        onBackToLobby();
    };

    // --- Render ---
    if (!isGameReady && user) {
        return (
            <div className="w-full max-w-xl mx-auto flex items-center justify-center h-96">
                <ContinueGameModal isOpen={showContinueModal} onContinue={handleContinueGame} onStartNew={() => { setIsGameReady(true); startNewGame(); setShowContinueModal(false); }} title="Resume Mahjong?" message="Continue your previous session?" />
                {!showContinueModal && <p className="text-brand-light">Loading...</p>}
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center animate-fade-in">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-4 bg-brand-primary p-4 rounded-lg shadow-lg">
                <div>
                    <h2 className="text-2xl font-bold text-brand-light">{gameName}</h2>
                    <div className="text-brand-accent font-mono text-lg">Score: {score}</div>
                </div>
                <div className="flex gap-4">
                     <div className="text-brand-light">Time: {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</div>
                     <div className="text-brand-light">Matches: {matches}/61</div>
                </div>
                <div>
                     {user && <button onClick={handleSaveAndExit} className="text-sm bg-brand-secondary text-brand-light hover:bg-brand-accent hover:text-brand-primary font-medium py-1 px-3 rounded-md transition-colors duration-300 mr-2">Save & Exit</button>}
                    <button onClick={onBackToLobby} className="text-sm text-brand-accent hover:underline">Exit</button>
                </div>
            </div>

            {/* Game Board */}
            <div className="relative w-full overflow-auto bg-[#2d5a27] rounded-xl shadow-2xl border-8 border-[#3e2723] p-8 mb-4 min-h-[600px] flex justify-center items-center select-none">
                
                {isGameWon && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                        <h2 className="text-5xl font-bold text-brand-accent mb-4 drop-shadow-lg">You Win!</h2>
                        <p className="text-white text-xl mb-6">Final Score: {score + Math.max(0, (300 - elapsedTime) * 10)}</p>
                        <button onClick={startNewGame} className="bg-brand-accent text-brand-primary font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform">Play Again</button>
                    </div>
                )}

                <div className="relative" style={{ width: 900, height: 600, transform: 'scale(0.8) translateY(-30px)' }}> 
                    {tiles.filter(t => !t.isRemoved)
                        // Sort by Z, then X, then Y for correct rendering order (back to front)
                        .sort((a, b) => (a.z - b.z) || (a.x - b.x) || (a.y - b.y))
                        .map(tile => {
                            const isSelected = selectedTileId === tile.uniqueId;
                            const isHinted = hintPair?.includes(tile.uniqueId);
                            const blocked = !isTileFree(tile, tiles);
                            
                            // 3D layering offset
                            const left = tile.x * GRID_X - (tile.z * 4);
                            const top = tile.y * GRID_Y - (tile.z * 6);
                            const zIndex = tile.z * 10 + tile.x + tile.y; 

                            return (
                                <div
                                    key={tile.uniqueId}
                                    onClick={() => handleTileClick(tile)}
                                    className={`
                                        absolute flex flex-col items-center justify-center
                                        w-[56px] h-[76px] rounded-sm
                                        bg-[#fdf6e3] border border-[#d6cfc2]
                                        shadow-[2px_2px_0px_#bbb,3px_3px_2px_rgba(0,0,0,0.3)]
                                        transition-transform duration-100
                                        ${blocked ? 'brightness-75 cursor-default' : 'cursor-pointer hover:brightness-105'}
                                        ${isSelected ? '!bg-[#bfdbfe] !border-brand-accent -translate-y-1 shadow-[4px_4px_4px_rgba(0,0,0,0.4)]' : ''}
                                        ${isHinted ? 'ring-4 ring-yellow-400 animate-pulse' : ''}
                                    `}
                                    style={{
                                        left: left,
                                        top: top,
                                        zIndex: zIndex,
                                        // Creating depth effect manually for side/bottom
                                        boxShadow: isSelected 
                                            ? 'inset 0 0 10px rgba(255,255,255,0.5), 1px 1px 0 #999, 2px 2px 0 #888, 3px 3px 0 #777, 4px 4px 5px rgba(0,0,0,0.5)'
                                            : 'inset 0 0 5px rgba(255,255,255,0.2), 1px 1px 0 #ccc, 2px 2px 0 #bbb, 3px 3px 0 #aaa, 4px 4px 0 #999, 5px 5px 4px rgba(0,0,0,0.4)'
                                    }}
                                >
                                    {/* Tile Face */}
                                    <div className="text-3xl leading-none" style={{ color: tile.color }}>{tile.label}</div>
                                    <div className="absolute top-1 right-1 text-[8px] text-gray-400 font-mono">{tile.value}</div>
                                </div>
                            );
                        })}
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-6">
                <button 
                    onClick={handleHint} 
                    disabled={hintsRemaining <= 0 || isGameWon}
                    className="flex flex-col items-center gap-1 bg-brand-secondary p-3 rounded-lg hover:bg-brand-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 min-w-[100px]"
                >
                    <span className="text-2xl">💡</span>
                    <span className="font-bold text-brand-light">Hint ({hintsRemaining})</span>
                    <span className="text-xs text-gray-400">-50 pts</span>
                </button>

                <button 
                    onClick={handleShuffle} 
                    disabled={shufflesRemaining <= 0 || isGameWon}
                    className="flex flex-col items-center gap-1 bg-brand-secondary p-3 rounded-lg hover:bg-brand-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 min-w-[100px]"
                >
                    <span className="text-2xl">🔀</span>
                    <span className="font-bold text-brand-light">Shuffle ({shufflesRemaining})</span>
                    <span className="text-xs text-gray-400">-200 pts</span>
                </button>
                
                 <button 
                    onClick={() => { if(window.confirm("Restart game?")) startNewGame(); }} 
                    className="flex flex-col items-center gap-1 bg-brand-secondary p-3 rounded-lg hover:bg-brand-secondary/80 transition-all active:scale-95 min-w-[100px]"
                >
                    <span className="text-2xl">🔄</span>
                    <span className="font-bold text-brand-light">Restart</span>
                </button>
            </div>
        </div>
    );
};

export default MahjongGame;
