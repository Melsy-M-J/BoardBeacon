import React from 'react';

const GoldTrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
        <defs>
            <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FFA500" />
            </linearGradient>
        </defs>
        <path d="M19 4h-2V2h-2v2H9V2H7v2H5c-1.1 0-2 .9-2 2v2c0 3.87 3.13 7 7 7s7-3.13 7-7V6c0-1.1-.9-2-2-2zm-7 12c-2.76 0-5-2.24-5-5h10c0 2.76-2.24 5-5 5z" fill="url(#gold-gradient)" />
        <path d="M10 20h4v2h-4z" fill="url(#gold-gradient)" />
        <path d="M8 18h8v2H8z" fill="url(#gold-gradient)" />
    </svg>
);

export default GoldTrophyIcon;