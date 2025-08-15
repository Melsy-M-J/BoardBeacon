import React from 'react';
import RedPieceIcon from './RedPieceIcon';

const RedKingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
        <RedPieceIcon />
        <text x="50" y="68" fontSize="40" fill="yellow" textAnchor="middle" stroke="black" strokeWidth="1">👑</text>
    </svg>
);

export default RedKingIcon;
