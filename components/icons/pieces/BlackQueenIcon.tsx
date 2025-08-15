import React from 'react';

const BlackQueenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g fill="#000" stroke="#FFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/>
            <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15L15.5 11V25L8 14l2 12z" strokeLinecap="butt"/>
            <path d="M9 26c0 2 1.5 4 1.5 4 5 3.5 18 3.5 23 0 0 0 1.5-2 1.5-4" fill="none" stroke="#FFF"/>
            <path d="M11.5 30c5.5 3.5 16.5 3.5 22 0" fill="none" stroke="#FFF"/>
            <path d="M11.5 33c5.5 3.5 16.5 3.5 22 0" fill="none" stroke="#FFF"/>
            <path d="M12.5 36c5.5 3.5 14.5 3.5 20 0" fill="none" stroke="#FFF"/>
        </g>
    </svg>
);

export default BlackQueenIcon;