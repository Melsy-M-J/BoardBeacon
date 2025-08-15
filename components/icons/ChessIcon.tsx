
import React from 'react';

const ChessIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2C10.8954 2 10 2.89543 10 4V6H14V4C14 2.89543 13.1046 2 12 2Z" />
        <path d="M5 7L6 14H18L19 7H5Z" />
        <path d="M6 15V20H8V18H16V20H18V15H6Z" />
        <path d="M4 21H20V22H4V21Z" />
    </svg>
);

export default ChessIcon;
