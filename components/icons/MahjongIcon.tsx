
import React from 'react';

const MahjongIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="7" y="5" width="10" height="14" rx="1" fill="currentColor" opacity="0.2" />
        <circle cx="12" cy="9" r="2" fill="currentColor" />
        <rect x="9" y="13" width="6" height="4" rx="1" fill="currentColor" />
    </svg>
);

export default MahjongIcon;
