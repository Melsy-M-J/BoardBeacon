import React from 'react';

const BlackKnightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g fill="#000" stroke="#FFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M22 10c10.5 1 16.5 8 16 29H15c-2 0-9-1.5-8.5-4-5-4-4-11-4-11 0-5 2-7 2-7 1-2 5-12 5-12s3-4 5-4 5 2 5 2z"/>
            <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 4-4 3-1 7-2 6-5 1-2-1-4-1-4-2-2 6-8 6-8" fill="#FFF" stroke="#FFF"/>
            <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill="#FFF" stroke="#000"/>
            <path d="M15 15.5c-1.5 2.5-3 5-3 5" fill="none" stroke="#FFF"/>
        </g>
    </svg>
);

export default BlackKnightIcon;