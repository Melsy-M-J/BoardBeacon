
import React from 'react';

const TicTacToeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="4" y1="4" x2="20" y2="20" />
        <line x1="20" y1="4" x2="4" y2="20" />
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" opacity="0.5" />
    </svg>
);

export default TicTacToeIcon;
