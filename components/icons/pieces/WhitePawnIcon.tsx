import React from 'react';

const WhitePawnIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g fill="#FFF" stroke="#000" strokeLinecap="round" strokeWidth="1.5">
            <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 2.21 1.79 4 4 4s4-1.79 4-4c0-2.21-1.79-4-4-4z"/>
            <path d="M22.5 28c-4.42 0-8-8-8-8s3.58-8 8-8 8 8 8 8-3.58 8-8 8z" strokeLinejoin="round"/>
            <path d="M14.5 36h16" strokeLinejoin="round"/>
            <path d="M12.5 38.5h20" strokeLinejoin="round"/>
            <path d="M22.5 28v8.5" strokeLinejoin="round"/>
        </g>
    </svg>
);

export default WhitePawnIcon;