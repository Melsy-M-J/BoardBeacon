import React from 'react';

const BlackPieceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <radialGradient id="blackGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style={{stopColor: 'rgb(100,100,100)', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: 'rgb(0,0,0)', stopOpacity: 1}} />
            </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="url(#blackGradient)" stroke="#000000" strokeWidth="3" />
    </svg>
);

export default BlackPieceIcon;
