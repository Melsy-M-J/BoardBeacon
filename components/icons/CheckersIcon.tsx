
import React from 'react';

const CheckersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <circle cx="8" cy="8" r="4" />
        <circle cx="16" cy="16" r="4" opacity="0.7" />
    </svg>
);

export default CheckersIcon;
