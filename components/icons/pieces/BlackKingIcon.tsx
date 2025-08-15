import React from 'react';
import BlackPieceIcon from './BlackPieceIcon';

export const BlackCheckersKingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
        <BlackPieceIcon />
        <text x="50" y="68" fontSize="40" fill="yellow" textAnchor="middle" stroke="black" strokeWidth="1">👑</text>
    </svg>
);

export const BlackChessKingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g fill="#000" stroke="#FFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M22.5 11.63V6M20 8h5"/>
            <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" strokeLinecap="butt"/>
            <path d="M12.5 37c5.5-8 14.5-8 20 0" fill="none" stroke="#FFF"/>
            <path d="M12.5 30c5.5-8 14.5-8 20 0" fill="none" stroke="#FFF"/>
            <path d="M12.5 33.5c5.5-8 14.5-8 20 0" fill="none" stroke="#FFF"/>
            <path d="M11.5 38.5a25 25 0 0 0 22 0" fill="none" stroke="#FFF"/>
            <path d="M11.5 29.5a25 25 0 0 1 22 0" fill="none" stroke="#FFF"/>
            <path d="M11.5 32.5a25 25 0 0 1 22 0" fill="none" stroke="#FFF"/>
            <path d="M11.5 35.5a25 25 0 0 1 22 0" fill="none" stroke="#FFF"/>
            <path d="M22.5 25C18 24.5 15 22.5 15 22.5c-2.5-2-2.5-4 0-4 2.5 0 2.5 2 2.5 2s4.5-2.5 5-2.5c-.5-2.5-5-2.5-5-2.5s-1.5-1.5 0-2.5c1.5-1 3.5-1 3.5-1s1 .5 1 2.5c0 2-1 2.5-1 2.5s4.5 0 5 2.5c.5 2.5-5 2.5-5 2.5s-1.5 1.5 0 2.5c1.5 1 3.5 1 3.5 1s2.5 0 2.5-2c0-2-2.5-2-2.5-2-2.5-2-2.5-4 0-4 2.5 0 2.5 2 2.5 2s4 1.5 4 4.5c0 0-3 2-7.5 2.5" fill="#000" stroke="#000"/>
            <path d="M15 22.5s-2.5-2-2.5-4 2.5-4 2.5-4 3 1.5 3 4.5c0 0-2.5 2-5.5 2.5" fill="#000" stroke="#000"/>
            <path d="M30 22.5s2.5-2 2.5-4-2.5-4-2.5-4-3 1.5-3 4.5c0 0 2.5 2 5.5 2.5" fill="#000" stroke="#000"/>
        </g>
    </svg>
);

export default BlackChessKingIcon;
