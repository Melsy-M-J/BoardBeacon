import React from 'react';
import type { Piece } from 'chess.js';

import {
    BlackBishopIcon, BlackKingIcon, BlackKnightIcon, BlackPawnIcon, BlackQueenIcon, BlackRookIcon,
    WhiteBishopIcon, WhiteKingIcon, WhiteKnightIcon, WhitePawnIcon, WhiteQueenIcon, WhiteRookIcon
} from '../../components/icons/pieces';

interface ChessPieceProps {
    piece: Piece;
}

const PIECE_MAP = {
    b: { p: BlackPawnIcon, r: BlackRookIcon, n: BlackKnightIcon, b: BlackBishopIcon, q: BlackQueenIcon, k: BlackKingIcon },
    w: { p: WhitePawnIcon, r: WhiteRookIcon, n: WhiteKnightIcon, b: WhiteBishopIcon, q: WhiteQueenIcon, k: WhiteKingIcon }
};

export const ChessPiece: React.FC<ChessPieceProps> = ({ piece }) => {
    const PieceComponent = PIECE_MAP[piece.color][piece.type];
    
    return (
        <div className="w-full h-full p-1 z-10">
            <PieceComponent className="w-full h-full drop-shadow-lg" />
        </div>
    );
};