import React from 'react';

export const LudoPieceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g stroke="rgba(0,0,0,0.5)" strokeWidth="1.5">
            <circle cx="20" cy="10" r="7" />
            <path d="M 14,20 C 14,20 12,24 12,28 C 12,32 14,35 20,35 C 26,35 28,32 28,28 C 28,24 26,20 26,20 Z" />
            <rect x="12" y="34" width="16" height="3" rx="1.5" />
        </g>
    </svg>
);
