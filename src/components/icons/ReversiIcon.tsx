import React from 'react';

const ReversiIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" />
        <path d="M12 4a8 8 0 000 16z" opacity="0.5" />
    </svg>
);

export default ReversiIcon;