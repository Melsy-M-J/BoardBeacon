
import React from 'react';

const LudoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" opacity="0.8" />
        <rect x="4" y="14" width="6" height="6" rx="1" opacity="0.6" />
        <rect x="14" y="14" width="6" height="6" rx="1" opacity="0.4" />
    </svg>
);

export default LudoIcon;
